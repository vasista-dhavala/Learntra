import { useSyncExternalStore, useState, useEffect } from "react";
import { assets } from "./data.js";
const KEY = "finsim-portfolio",
  START = 100000,
  init = { cash: START, real: 0, hold: {}, log: [] };
let st = (() => {
  try {
    return { ...init, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return init;
  }
})();
const subs = new Set(),
  emit = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(st));
    } catch {}
    subs.forEach((f) => f());
  };
export const useStore = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => st,
  );
// returns '' on success, otherwise an error message
export function trade(side, sym, qty, price) {
  if (!(qty > 0)) return "Enter a valid quantity.";
  const total = qty * price,
    h = st.hold[sym] || { q: 0, avg: 0 };
  let hold = { ...st.hold },
    cash = st.cash,
    real = st.real || 0;
  if (side === "BUY") {
    if (total > cash) return "Not enough virtual cash.";
    const q = h.q + qty;
    hold[sym] = { q, avg: (h.avg * h.q + total) / q };
    cash -= total;
  } else {
    if (h.q < qty) return "You do not hold that many shares.";
    real += (price - h.avg) * qty;
    cash += total;
    const q = h.q - qty;
    if (q === 0) delete hold[sym];
    else hold[sym] = { q, avg: h.avg };
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
  st = init;
  emit();
};
// mock price feed: base price with a small deterministic wobble that changes every few seconds
export const livePrice = (b, i, t) =>
  b * (1 + 0.005 * Math.sin(t * 0.7 + i * 1.7));
export const useTick = () => {
  const [t, s] = useState(0);
  useEffect(() => {
    const id = setInterval(() => s((x) => x + 1), 3000);
    return () => clearInterval(id);
  }, []);
  return t;
};
export function usePortfolio() {
  const st = useStore(),
    tick = useTick();
  const rows = Object.entries(st.hold).map(([s, h]) => {
    const i = Math.max(
        0,
        assets.findIndex((a) => a[0] === s),
      ),
      p = livePrice(assets[i][1], i, tick);
    return { s, q: h.q, avg: h.avg, p, v: p * h.q, pl: (p - h.avg) * h.q };
  });
  const val = rows.reduce((a, r) => a + r.v, 0),
    unreal = rows.reduce((a, r) => a + r.pl, 0),
    eq = st.cash + val;
  return { st, tick, rows, val, unreal, eq, total: eq - START, start: START };
}
