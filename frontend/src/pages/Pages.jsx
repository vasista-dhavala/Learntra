import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState, useEffect } from "react";
import StockChart, { Spark } from "../components/StockChart.jsx";
import {
  movers,
  lessons,
  indices,
  assets,
  stocks,
  popular,
  topics,
} from "../data/data.js";
import {
  usePortfolio,
  trade,
  resetPortfolio,
} from "../data/store.js";
import { useMarketHistory, useMarketQuotes } from "../data/useMarketData.js";
import { loginUser, logoutUser, registerUser, useAuth } from "../data/auth.js";
import { inr, sgn, Chg, Demo, Head, Stat } from "../utils/helpers.jsx";
import "./Pages.css";
const Table = ({ rows }) => (
  <div className="card">
    {rows.map((r) => (
      <div className="row" key={r[0]}>
        <span>{r[0]}</span>
        <span>{r[1]}</span>
        <Chg c={r[2]} />
      </div>
    ))}
  </div>
);

export function Invest() {
  const [q, setQ] = useState("");
  const P = usePortfolio();
  const f = assets.filter((a) => a[0].toLowerCase().includes(q.toLowerCase()));
  const { quotes, loading, error, updatedAt } = useMarketQuotes(f.map((asset) => asset[0]));
  const quotePrice = (symbol) => quotes[symbol]?.price;
  return (
    <main className="wrap page">
      <Head
        t="Investment Dashboard"
        s="Practice with virtual money. Nothing here is real."
      />
      <div className="g3">
        <Stat l="Portfolio value" v={inr(P.val)} />
        <Stat l="Available virtual cash" v={inr(P.st.cash)} />
        <Stat
          l="Total profit / loss"
          v={sgn(P.total)}
          c={P.total >= 0 ? "var(--gr)" : "var(--rd)"}
        />
      </div>
      <div className="g2">
        <div className="card">
          <b>Market data</b> <span className="mu">{loading ? "Loading quotes…" : "Backend quotes"}</span>
          {error && <p className="dn tiny">{error}</p>}
          {updatedAt && <p className="tiny">Last updated {updatedAt.toLocaleTimeString()} · provider data may be delayed</p>}
          <div className="cta" style={{ marginTop: 10 }}>
            <Link to="/invest/simulation" className="btn g sm">
              Buy
            </Link>
            <Link to="/invest/simulation" className="btn s sm">
              Sell
            </Link>
            <Link to="/invest/simulation" className="btn p sm">
              Start Simulation
            </Link>
            <Link to="/portfolio" className="btn sm">
              My Portfolio
            </Link>
          </div>
        </div>
        <div className="card">
          <b>Watchlist</b>
          <input
            placeholder="Search assets"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ margin: "10px 0" }}
          />
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {f.map((a) => (
              <Link
                className="row"
                to={`/invest/simulation?asset=${a[0]}`}
                key={a[0]}
              >
                <span>{a[0]}</span>
                <span>{quotePrice(a[0]) != null ? inr(quotePrice(a[0])) : "Unavailable"}</span>
                {quotes[a[0]]?.change_percent != null ? <Chg c={quotes[a[0]].change_percent} /> : <span className="mu">—</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="g2">
        <div>
          <h3>Top movers</h3>
          <Table rows={movers.map((m) => [m.s, quotePrice(m.s) != null ? inr(quotePrice(m.s)) : "Unavailable", quotes[m.s]?.change_percent])} />
        </div>
        <div>
          <h3>Recent transactions</h3>
          <div className="card">
            {P.st.log.length ? (
              P.st.log.slice(0, 5).map((t, i) => (
                <div className="row" key={i}>
                  <span className={t.side === "BUY" ? "up" : "dn"}>
                    {t.side} {t.sym} ×{t.qty}
                  </span>
                  <span>{inr(t.qty * t.price)}</span>
                </div>
              ))
            ) : (
              <p className="tiny">No trades yet. Start a simulation.</p>
            )}
          </div>
        </div>
      </div>
      <Demo />
    </main>
  );
}

export function Simulation() {
  const [sp] = useSearchParams();
  const P = usePortfolio();
  const { st } = P;
  const indianStocks = stocks;
  const indianAssets = indianStocks.map((stock) => [stock.s, stock.p, stock.c]);
  const initialSymbol = indianStocks.some(
    (stock) => stock.s === sp.get("asset"),
  )
    ? sp.get("asset")
    : "TCS";
  const [activeTab, setActiveTab] = useState("Explore");
  const [query, setQuery] = useState("");
  const [watchlist, setWatchlist] = useState([
    "TCS",
    "RELIANCE",
    "HDFCBANK",
    "INFY",
  ]);
  const [selected, setSelected] = useState(
    Math.max(
      0,
      indianAssets.findIndex((a) => a[0] === initialSymbol),
    ),
  );
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("1mo");
  const quoteSymbols = [...new Set(["TCS", "RELIANCE", "HDFCBANK", "INFY", ...watchlist, indianAssets[selected]?.[0], "NIFTY 50", "SENSEX", "S&P 500", "NASDAQ"].filter(Boolean))];
  const { quotes, loading: quotesLoading, error: quotesError, updatedAt } = useMarketQuotes(quoteSymbols);
  const indianIndices = ["NIFTY 50", "SENSEX", "S&P 500", "NASDAQ"].map((name) => [name, quotes[name]?.price, quotes[name]?.change_percent]);
  const liveStocks = indianStocks.map((stock) => ({ ...stock, p: quotes[stock.s]?.price, c: quotes[stock.s]?.change_percent }));

  const current = liveStocks[selected] ? [liveStocks[selected].s, liveStocks[selected].p, liveStocks[selected].c] : indianAssets[0];
  const [symbol, basePrice, change] = current;
  const price = Number(basePrice);
  const { history, loading: historyLoading, error: historyError } = useMarketHistory(symbol, chartPeriod);
  const displayPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0 ? inr(value) : "Unavailable";
  const filteredStocks = liveStocks.filter((stock) =>
    `${stock.s} ${stock.n} ${stock.sec}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const popularIndian = ["TCS", "RELIANCE", "HDFCBANK", "INFY"]
    .map((ticker) => liveStocks.find((stock) => stock.s === ticker))
    .filter(Boolean);
  const bonds = [
    {
      name: "Navi Finserv Ltd.",
      term: "May '28",
      rate: "10.10%",
      months: "18 months",
      rating: "A+",
    },
    {
      name: "Muthoot Fincorp Ltd.",
      term: "Sep '29",
      rate: "9.10%",
      months: "34 months",
      rating: "AA",
    },
    {
      name: "Piramal Finance Ltd.",
      term: "Sep '31",
      rate: "9.15%",
      months: "58 months",
      rating: "AA+",
    },
    {
      name: "Lucina Land Development Ltd.",
      term: "Jan '29",
      rate: "13.30%",
      months: "26 months",
      rating: "A-",
    },
  ];
  const chooseStock = (ticker) => {
    const index = indianAssets.findIndex((asset) => asset[0] === ticker);
    if (index >= 0) {
      setSelected(index);
      setOrderOpen(true);
      setMessage("");
    }
  };
  // trade() is async (it saves to Supabase), so it must be awaited.
  const submitOrder = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!Number.isFinite(price) || price <= 0) {
        setError(true);
        setMessage("A current market price is required before placing an order.");
        return;
      }
      const result = await trade(side, symbol, qty, price);
      setMessage(
        result ||
          `${side === "BUY" ? "Bought" : "Sold"} ${qty} ${symbol} successfully.`,
      );
      setError(Boolean(result));
      if (!result) setQty(1);
    } finally {
      setBusy(false);
    }
  };
  const toggleWatch = (ticker) =>
    setWatchlist((list) =>
      list.includes(ticker)
        ? list.filter((item) => item !== ticker)
        : [...list, ticker],
    );

  return (
    <main className="market-page">
      <div className="market-shell">
        <div className="market-topbar">
          <div className="market-brand">
            <span className="market-brand-mark">L</span>
            <b>Markets</b>
            <span>Stocks</span>
            <span>ETFs</span>
            <span>Bonds</span>
          </div>
          <label className="market-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks, ETFs and companies"
            />
          </label>
          <div className="market-top-actions">
            <span className="market-live-dot" /> <span>{quotesLoading ? "Refreshing prices…" : "Backend market data"}</span>
            <Link to="/portfolio" className="market-avatar">
              P
            </Link>
          </div>
        </div>

        <div className="market-subnav">
          {[
            ["Explore", "Explore"],
            ["Holdings", "Holdings"],
            ["Orders", "Orders"],
            ["Watchlist", "Watchlist"],
          ].map(([label, value]) => (
            <button
              key={value}
              className={activeTab === value ? "active" : ""}
              onClick={() => setActiveTab(value)}
            >
              {label}
            </button>
          ))}
          <Link to="/portfolio" className="market-terminal-link">
            Portfolio ↗
          </Link>
        </div>

        <div className="market-ticker" aria-label="Market indices">
          {indianIndices.map(([name, value, move]) => (
            <div className="market-ticker-item" key={name}>
              <b>{name}</b>
              <span>{displayPrice(value)}</span>
              {move != null && <strong className={move >= 0 ? "up" : "dn"}>{move >= 0 ? "+" : ""}{Number(move).toFixed(2)}%</strong>}
            </div>
          ))}
        </div>
        {quotesError && <div className="market-api-error" role="alert">Market data unavailable: {quotesError}</div>}
        {updatedAt && <p className="market-muted" style={{ marginTop: 10 }}>Prices last refreshed {updatedAt.toLocaleTimeString()}. Provider data may be delayed.</p>}

        {activeTab === "Explore" && (
          <div className="market-layout">
            <section className="market-main-column">
              <div className="market-section-heading">
                <div>
                  <span className="market-eyebrow">
                    <i /> BACKEND MARKET DATA
                  </span>
                  <h1>Popular Indian Stocks &amp; ETFs</h1>
                </div>
                <button onClick={() => setQuery("")} className="market-see-all">
                  See all ↗
                </button>
              </div>
              {query.trim() ? (
                <>
                  <div className="market-section-heading">
                    <h2>Search results</h2>
                    <span className="market-muted">
                      {filteredStocks.length} Indian stocks found
                    </span>
                  </div>
                  <div className="market-list-card">
                    {filteredStocks.length ? (
                      filteredStocks.map((stock) => (
                        <button
                          className="market-list-row"
                          key={stock.s}
                          onClick={() => chooseStock(stock.s)}
                        >
                          <span className="market-list-symbol">
                            {stock.s.slice(0, 2)}
                          </span>
                          <span className="market-list-name">
                            <b>{stock.n}</b>
                            <small>
                              {stock.s} · {stock.sec}
                            </small>
                          </span>
                          <span className="market-list-price">
                            {displayPrice(stock.p)}
                          </span>
                          <span className={stock.c >= 0 ? "up" : "dn"}>
                            {stock.c == null ? "—" : `${stock.c >= 0 ? "+" : ""}${Number(stock.c).toFixed(2)}%`}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="market-empty">
                        No Indian stocks match “{query}”. Try a company name or
                        NSE ticker.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="market-stock-grid">
                    {popularIndian.map((stock) => (
                      <article className="market-stock-card" key={stock.s}>
                        <div className="market-stock-logo">
                          {stock.s.slice(0, 2)}
                        </div>
                        <div className="market-stock-name">{stock.n}</div>
                        <div className="market-stock-ticker">{stock.s}</div>
                        <div className="market-stock-price">{displayPrice(stock.p)}</div>
                        <div
                          className={
                            stock.c >= 0
                              ? "market-stock-change up"
                              : "market-stock-change dn"
                          }
                        >
                          {stock.c == null ? "—" : `${stock.c >= 0 ? "+" : ""}${Number(stock.c).toFixed(2)}%`}
                        </div>
                        <div className="market-card-actions">
                          <button onClick={() => toggleWatch(stock.s)}>
                            {watchlist.includes(stock.s)
                              ? "★ Saved"
                              : "☆ Watch"}
                          </button>
                          <button onClick={() => chooseStock(stock.s)}>
                            Trade
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="market-section-heading market-bond-heading">
                    <h2>♧ Popular Bonds</h2>
                    <button
                      className="market-see-all"
                      onClick={() => setActiveTab("Explore")}
                    >
                      See more ›
                    </button>
                  </div>
                  <div className="market-bond-grid">
                    {bonds.map((bond) => (
                      <article className="market-bond-card" key={bond.name}>
                        <div className="market-bond-logo">▤</div>
                        <b>
                          {bond.name} {bond.term}
                        </b>
                        <strong>{bond.rate}</strong>
                        <div className="market-bond-meta">
                          <span>{bond.months}</span>
                          <span>
                            {bond.rating} <i />
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="market-section-heading">
                    <h2>Explore Indian stocks</h2>
                    <span className="market-muted">
                      {filteredStocks.length} assets
                    </span>
                  </div>
                  <div className="market-list-card">
                    {filteredStocks.slice(0, 8).map((stock) => (
                      <button
                        className="market-list-row"
                        key={stock.s}
                        onClick={() => chooseStock(stock.s)}
                      >
                        <span className="market-list-symbol">
                          {stock.s.slice(0, 2)}
                        </span>
                        <span className="market-list-name">
                          <b>{stock.n}</b>
                          <small>
                            {stock.s} · {stock.sec}
                          </small>
                        </span>
                        <span className="market-list-price">
                          {displayPrice(stock.p)}
                        </span>
                        <span className={stock.c >= 0 ? "up" : "dn"}>
                          {stock.c == null ? "—" : `${stock.c >= 0 ? "+" : ""}${Number(stock.c).toFixed(2)}%`}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            <aside className="market-side-column">
              <h2>Your investments</h2>
              <div className="market-investment-card">
                <span className="market-muted">Current account value</span>
                <strong className="market-account-value">{inr(P.eq)}</strong>
                <div className="market-investment-row">
                  <span>Today's returns</span>
                  <b className={P.unreal >= 0 ? "up" : "dn"}>{sgn(P.unreal)}</b>
                </div>
                <div className="market-investment-row">
                  <span>Total returns</span>
                  <b className={P.total >= 0 ? "up" : "dn"}>
                    {sgn(P.total)} ({((P.total / P.start) * 100).toFixed(2)}%)
                  </b>
                </div>
                <div className="market-investment-row">
                  <span>Invested</span>
                  <b>{inr(P.val)}</b>
                </div>
                <div className="market-investment-row">
                  <span>Available cash</span>
                  <b>{inr(st.cash)}</b>
                </div>
                <Link to="/portfolio" className="market-full-link">
                  View portfolio ↗
                </Link>
              </div>
              <h2 className="market-tools-title">Products &amp; Tools</h2>
              <div className="market-tools-card">
                {[
                  ["📣", "IPOs", "/investing/ipos", "Explore new listings"],
                  ["▤", "Bonds", "/investing/bonds", "Fixed-income options"],
                  [
                    "＄",
                    "Indian Stocks",
                    "/investing/stocks",
                    "NSE & BSE companies",
                  ],
                  [
                    "▥",
                    "Indian ETFs",
                    "/investing/stocks",
                    "Nifty & Sensex funds",
                  ],
                  [
                    "⌁",
                    "Trading",
                    "/investing/trading",
                    "Learn trading basics",
                  ],
                ].map(([icon, name, path, detail]) => (
                  <Link to={path} className="market-tool-row" key={name}>
                    <span>{icon}</span>
                    <b>{name}</b>
                    <small>{detail}</small>
                    <span className="market-tool-arrow">›</span>
                  </Link>
                ))}
              </div>
              <div className="market-disclaimer">
                Prices are supplied by the backend provider and may be delayed. Virtual money only.
              </div>
            </aside>
          </div>
        )}

        {activeTab !== "Explore" && (
          <section className="market-tab-content">
            <div className="market-section-heading">
              <div>
                <span className="market-eyebrow">YOUR SIMULATION</span>
                <h1>{activeTab}</h1>
              </div>
              <Link to="/portfolio" className="market-see-all">
                Full portfolio ↗
              </Link>
            </div>
            {activeTab === "Watchlist" ? (
              <div className="market-list-card">
                {watchlist.length ? (
                  watchlist.map((ticker) => {
                    const stock = liveStocks.find(
                      (item) => item.s === ticker,
                    );
                    return stock ? (
                      <div className="market-list-row" key={ticker}>
                        <span className="market-list-symbol">
                          {ticker.slice(0, 2)}
                        </span>
                        <span className="market-list-name">
                          <b>{stock.n}</b>
                          <small>{ticker}</small>
                        </span>
                        <span className="market-list-price">
                          {displayPrice(stock.p)}
                        </span>
                        <button onClick={() => toggleWatch(ticker)}>
                          Remove
                        </button>
                        <button onClick={() => chooseStock(ticker)}>
                          Trade
                        </button>
                      </div>
                    ) : null;
                  })
                ) : (
                  <p className="market-empty">
                    Your watchlist is empty. Add Indian stocks from Explore.
                  </p>
                )}
              </div>
            ) : activeTab === "Orders" ? (
              <div className="market-list-card">
                {st.log.filter((order) =>
                  liveStocks.some((stock) => stock.s === order.sym),
                ).length ? (
                  st.log
                    .filter((order) =>
                      liveStocks.some((stock) => stock.s === order.sym),
                    )
                    .map((order, i) => (
                      <div className="market-list-row" key={`${order.t}-${i}`}>
                        <span className="market-list-symbol">
                          {order.side === "BUY" ? "↗" : "↘"}
                        </span>
                        <span className="market-list-name">
                          <b>
                            {order.side} · {order.sym}
                          </b>
                          <small>
                            {new Date(order.t).toLocaleString("en-IN")}
                          </small>
                        </span>
                        <span>{order.qty} units</span>
                        <b>{inr(order.qty * order.price)}</b>
                      </div>
                    ))
                ) : (
                  <p className="market-empty">
                    No orders yet. Your simulated trades will appear here.
                  </p>
                )}
              </div>
            ) : (
              <div className="market-list-card">
                {P.rows.filter((row) =>
                  liveStocks.some((stock) => stock.s === row.s),
                ).length ? (
                  P.rows
                    .filter((row) =>
                      liveStocks.some((stock) => stock.s === row.s),
                    )
                    .map((row) => (
                      <div className="market-list-row" key={row.s}>
                        <span className="market-list-symbol">
                          {row.s.slice(0, 2)}
                        </span>
                        <span className="market-list-name">
                          <b>{row.s}</b>
                          <small>
                            {row.q} shares · Avg. {inr(row.avg)}
                          </small>
                        </span>
                        <span className="market-list-price">{row.v == null ? "Unavailable" : inr(row.v)}</span>
                        {row.pl == null ? <b className="mu">—</b> : <b className={row.pl >= 0 ? "up" : "dn"}>{sgn(row.pl)}</b>}
                        <button onClick={() => chooseStock(row.s)}>
                          Trade
                        </button>
                      </div>
                    ))
                ) : (
                  <p className="market-empty">
                    No holdings yet. Explore stocks and place your first virtual
                    order.
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {orderOpen && (
        <div
          className="market-order-backdrop"
          onClick={() => setOrderOpen(false)}
        >
          <section
            className="market-order-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="market-order-close"
              onClick={() => setOrderOpen(false)}
            >
              ×
            </button>
            <span className="market-eyebrow">VIRTUAL ORDER</span>
            <h2>{symbol}</h2>
            <p className="market-muted">
              {displayPrice(price)} per share · {change == null ? "Change unavailable" : `${change >= 0 ? "+" : ""}${Number(change).toFixed(2)}%`}
            </p>
            <div className="market-chart-ranges">
              {[['1D', null], ['1W', null], ['1M', '1mo'], ['3M', '3mo'], ['6M', '6mo'], ['1Y', '1y'], ['5Y', '5y']].map(([label, value]) => (
                <button key={label} disabled={!value} className={chartPeriod === value ? "active" : ""} onClick={() => value && setChartPeriod(value)} title={!value ? "This backend currently provides daily history from 1 month onward." : undefined}>{label}</button>
              ))}
            </div>
            <StockChart symbol={symbol} price={price} history={history} loading={historyLoading} error={historyError} h={210} />
            <div className="market-order-tabs">
              <button
                className={side === "BUY" ? "selected buy" : ""}
                onClick={() => {
                  setSide("BUY");
                  setMessage("");
                }}
              >
                Buy
              </button>
              <button
                className={side === "SELL" ? "selected sell" : ""}
                onClick={() => {
                  setSide("SELL");
                  setMessage("");
                }}
              >
                Sell
              </button>
            </div>
            <label className="market-qty-label">
              Quantity
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Math.floor(Number(e.target.value)) || 1))
                }
              />
            </label>
            <div className="market-order-total">
              <span>Estimated value</span>
              <b>{Number.isFinite(price) ? inr(price * qty) : "Unavailable"}</b>
            </div>
            <div className="market-order-total">
              <span>Available virtual cash</span>
              <b>{inr(st.cash)}</b>
            </div>
            {message && (
              <p
                className={
                  error ? "market-order-message error" : "market-order-message"
                }
              >
                {message}
              </p>
            )}
            <button
              className={`market-submit-order ${side === "BUY" ? "buy" : "sell"}`}
              onClick={submitOrder}
              disabled={busy || !Number.isFinite(price)}
            >
              {busy ? "Placing…" : `Confirm ${side}`}
            </button>
            <p className="market-order-note">
              This is a simulated order. No real money is used.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

const Tbl = ({ head, rows, empty }) => (
  <div className="card" style={{ overflowX: "auto" }}>
    <div style={{ minWidth: 540 }}>
      <div className="row tiny">
        {head.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.length ? (
        rows.map((r, i) => (
          <div className="row" key={i}>
            {r.map((c, j) => (
              <span key={j}>{c}</span>
            ))}
          </div>
        ))
      ) : (
        <p className="tiny" style={{ padding: "10px 0" }}>
          {empty}
        </p>
      )}
    </div>
  </div>
);
const Pl = ({ v }) => <span className={v >= 0 ? "up" : "dn"}>{sgn(v)}</span>;
export function Portfolio() {
  const P = usePortfolio(),
    { st } = P;
  const col = (v) => (v >= 0 ? "var(--gr)" : "var(--rd)");
  return (
    <main className="wrap page">
      <Head
        t="My Portfolio"
        s="Your virtual balance, holdings, profit and loss, and trade history."
      />
      <div className="g3">
        <Stat l="Virtual balance (cash)" v={inr(st.cash)} />
        <Stat l="Holdings value" v={inr(P.val)} />
        <Stat l="Total account value" v={inr(P.eq)} />
      </div>
      <div className="g3">
        <Stat
          l="Total P&L"
          v={`${sgn(P.total)} (${((P.total / P.start) * 100).toFixed(2)}%)`}
          c={col(P.total)}
        />
        <Stat l="Unrealized P&L" v={sgn(P.unreal)} c={col(P.unreal)} />
        <Stat l="Realized P&L" v={sgn(st.real || 0)} c={col(st.real || 0)} />
      </div>
      <div className="cta" style={{ margin: "6px 0 18px" }}>
        <Link to="/invest/simulation" className="btn p sm">
          Trade
        </Link>
        <button
          className="btn sm"
          onClick={async () => {
            if (!window.confirm("Reset your virtual portfolio to ₹1,00,000?"))
              return;
            const error = await resetPortfolio();
            if (error) window.alert(error);
          }}
        >
          Reset portfolio
        </button>
      </div>
      <h3 style={{ marginBottom: 8 }}>Holdings</h3>
      <Tbl
        head={["Asset", "Qty", "Avg price", "Price", "Value", "P&L"]}
        empty="No holdings yet. Buy something in the simulation."
        rows={P.rows.map((r) => [
          <Link
            to={`/invest/simulation?asset=${r.s}`}
            style={{ color: "#2563eb" }}
          >
            {r.s}
          </Link>,
          r.q,
          inr(r.avg),
          r.p == null ? "Unavailable" : inr(r.p),
          r.v == null ? "Unavailable" : inr(r.v),
          r.pl == null ? "—" : <Pl v={r.pl} />,
        ])}
      />
      <h3 style={{ margin: "22px 0 8px" }}>Transaction history</h3>
      <Tbl
        head={["Time", "Type", "Asset", "Qty", "Price", "Value"]}
        empty="No transactions yet."
        rows={st.log.map((t) => [
          new Date(t.t).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          <span className={t.side === "BUY" ? "up" : "dn"}>{t.side}</span>,
          t.sym,
          t.qty,
          inr(t.price),
          inr(t.qty * t.price),
        ])}
      />
      <div style={{ marginTop: 16 }}>
        <Demo />
      </div>
    </main>
  );
}

const Bar = ({ v }) => (
  <div style={{ height: 5, background: "#e8eef8", borderRadius: 9 }}>
    <div
      style={{
        width: v + "%",
        height: "100%",
        background: "var(--pu)",
        borderRadius: 9,
      }}
    />
  </div>
);
export const LessonCard = ({ l }) => (
  <Link
    to={`/learn/lessons/${l.id}`}
    className="card"
    style={{ display: "grid", gap: 8 }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <b>{l.title}</b>
      <span className="pill">{l.level}</span>
    </div>
    <p className="mu">{l.desc}</p>
    <span className="tiny">
      {l.min} min read · {l.cat}
    </span>
    <Bar v={l.progress} />
  </Link>
);
export function Learn() {
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState([
    ["u", "What is diversification?"],
    [
      "a",
      "Diversification means spreading money across different assets so one bad result does not sink your whole portfolio.",
    ],
  ]);
  const ask = (e) => {
    e.preventDefault();
    if (!q) return;
    setMsg([
      ...msg,
      ["u", q],
      [
        "a",
        "Great question. This is a demo mentor, so replies are pre-written. Try the lessons below for a full explanation.",
      ],
    ]);
    setQ("");
  };
  const avg = Math.round(
      lessons.reduce((a, l) => a + l.progress, 0) / lessons.length,
    ),
    go = (i) =>
      document
        .getElementById("t" + i)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <main className="wrap page">
      <Head t="Learn" s="Your AI mentor and lessons, at your pace." />
      <div className="g2">
        <div className="card chat">
          {msg.map((m, i) => (
            <div key={i} className={"bub " + (m[0] === "u" ? "u" : "a")}>
              {m[1]}
            </div>
          ))}
          <form onSubmit={ask}>
            <input
              placeholder="Ask the AI mentor…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
        </div>
        <div className="card">
          <b>Progress</b>
          <div className="big">{avg}%</div>
          <Bar v={avg} />
          <p className="tiny" style={{ margin: "10px 0" }}>
            Recommended next: SIP vs Lump Sum
          </p>
          <Link to="/learn/lessons" className="btn p sm">
            View All Lessons
          </Link>
        </div>
      </div>
      <div className="cta">
        {topics.map((t, i) => (
          <button key={t.n} className="btn sm" onClick={() => go(i)}>
            {t.n}
          </button>
        ))}
      </div>
      {topics.map((t, i) => (
        <section
          key={t.n}
          id={"t" + i}
          style={{ scrollMarginTop: 90, marginTop: 30 }}
        >
          <h2>{t.n}</h2>
          <p className="mu">{t.d}</p>
          <div className="g3">
            {lessons
              .filter((l) => l.cat === t.n)
              .map((l) => (
                <LessonCard key={l.id} l={l} />
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}

export function Lessons() {
  const [q, setQ] = useState(""),
    [lv, setLv] = useState("All"),
    [c, setC] = useState("All");
  const cats = ["All", ...new Set(lessons.map((l) => l.cat))];
  const f = lessons.filter(
    (l) =>
      (lv === "All" || l.level === lv) &&
      (c === "All" || l.cat === c) &&
      l.title.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <main className="wrap page">
      <Head t="Lesson Library" s="Search and filter every lesson." />
      <div className="cta" style={{ margin: "18px 0" }}>
        <input
          style={{ maxWidth: 260 }}
          placeholder="Search lessons"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          style={{ width: 160 }}
          value={lv}
          onChange={(e) => setLv(e.target.value)}
        >
          {["All", "Beginner", "Intermediate", "Advanced"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          style={{ width: 160 }}
          value={c}
          onChange={(e) => setC(e.target.value)}
        >
          {cats.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="g3">
        {f.map((l) => (
          <LessonCard key={l.id} l={l} />
        ))}
      </div>
      {!f.length && (
        <p className="mu">No lessons match. Clear a filter to see more.</p>
      )}
    </main>
  );
}

export function LessonDetail() {
  const { id } = useParams(),
    n = +id,
    l = lessons.find((x) => x.id === n),
    [done, setDone] = useState(false);
  if (!l) return <NotFound />;
  return (
    <main className="wrap page" style={{ maxWidth: 760 }}>
      <Link to="/learn/lessons" className="mu">
        ← All lessons
      </Link>
      <h1 style={{ marginTop: 12 }}>{l.title}</h1>
      <span className="pill">
        {l.level} · {l.min} min
      </span>
      <h3 style={{ margin: "22px 0 6px" }}>Introduction</h3>
      <p className="mu">
        {l.desc} This is mock lesson content for the prototype.
      </p>
      <h3 style={{ margin: "22px 0 6px" }}>Explanation</h3>
      <p className="mu">
        Think of {l.title.toLowerCase()} as one building block of a healthy
        financial plan. Understand the idea first, then test it with virtual
        money.
      </p>
      <div className="g3">
        {[
          "Example: ₹10,000 split across 4 assets",
          "Example: a 12% return compounded for 10 years",
          "Example: reviewing a portfolio each quarter",
        ].map((e) => (
          <div className="card" key={e}>
            {e}
          </div>
        ))}
      </div>
      <h3>Key takeaways</h3>
      <ul style={{ paddingLeft: 20, margin: "8px 0 20px" }} className="mu">
        <li>Start simple.</li>
        <li>Match risk to your goals.</li>
        <li>Practice before using real money.</li>
      </ul>
      <button
        className={"btn " + (done ? "g" : "p")}
        onClick={() => setDone(!done)}
      >
        {done ? "Completed ✓" : "Mark as completed"}
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 30,
        }}
      >
        {n > 1 ? (
          <Link className="btn" to={`/learn/lessons/${n - 1}`}>
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {n < lessons.length && (
          <Link className="btn" to={`/learn/lessons/${n + 1}`}>
            Next →
          </Link>
        )}
      </div>
    </main>
  );
}

export function Save() {
  const [f, setF] = useState({
      age: "20s",
      inc: 30000,
      exp: 15000,
      goal: "Buy a House",
      risk: "Moderate",
      ig: "Wealth growth",
    }),
    [plan, setPlan] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value }),
    gen = () => {
      const inc = +f.inc,
        exp = +f.exp,
        free = Math.max(0, inc - exp),
        needs = Math.min(1, exp / inc || 0);
      setPlan({
        inc,
        free,
        sv: Math.round(free * 0.5),
        iv: Math.round(free * 0.5),
        needs: Math.round(needs * 100),
        em: exp * 6,
      });
    };
  const Fl = ({ l, k, t = "text", o }) => (
    <label className="fld">
      <span>{l}</span>
      {o ? (
        <select value={f[k]} onChange={set(k)}>
          {o.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      ) : (
        <input type={t} value={f[k]} onChange={set(k)} />
      )}
    </label>
  );
  return (
    <main className="wrap page">
      <Head t="Financial Planning" s="Frontend-only estimates for learning." />
      <div className="g2">
        <div className="card">
          <Fl l="Age Group" k="age" o={["Teens", "20s", "30s", "40s", "50+"]} />
          <Fl l="Monthly Income" k="inc" t="number" />
          <Fl l="Monthly Expenses" k="exp" t="number" />
          <Fl l="Savings Goal" k="goal" />
          <Fl l="Risk Preference" k="risk" o={["Low", "Moderate", "High"]} />
          <Fl
            l="Investment Goal"
            k="ig"
            o={["Wealth growth", "Retirement", "Regular income"]}
          />
          <button
            className="btn g"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={gen}
          >
            Generate Plan
          </button>
        </div>
        <div className="card">
          <b>AI Recommended Plan</b>
          {plan ? (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              <div className="row">
                <span>Needs</span>
                <span>{plan.needs}% of income</span>
              </div>
              <div className="row">
                <span>Savings</span>
                <span>{inr(plan.sv)}/mo</span>
              </div>
              <div className="row">
                <span>Investments</span>
                <span>{inr(plan.iv)}/mo</span>
              </div>
              <div className="row">
                <span>Lifestyle</span>
                <span>{inr(Math.max(0, plan.inc - plan.free - 0))}</span>
              </div>
              <div className="row">
                <span>Emergency fund</span>
                <span>{inr(plan.em)}</span>
              </div>
              <div className="row">
                <span>Goal: {f.goal}</span>
                <span>
                  {Math.round((plan.sv / Math.max(1, plan.inc)) * 100)}% saved
                  monthly
                </span>
              </div>
              <Bar v={Math.min(100, (plan.sv / Math.max(1, plan.inc)) * 300)} />
              <p className="tiny">
                Tip: automate savings on payday. Demo estimate, not financial
                advice.
              </p>
            </div>
          ) : (
            <p className="mu" style={{ marginTop: 10 }}>
              Fill the form and select Generate Plan.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

const StockCard = ({ x }) => (
  <div className="card" style={{ display: "grid", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <div>
        <b>{x.s}</b>
        <div className="tiny">{x.n}</div>
      </div>
      <span className="pill" style={{ alignSelf: "start" }}>
        {x.sec}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
      }}
    >
      <div>
        <div className="big" style={{ margin: 0 }}>
          {inr(x.p)}
        </div>
        <Chg c={x.c} />
      </div>
      <Spark up={x.c >= 0} />
    </div>
    <Link
      to={`/invest/simulation?asset=${x.s}`}
      className="btn sm"
      style={{ justifyContent: "center" }}
    >
      Trade
    </Link>
  </div>
);
export function Markets() {
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("All");
  const list = stocks.filter(
      (s) =>
        (tab === "All" || s.r === tab) &&
        (s.s + " " + s.n).toLowerCase().includes(q.toLowerCase()),
    ),
    pop = stocks.filter((s) => popular.includes(s.s));
  return (
    <main className="wrap page">
      <Head
        t="Market Overview"
        s="Search stocks, track indices and jump into a trade."
      />
      <Demo />
      <div className="cta" style={{ margin: "18px 0" }}>
        <input
          style={{ maxWidth: 300 }}
          placeholder="Search stock or company"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="tab">
          {["All", "India", "US", "Crypto"].map((t) => (
            <button
              key={t}
              className={tab === t ? "on" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <h3>Market indices</h3>
      <div className="g3">
        {indices.map((i) => (
          <div className="card" key={i[0]}>
            <div className="tiny">{i[0]}</div>
            <div className="big">{i[1]}</div>
            <Chg c={i[2]} />
          </div>
        ))}
      </div>
      <h3>Popular stocks</h3>
      <div className="g3">
        {pop.map((s) => (
          <Link
            to={`/invest/simulation?asset=${s.s}`}
            className="card"
            key={s.s}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <b>{s.s}</b>
              <div className="tiny">{inr(s.p)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Chg c={s.c} />
              <br />
              <Spark up={s.c >= 0} w={50} />
            </div>
          </Link>
        ))}
      </div>
      <h3>Stocks ({list.length})</h3>
      {list.length ? (
        <div className="g3">
          {list.map((s) => (
            <StockCard key={s.s} x={s} />
          ))}
        </div>
      ) : (
        <p className="mu" style={{ margin: "12px 0" }}>
          No stocks match your search.
        </p>
      )}
      <div className="g2">
        <div className="card">
          <b>NIFTY 50</b>
          <StockChart />
        </div>
        <div>
          <h3>Top gainers</h3>
          <Table
            rows={[...stocks]
              .sort((a, b) => b.c - a.c)
              .slice(0, 4)
              .map((a) => [a.s, inr(a.p), a.c])}
          />
          <h3 style={{ marginTop: 16 }}>Top losers</h3>
          <Table
            rows={[...stocks]
              .sort((a, b) => a.c - b.c)
              .slice(0, 3)
              .map((a) => [a.s, inr(a.p), a.c])}
          />
        </div>
      </div>
    </main>
  );
}

export function About() {
  return (
    <main className="wrap page">
      <Head
        t="About Learntra"
        s="Our mission is to make financial confidence a skill anyone can practice."
      />
      <div className="g3">
        {[
          ["Learn", "AI mentors and bite-sized lessons."],
          ["Simulate", "Practice investing with virtual money."],
          ["Save", "Plans that fit every age group."],
        ].map((c) => (
          <div className="card" key={c[0]}>
            <h3>{c[0]}</h3>
            <p className="mu">{c[1]}</p>
          </div>
        ))}
      </div>
      <div className="g3">
        <div className="card">
          <h3>Why Learntra</h3>
          <p className="mu">
            Risk-free practice builds real habits before real money is involved.
          </p>
        </div>
        <div className="card">
          <h3>Team</h3>
          <p className="mu">
            A student-built project (placeholder team section).
          </p>
        </div>
        <div className="card">
          <h3>Technology</h3>
          <p className="mu">React, Vite, React Router and Three.js.</p>
        </div>
      </div>
      <Link to="/signup" className="btn p">
        Join Learntra
      </Link>
    </main>
  );
}

const Auth = ({ t, sw, children, to, btn, onSubmit }) => {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="wrap">
      <div className="card auth">
        <h1 style={{ fontSize: 26 }}>{t}</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setMessage("");
            try {
              const result = await onSubmit(new FormData(e.currentTarget));
              if (result?.message) setMessage(result.message);
              else nav("/profile", { replace: true });
            } catch (err) {
              setError(err.message || "Authentication failed. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {children}
          {error && <p className="dn tiny">{error}</p>}
          {message && <p className="up tiny">{message}</p>}
          <button className="btn p" style={{ justifyContent: "center" }} disabled={busy}>
            {busy ? "Please wait…" : btn}
          </button>
        </form>
        <p className="mu" style={{ marginTop: 16 }}>
          {sw[0]}{" "}
          <Link to={to} style={{ color: "#2563eb" }}>
            {sw[1]}
          </Link>
        </p>
      </div>
    </main>
  );
};
export const Login = () => (
  <Auth
    t="Log in to Learntra"
    sw={["New here?", "Sign Up"]}
    to="/signup"
    btn="Login"
    onSubmit={(form) => loginUser({ email: form.get("email"), password: form.get("password") })}
  >
    <input name="email" type="email" placeholder="Email" autoComplete="email" required />
    <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
    <label className="tiny">
      <input type="checkbox" style={{ width: "auto" }} /> Remember me
    </label>
    <span className="tiny" style={{ color: "#2563eb" }}>
      Forgot password?
    </span>
  </Auth>
);
export const Signup = () => (
  <Auth
    t="Create your account"
    sw={["Already have an account?", "Login"]}
    to="/login"
    btn="Create Account"
    onSubmit={async (form) => {
      const password = form.get("password");
      if (password !== form.get("confirmPassword")) throw new Error("Passwords do not match.");
      const user = await registerUser({ name: form.get("name"), email: form.get("email"), password, ageGroup: form.get("ageGroup") });
      return user.hasSession ? null : { message: "Check your email to confirm your account, then log in." };
    }}
  >
    <input name="name" placeholder="Name" autoComplete="name" required />
    <input name="email" type="email" placeholder="Email" autoComplete="email" required />
    <input name="password" type="password" placeholder="Password" autoComplete="new-password" minLength="6" required />
    <input name="confirmPassword" type="password" placeholder="Confirm Password" autoComplete="new-password" minLength="6" required />
    <select name="ageGroup">
      <option>Teens</option>
      <option>20s</option>
      <option>30s</option>
      <option>40s+</option>
    </select>
  </Auth>
);
export const NotFound = () => (
  <main
    className="wrap page"
    style={{ textAlign: "center", padding: "120px 0" }}
  >
    <h1>Page Not Found</h1>
    <p className="mu" style={{ margin: "10px 0 24px" }}>
      That page does not exist.
    </p>
    <Link to="/" className="btn p">
      Back to Home
    </Link>
  </main>
);

export function Profile() {
  const user = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setBusy(true);
    setError("");

    try {
      await logoutUser();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log out.");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <main className="wrap page">
        <Head t="Your Profile" s="Log in to view your Learntra account." />
        <div className="card">
          <Link to="/login" className="btn p">
            Login
          </Link>
          <Link to="/signup" className="btn">
            Create Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap page">
      <Head
        t={`Welcome, ${user.name || "Learner"}!`}
        s="Your personal Learntra account dashboard."
      />

      {/* PROFILE DETAILS */}
      <div className="card" style={{ maxWidth: 700 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#2563eb",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {(user.name || "L").charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>{user.name || "Learntra Learner"}</h2>
            <p className="mu" style={{ margin: "5px 0" }}>
              {user.email}
            </p>
          </div>
        </div>

        <hr style={{ margin: "20px 0", opacity: 0.2 }} />

        <div className="row">
          <span>Full Name</span>
          <b>{user.name || "Not provided"}</b>
        </div>

        <div className="row">
          <span>Email Address</span>
          <b>{user.email}</b>
        </div>

        <div className="row">
          <span>Age Group</span>
          <b>{user.ageGroup || "Not provided"}</b>
        </div>

        <div className="row">
          <span>Account ID</span>
          <span className="tiny">{user.id}</span>
        </div>
      </div>

      {/* QUICK LINKS */}
      <h3 style={{ marginTop: 24 }}>Quick Access</h3>

      <div className="g3">
        <Link to="/invest" className="card">
          <h3>Investment Dashboard</h3>
          <p className="mu">Explore markets and investment simulations.</p>
        </Link>

        <Link to="/portfolio" className="card">
          <h3>My Portfolio</h3>
          <p className="mu">View virtual holdings and performance.</p>
        </Link>

        <Link to="/personal-finance/financial-plan" className="card">
          <h3>Financial Planning</h3>
          <p className="mu">Create your financial plan.</p>
        </Link>
      </div>

      {/* LOGOUT */}
      <div className="card" style={{ marginTop: 24 }}>
        {error && <p className="dn">{error}</p>}

        <button className="btn p" onClick={handleLogout} disabled={busy}>
          {busy ? "Logging out..." : "Log Out"}
        </button>
      </div>
    </main>
  );
}
