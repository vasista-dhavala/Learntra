import { useMemo, useState } from "react";

export default function StockChart({ h = 220, history = [], symbol, price, loading, error }) {
  const [hovered, setHovered] = useState(null);
  const points = useMemo(() => history.filter((item) => Number.isFinite(Number(item.close))), [history]);
  if (loading) return <div className="chart-state" style={{ height: h }}>Loading historical prices…</div>;
  if (error) return <div className="chart-state chart-error" style={{ height: h }}>{error}</div>;
  if (!points.length) return <div className="chart-state" style={{ height: h }}>No historical data is available.</div>;

  const W = 700, pad = 42;
  const low = Math.min(...points.map((item) => Number(item.low ?? item.close)));
  const high = Math.max(...points.map((item) => Number(item.high ?? item.close)));
  const gap = Math.max((high - low) * 0.08, 0.01);
  const min = low - gap, max = high + gap;
  const x = (index) => pad + (index * (W - pad * 2)) / Math.max(points.length - 1, 1);
  const y = (value) => 18 + (1 - (Number(value) - min) / (max - min)) * (h - 54);
  const path = points.map((item, index) => `${index ? "L" : "M"}${x(index)},${y(item.close)}`).join(" ");
  const point = hovered == null ? null : points[hovered];

  return <div className="stock-chart" aria-label={`${symbol || "Stock"} price history`}>
    {(symbol || price != null) && <div className="stock-chart-title"><b>{symbol}</b>{price != null && <span>{Number(price).toLocaleString()}</span>}</div>}
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img">
      {[0, 1, 2, 3].map((index) => {
        const value = max - ((max - min) * index) / 3;
        return <g key={index}><line x1={pad} x2={W - pad} y1={y(value)} y2={y(value)} stroke="#e8eef8" /><text x={W - 2} y={y(value) + 3} fontSize="10" fill="#71809b" textAnchor="end">{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</text></g>;
      })}
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      {points.map((item, index) => <circle key={item.date + index} cx={x(index)} cy={y(item.close)} r="10" fill="transparent" onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} />)}
      {point && <g pointerEvents="none"><line x1={x(hovered)} x2={x(hovered)} y1="12" y2={h - 32} stroke="#71809b" strokeDasharray="3 3" /><circle cx={x(hovered)} cy={y(point.close)} r="4" fill="#2563eb" /></g>}
    </svg>
    <div className="stock-chart-caption">{point ? `${new Date(`${point.date}T00:00:00`).toLocaleDateString()} · ${Number(point.close).toLocaleString()}` : `${points[0].date} — ${points.at(-1).date}`}</div>
  </div>;
}

export const Spark = ({ up = true, w = 60, h = 20 }) => <svg width={w} height={h} viewBox="0 0 60 20" aria-hidden="true"><path d={up ? "M0 16 L10 12 L18 14 L28 8 L38 10 L48 4 L60 3" : "M0 4 L12 8 L20 6 L32 12 L42 10 L52 16 L60 15"} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.5" /></svg>;
