import { useSyncExternalStore, useState, useEffect } from "react";
import { assets } from "./data.js";
import { getCurrentUser, subscribeAuth } from "./auth.js";
import { supabase } from "../lib/supabase.js";

const START = 100000;
const LEGACY_KEY = "learntra-portfolio";
const initialState = () => ({ cash: START, real: 0, hold: {}, log: [] });
let currentUserId = getCurrentUser()?.id || null;
let portfolioId = null;
let portfolioUserId = null;
let accountVersion = 0;
let portfolioVersion = 0;
let hydrationPromise = null;

const storageKey = (userId = currentUserId) =>
  userId ? `learntra-portfolio:${userId}` : "learntra-portfolio:guest";
function loadState(userId = currentUserId) {
  try {
    const stored = localStorage.getItem(storageKey(userId));
    if (stored) return { ...initialState(), ...JSON.parse(stored) };
    if (!userId && localStorage.getItem(LEGACY_KEY)) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      localStorage.setItem(storageKey(), JSON.stringify(legacy));
      return { ...initialState(), ...legacy };
    }
  } catch (error) {
    console.warn("Could not load saved portfolio:", error);
  }
  return initialState();
}
let st = loadState(currentUserId);
const subs = new Set();
const notify = () => subs.forEach((listener) => listener());
function saveLocal(userId = currentUserId) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(st));
  } catch (error) {
    console.warn("Could not save portfolio:", error);
  }
}
const emit = () => {
  saveLocal();
  notify();
};

async function getAuthUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[Supabase] Could not read the current session:", error.message);
    return null;
  }
  return data.session?.user?.id || null;
}

async function getOrCreatePortfolioId(userId, initialCash = START) {
  if (portfolioId && portfolioUserId === userId) return portfolioId;
  const { data: existing, error: selectError } = await supabase
    .from("portfolios").select("id").eq("user_id", userId).maybeSingle();
  if (selectError) throw selectError;
  if (existing) {
    portfolioId = existing.id;
    portfolioUserId = userId;
    return existing.id;
  }
  const { data: created, error: insertError } = await supabase
    .from("portfolios")
    .insert({ user_id: userId, virtual_balance: initialCash })
    .select("id").single();
  if (insertError) throw insertError;
  portfolioId = created.id;
  portfolioUserId = userId;
  return created.id;
}

async function hydrateFromSupabase(userId, version = accountVersion, stateVersion = portfolioVersion) {
  if (!userId) return;
  try {
    const pid = await getOrCreatePortfolioId(userId, START);
    const [portfolioResult, holdingsResult, transactionsResult] = await Promise.all([
      supabase.from("portfolios").select("virtual_balance").eq("id", pid).single(),
      supabase.from("holdings").select("symbol, quantity, average_price").eq("portfolio_id", pid),
      supabase.from("transactions").select("symbol, transaction_type, quantity, price, created_at")
        .eq("portfolio_id", pid).order("created_at", { ascending: false }).limit(200),
    ]);
    const error = portfolioResult.error || holdingsResult.error || transactionsResult.error;
    if (error) throw error;
    if (
      version !== accountVersion ||
      stateVersion !== portfolioVersion ||
      userId !== currentUserId
    ) return;
    const hold = {};
    for (const row of holdingsResult.data || []) {
      const quantity = Number(row.quantity);
      if (quantity > 0) hold[row.symbol] = { q: quantity, avg: Number(row.average_price) };
    }
    st = {
      cash: Number(portfolioResult.data.virtual_balance ?? START), real: 0, hold,
      log: (transactionsResult.data || []).map((tx) => ({
        t: new Date(tx.created_at).getTime(), side: tx.transaction_type, sym: tx.symbol,
        qty: Number(tx.quantity), price: Number(tx.price),
      })),
    };
    saveLocal(userId);
    notify();
  } catch (error) {
    console.error("[Supabase] Portfolio hydration failed:", error.message || error);
  }
}

function activateAccount(userId, { forceHydrate = false } = {}) {
  if (userId === currentUserId && !forceHydrate) return;
  currentUserId = userId;
  portfolioId = null;
  portfolioUserId = null;
  accountVersion += 1;
  portfolioVersion += 1;
  // Do not show a previous user's local cache while this user's database data loads.
  st = userId ? initialState() : loadState(null);
  notify();
  hydrationPromise = userId ? hydrateFromSupabase(userId, accountVersion) : null;
}
async function resolveActiveUser() {
  const userId = await getAuthUserId();
  if (userId !== currentUserId) activateAccount(userId);
  // A trade immediately after sign-in must use the hydrated cloud balance,
  // rather than a temporary empty state for that account.
  if (userId && hydrationPromise) await hydrationPromise;
  return userId;
}

async function saveHolding(portfolioIdValue, symbol, holding) {
  if (!holding || holding.q <= 0) {
    const { error } = await supabase.from("holdings").delete()
      .eq("portfolio_id", portfolioIdValue).eq("symbol", symbol);
    if (error) throw error;
    return;
  }
  // This does not depend on a conflict target. The migration adds one for race safety.
  const { data: rows, error: findError } = await supabase.from("holdings").select("id")
    .eq("portfolio_id", portfolioIdValue).eq("symbol", symbol).limit(1);
  if (findError) throw findError;
  const values = {
    portfolio_id: portfolioIdValue, symbol, quantity: holding.q,
    average_price: holding.avg, updated_at: new Date().toISOString(),
  };
  const request = rows?.[0]
    ? supabase.from("holdings").update(values).eq("id", rows[0].id)
    : supabase.from("holdings").insert(values);
  const { error } = await request;
  if (error) throw error;
}

async function persistTrade({ userId, side, sym, qty, price, total, nextCash, nextHolding }) {
  const pid = await getOrCreatePortfolioId(userId, nextCash);
  const { data: updated, error: balanceError } = await supabase.from("portfolios")
    .update({ virtual_balance: nextCash }).eq("id", pid).eq("user_id", userId).select("id");
  if (balanceError) throw balanceError;
  if (!updated?.length) throw new Error("Portfolio update was denied by RLS.");
  await saveHolding(pid, sym, nextHolding);
  const { error: transactionError } = await supabase.from("transactions").insert({
    portfolio_id: pid, symbol: sym, transaction_type: side, quantity: qty, price, total_amount: total,
  });
  if (transactionError) throw transactionError;
}

if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data, error }) => {
    if (!error) activateAccount(data.session?.user?.id || null, { forceHydrate: true });
  });
  supabase.auth.onAuthStateChange((_event, session) => activateAccount(session?.user?.id || null));
  subscribeAuth(() => activateAccount(getCurrentUser()?.id || null));
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey()) {
      st = loadState();
      notify();
    }
  });
}

export const useStore = () => useSyncExternalStore(
  (listener) => { subs.add(listener); return () => subs.delete(listener); },
  () => st,
  () => initialState()
);

// Returns an empty string on success, otherwise a user-friendly error.
export async function trade(side, sym, qty, price) {
  if (!(qty > 0) || !Number.isFinite(qty)) return "Enter a valid quantity.";
  if (!(price > 0) || !Number.isFinite(price)) return "The current price is invalid.";
  const userId = await resolveActiveUser();
  const total = qty * price;
  const holding = st.hold[sym] || { q: 0, avg: 0 };
  const hold = { ...st.hold };
  let cash = st.cash;
  let real = st.real || 0;
  if (side === "BUY") {
    if (total > cash) return "Not enough virtual cash.";
    const quantity = holding.q + qty;
    hold[sym] = { q: quantity, avg: (holding.avg * holding.q + total) / quantity };
    cash -= total;
  } else {
    if (holding.q < qty) return "You do not hold that many shares.";
    real += (price - holding.avg) * qty;
    cash += total;
    const quantity = holding.q - qty;
    if (quantity === 0) delete hold[sym];
    else hold[sym] = { q: quantity, avg: holding.avg };
  }
  if (userId) {
    try {
      await persistTrade({ userId, side, sym, qty, price, total, nextCash: cash, nextHolding: hold[sym] || null });
    } catch (error) {
      console.error("[Supabase] Trade was not saved:", error.message || error);
      return "Could not save this trade. Check Supabase RLS policies and try again.";
    }
  }
  st = { ...st, cash, real, hold, log: [{ t: Date.now(), side, sym, qty, price }, ...st.log].slice(0, 200) };
  portfolioVersion += 1;
  emit();
  return "";
}

export const resetPortfolio = async () => {
  const userId = await resolveActiveUser();
  if (userId) {
    try {
      const pid = await getOrCreatePortfolioId(userId, START);
      const [balance, holdings, transactions] = await Promise.all([
        supabase.from("portfolios").update({ virtual_balance: START }).eq("id", pid).eq("user_id", userId).select("id"),
        supabase.from("holdings").delete().eq("portfolio_id", pid),
        supabase.from("transactions").delete().eq("portfolio_id", pid),
      ]);
      const error = balance.error || holdings.error || transactions.error;
      if (error) throw error;
      if (!balance.data?.length) throw new Error("Portfolio reset was denied by RLS.");
    } catch (error) {
      console.error("[Supabase] Portfolio reset failed:", error.message || error);
      return "Could not reset the cloud portfolio. Check Supabase RLS policies and try again.";
    }
  }
  st = initialState();
  portfolioVersion += 1;
  emit();
  return "";
};

export const livePrice = (basePrice, index, tick) =>
  basePrice * (1 + 0.005 * Math.sin(tick * 0.7 + index * 1.7));
export const useTick = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 3000);
    return () => clearInterval(id);
  }, []);
  return tick;
};
export function usePortfolio() {
  const state = useStore();
  const tick = useTick();
  const rows = Object.entries(state.hold).map(([symbol, holding]) => {
    const index = Math.max(0, assets.findIndex((asset) => asset[0] === symbol));
    const price = livePrice(assets[index][1], index, tick);
    return { s: symbol, q: holding.q, avg: holding.avg, p: price, v: price * holding.q, pl: (price - holding.avg) * holding.q };
  });
  const val = rows.reduce((sum, row) => sum + row.v, 0);
  const unreal = rows.reduce((sum, row) => sum + row.pl, 0);
  const eq = state.cash + val;
  return { st: state, tick, rows, val, unreal, eq, total: eq - START, start: START };
}
