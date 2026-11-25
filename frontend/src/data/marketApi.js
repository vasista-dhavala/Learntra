const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) { let message = `API request failed (${response.status})`; try { message = (await response.json()).detail || message; } catch {} throw new Error(message); }
  return response.json();
}
export const marketApi = {
  search: (q) => apiGet(`/stocks/search?q=${encodeURIComponent(q)}`),
  quotes: (symbols) => apiGet(`/stocks/market-data?symbols=${encodeURIComponent(symbols.join(","))}`),
  history: (symbol, period="1mo") => apiGet(`/stocks/${encodeURIComponent(symbol)}/history?period=${period}`),
};
