import { useSyncExternalStore } from "react";

const USERS_KEY = "learntra-users-v1";
const SESSION_KEY = "learntra-session-v1";

const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

// Read registered users
function readUsers() {
  try {
    const value = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

// Read current login session
function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

// Never expose password or salt to the UI
const publicUser = (user) => {
  if (!user) return null;

  const { salt, passwordHash, ...safeUser } = user;

  return safeUser;
};

// Restore logged-in user after refreshing the page
let currentUser = (() => {
  const session = readSession();

  if (!session?.id) return null;

  return publicUser(readUsers().find((user) => user.id === session.id) || null);
})();

// React authentication subscription
export const subscribeAuth = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

export const getCurrentUser = () => currentUser;

export const useAuth = () =>
  useSyncExternalStore(subscribeAuth, getCurrentUser, () => null);

// Save or clear login session
function saveSession(user) {
  currentUser = publicUser(user);

  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }

  notify();

  window.dispatchEvent(new Event("learntra-auth-change"));
}

// Convert bytes to hexadecimal
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// Hash passwords using PBKDF2
async function hashPassword(password, saltHex) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Secure password storage is unavailable. Open the app on localhost or HTTPS.",
    );
  }

  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{1,2}/g), (byte) => parseInt(byte, 16))
    : crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return {
    salt: bytesToHex(salt),
    passwordHash: bytesToHex(bits),
  };
}

// Register a new user
export async function registerUser({ name, email, password, ageGroup }) {
  const cleanEmail = email.trim().toLowerCase();

  const users = readUsers();

  if (users.some((user) => user.email === cleanEmail)) {
    throw new Error(
      "An account with this email already exists. Please log in.",
    );
  }

  const { salt, passwordHash } = await hashPassword(password);

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: cleanEmail,
    ageGroup,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash,
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));

  saveSession(user);

  return publicUser(user);
}

// Login an existing user
export async function loginUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();

  const user = readUsers().find((entry) => entry.email === cleanEmail);

  if (!user) {
    throw new Error("No account found for this email. Please sign up first.");
  }

  const { passwordHash } = await hashPassword(password, user.salt);

  if (passwordHash !== user.passwordHash) {
    throw new Error("Incorrect password. Please try again.");
  }

  saveSession(user);

  return publicUser(user);
}

// Logout current user
export function logoutUser() {
  saveSession(null);
}

// Synchronize login state across browser tabs
window.addEventListener("storage", (event) => {
  if (event.key === USERS_KEY || event.key === SESSION_KEY) {
    const session = readSession();

    currentUser = session?.id
      ? publicUser(readUsers().find((user) => user.id === session.id) || null)
      : null;

    notify();

    window.dispatchEvent(new Event("learntra-auth-change"));
  }
});
