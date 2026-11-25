import { useEffect, useMemo, useState } from "react";
import { marketApi } from "./marketApi.js";

const REFRESH_MS = 60_000;

export function useMarketQuotes(symbols, refreshMs = REFRESH_MS) {
  const key = useMemo(
    () => [...new Set((symbols || []).filter(Boolean).map((symbol) => symbol.toUpperCase()))].sort().join(","),
    [symbols],
  );
  const [state, setState] = useState({ quotes: {}, loading: Boolean(key), error: "", updatedAt: null });

  useEffect(() => {
    if (!key) {
      setState({ quotes: {}, loading: false, error: "", updatedAt: null });
      return undefined;
    }
    let controller;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      setState((previous) => ({ ...previous, loading: !previous.updatedAt, error: "" }));
      try {
        const payload = await marketApi.quotes(key.split(","), { signal: controller.signal });
        const quotes = Object.fromEntries((payload.results || []).map((quote) => [quote.symbol, quote]));
        if (!controller.signal.aborted) setState({ quotes, loading: false, error: "", updatedAt: new Date() });
      } catch (error) {
        if (error.name !== "AbortError") setState((previous) => ({ ...previous, loading: false, error: error.message || "Market data is unavailable." }));
      }
    };
    load();
    const id = window.setInterval(load, refreshMs);
    return () => { window.clearInterval(id); controller?.abort(); };
  }, [key, refreshMs]);
  return state;
}

export function useMarketHistory(symbol, period) {
  const [state, setState] = useState({ history: [], loading: Boolean(symbol), error: "" });
  useEffect(() => {
    if (!symbol) return undefined;
    const controller = new AbortController();
    setState({ history: [], loading: true, error: "" });
    marketApi.history(symbol, period, { signal: controller.signal })
      .then((payload) => !controller.signal.aborted && setState({ history: payload.history || [], loading: false, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ history: [], loading: false, error: error.message || "Historical data is unavailable." });
      });
    return () => controller.abort();
  }, [symbol, period]);
  return state;
}
