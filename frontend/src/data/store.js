import { useSyncExternalStore, useState, useEffect } from "react";
import { assets } from "./data.js";
import { getCurrentUser } from "./auth.js";

const START = 100000;
const LEGACY_KEY = "learntra-portfolio";
const initialState = () => ({ cash: START, real: 0, hold: {}, log: [] });
const storageKey = () => {
  const user = getCurrentUser();
  return user ? `learntra-portfolio:${user.id}` : "learntra-portfolio:guest";
};

function loadState() {
  try {
    const stored = localStorage.getItem(storageKey());
    if (stored) return { ...initialState(), ...JSON.parse(stored) };
    // Keep an existing pre-account demo portfolio available to visitors once.
    if (!getCurrentUser() && localStorage.getItem(LEGACY_KEY)) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      localStorage.setItem(storageKey(), JSON.stringify(legacy));
      return { ...initialState(), ...legacy };
    }
  } catch (error) {
    console.warn("Could not load saved portfolio:", error);
  }
  return initialState();
}

let st = loadState();
const subs = new Set();
const emit = () => {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(st));
  } catch (error) {
    console.warn("Could not save portfolio:", error);
  }
  subs.forEach((listener) => listener());
};
const reloadForAccount = () => {
  st = loadState();
  subs.forEach((listener) => listener());
};
if (typeof window !== "undefined") {
  window.addEventListener("learntra-auth-change", reloadForAccount);
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey()) reloadForAccount();
  });
}

export const useStore = () =>
  useSyncExternalStore(
    (listener) => {
      subs.add(listener);
      return () => subs.delete(listener);
    },
    () => st,
    () => initialState(),
  );

// Returns an empty string on success, otherwise a user-friendly error.
export function trade(side, sym, qty, price) {
  if (!(qty > 0) || !Number.isFinite(qty)) return "Enter a valid quantity.";
  if (!(price > 0) || !Number.isFinite(price)) return "The current price is invalid.";
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

  st = {
    ...st,
    cash,
    real,
    hold,
    log: [{ t: Date.now(), side, sym, qty, price }, ...st.log].slice(0, 200),
  };
  emit();
  return "";
}

export const resetPortfolio = () => {
  st = initialState();
  emit();
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
    return {
      s: symbol,
      q: holding.q,
      avg: holding.avg,
      p: price,
      v: price * holding.q,
      pl: (price - holding.avg) * holding.q,
    };
  });
  const val = rows.reduce((sum, row) => sum + row.v, 0);
  const unreal = rows.reduce((sum, row) => sum + row.pl, 0);
  const eq = state.cash + val;
  return { st: state, tick, rows, val, unreal, eq, total: eq - START, start: START };
}
