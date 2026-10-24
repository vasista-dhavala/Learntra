/**
 * Shared helpers used across multiple page components.
 * Extracted here to avoid duplication between Pages.jsx and FinancePages.jsx.
 */

/**
 * Format a number as Indian Rupees (₹).
 * Handles negative numbers with a leading minus sign.
 */
export const inr = (n) =>
  (n < 0 ? "-" : "") +
  "₹" +
  Math.abs(Number(n)).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/**
 * Signed INR — prepends "+" for non-negative values.
 */
export const sgn = (n) => (n >= 0 ? "+" : "") + inr(n);

/**
 * Percentage change badge (green for positive, red for negative).
 */
export const Chg = ({ c }) => (
  <span className={c >= 0 ? "up" : "dn"}>
    {c >= 0 ? "+" : ""}
    {c.toFixed(2)}%
  </span>
);

/**
 * Demo disclaimer shown on simulation pages.
 */
export const Demo = () => (
  <p className="tiny">
    Simulated demo data. No real money, brokerage or live market feed.
  </p>
);

/**
 * Page heading with title + subtitle.
 */
export const Head = ({ t, s }) => (
  <>
    <h1>{t}</h1>
    <p className="mu">{s}</p>
  </>
);

/**
 * Small stat card.
 */
export const Stat = ({ l, v, c }) => (
  <div className="card">
    <div className="tiny">{l}</div>
    <div className="big" style={{ color: c }}>
      {v}
    </div>
  </div>
);
