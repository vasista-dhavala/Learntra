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
  livePrice,
} from "../data/store.js";
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
          <b>NIFTY 50</b> <span className="up">24,854.65 +0.68%</span>
          <StockChart />
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
                <span>{inr(a[1])}</span>
                <Chg c={a[2]} />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="g2">
        <div>
          <h3>Top movers</h3>
          <Table rows={movers.map((m) => [m.s, m.p, m.c])} />
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
  const [sp] = useSearchParams(),
    P = usePortfolio(),
    { st, tick } = P;
  const [side, setSide] = useState("BUY"),
    [sym, setSym] = useState(
      Math.max(
        0,
        assets.findIndex((a) => a[0] === sp.get("asset")),
      ),
    ),
    [qty, setQty] = useState(1),
    [ok, setOk] = useState(false),
    [err, setErr] = useState("");
  const [s, base] = assets[sym],
    p = livePrice(base, sym, tick),
    tot = p * qty,
    h = st.hold[s];
  const go = () => {
    const e = trade(side, s, qty, p);
    setErr(e);
    if (!e) {
      setOk(false);
      setQty(1);
    }
  };
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
              placeholder="Search Indian stocks and companies"
            />
          </label>
          <div className="market-top-actions">
            <span className="market-live-dot" />
            <span>Backend market data</span>
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
        <div className="market-ticker">
          {indicesLive.map(([name, value, move]) => (
            <div className="market-ticker-item" key={name}>
              <b>{name}</b>
              <span>{value}</span>
              <strong className={move >= 0 ? "up" : "dn"}>
                {move >= 0 ? "+" : ""}
                {Number(move).toFixed(2)}%
              </strong>
            </div>
          ))}
        </div>
        {apiError && (
          <div className="market-api-error" role="alert">
            {apiError}
          </div>
        )}
        {loading && <p className="market-muted">Loading Indian market data…</p>}
        {activeTab === "Explore" && (
          <div className="market-layout">
            <section className="market-main-column">
              <div className="market-section-heading">
                <div>
                  <span className="market-eyebrow">
                    <i /> BACKEND MARKET DATA
                  </span>
                  <h1>
                    {query.trim().length >= 2
                      ? "Search results"
                      : "Popular Indian Stocks"}
                  </h1>
                </div>
                <span className="market-muted">
                  {filteredStocks.length} stocks
                </span>
              </div>
              <div className="market-stock-grid">
                {(query.trim().length >= 2
                  ? filteredStocks.slice(0, 4)
                  : popularIndian
                ).map((stock) => (
                  <article className="market-stock-card" key={stock.s}>
                    <div className="market-stock-logo">
                      {stock.s.slice(0, 2)}
                    </div>
                    <div className="market-stock-name">{stock.n}</div>
                    <div className="market-stock-ticker">{stock.s} · NSE</div>
                    <div className="market-stock-price">{inr(stock.p)}</div>
                    <div
                      className={
                        stock.c >= 0
                          ? "market-stock-change up"
                          : "market-stock-change dn"
                      }
                    >
                      {stock.c >= 0 ? "+" : ""}
                      {Number(stock.c || 0).toFixed(2)}%
                    </div>
                    <div className="market-card-actions">
                      <button onClick={() => toggleWatch(stock.s)}>
                        {watchlist.includes(stock.s) ? "★ Saved" : "☆ Watch"}
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
              </div>
              <div className="market-bond-grid">
                {bonds.map((b) => (
                  <article className="market-bond-card" key={b.name}>
                    <div className="market-bond-logo">▤</div>
                    <b>
                      {b.name} {b.term}
                    </b>
                    <strong>{b.rate}</strong>
                    <div className="market-bond-meta">
                      <span>{b.months}</span>
                      <span>
                        {b.rating} <i />
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
                {filteredStocks.slice(0, 100).map((stock) => (
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
                      {stock.p ? inr(stock.p) : "—"}
                    </span>
                    <span className={stock.c >= 0 ? "up" : "dn"}>
                      {stock.c == null
                        ? "—"
                        : `${stock.c >= 0 ? "+" : ""}${Number(stock.c).toFixed(2)}%`}
                    </span>
                  </button>
                ))}
              </div>
              {query.trim().length >= 2 &&
                !searchResults.length &&
                !loading && (
                  <p className="market-empty">
                    No matching Indian stocks found.
                  </p>
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
                  ["📣", "IPOs", "/investing/ipos", "Indian listings"],
                  ["▤", "Bonds", "/investing/bonds", "Indian fixed income"],
                  ["▥", "ETFs", "/investing/stocks", "Indian funds"],
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
                Quotes come from your backend via yfinance and may be delayed.
                Virtual money only.
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
                    const stock = marketStocks.find((x) => x.s === ticker);
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
                          {inr(stock.p)}
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
                  <p className="market-empty">Your watchlist is empty.</p>
                )}
              </div>
            ) : activeTab === "Orders" ? (
              <div className="market-list-card">
                {st.log.length ? (
                  st.log.map((o, i) => (
                    <div className="market-list-row" key={`${o.t}-${i}`}>
                      <span className="market-list-symbol">
                        {o.side === "BUY" ? "↗" : "↘"}
                      </span>
                      <span className="market-list-name">
                        <b>
                          {o.side} · {o.sym}
                        </b>
                        <small>{new Date(o.t).toLocaleString("en-IN")}</small>
                      </span>
                      <span>{o.qty} shares</span>
                      <b>{inr(o.qty * o.price)}</b>
                    </div>
                  ))
                ) : (
                  <p className="market-empty">No orders yet.</p>
                )}
              </div>
            ) : (
              <div className="market-list-card">
                {P.rows.length ? (
                  P.rows.map((row) => (
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
                      <span className="market-list-price">{inr(row.v)}</span>
                      <b className={row.pl >= 0 ? "up" : "dn"}>{sgn(row.pl)}</b>
                      <button onClick={() => chooseStock(row.s)}>Trade</button>
                    </div>
                  ))
                ) : (
                  <p className="market-empty">
                    No holdings yet. Explore Indian stocks.
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
              {inr(price)} per share · {change >= 0 ? "+" : ""}
              {Number(change || 0).toFixed(2)}%
            </p>
            {history.length > 0 && (
              <p className="market-muted">
                Latest history: {history[history.length - 1].date} · Close{" "}
                {inr(history[history.length - 1].close)}
              </p>
            )}
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
              <b>{inr(price * qty)}</b>
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
            >
              Confirm {side}
            </button>
            <p className="market-order-note">
              Simulated order only. No real money is used.
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
          inr(r.p),
          inr(r.v),
          <Pl v={r.pl} />,
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

const Auth = ({ t, sw, children, to, btn }) => {
  const nav = useNavigate();
  return (
    <main className="wrap">
      <div className="card auth">
        <h1 style={{ fontSize: 26 }}>{t}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav("/invest");
          }}
        >
          {children}
          <button className="btn p" style={{ justifyContent: "center" }}>
            {btn}
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
  >
    <input type="email" placeholder="Email" required />
    <input type="password" placeholder="Password" required />
    <label className="tiny">
      <input type="checkbox" style={{ width: "auto" }} /> Remember me
    </label>
    <span className="tiny" style={{ color: "#2563eb" }}>
      Forgot password?
    </span>
    <button type="button" className="btn">
      Continue with Google
    </button>
  </Auth>
);
export const Signup = () => (
  <Auth
    t="Create your account"
    sw={["Already have an account?", "Login"]}
    to="/login"
    btn="Create Account"
  >
    <input placeholder="Name" required />
    <input type="email" placeholder="Email" required />
    <input type="password" placeholder="Password" required />
    <input type="password" placeholder="Confirm Password" required />
    <select>
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
