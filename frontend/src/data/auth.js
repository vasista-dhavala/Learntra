
import { useSyncExternalStore } from "react";
import { supabase } from "../lib/supabase.js";

let currentUser = null;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const publicUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.user_metadata?.full_name || "",
    email: user.email,
    ageGroup: user.user_metadata?.age_group || "20s",
  };
};

export const subscribeAuth = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCurrentUser = () => currentUser;

export const useAuth = () =>
  useSyncExternalStore(subscribeAuth, getCurrentUser, () => null);

// Restore session when the app starts
supabase.auth.getSession().then(({ data, error }) => {
  if (!error) {
    currentUser = publicUser(data.session?.user);
    notify();
  }
});

// Listen for login/logout/session changes
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = publicUser(session?.user);
  notify();
});

// Register
export async function registerUser({ name, email, password, ageGroup }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: name.trim(),
        age_group: ageGroup,
      },
    },
  });

  if (error) throw error;

  // If email confirmation is disabled, session is immediately available.
  if (data.session) {
    currentUser = publicUser(data.user);
    notify();
  }

  return { ...publicUser(data.user), hasSession: Boolean(data.session) };
}

// Login
export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;

  currentUser = publicUser(data.user);
  notify();

  return currentUser;
}

// Logout
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;

  currentUser = null;
  notify();
}
