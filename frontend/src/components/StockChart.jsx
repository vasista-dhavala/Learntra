import { useMemo } from "react";
export default function StockChart({
  h = 170,
  lo = 24550,
  hi = 25050,
  n = 44,
  seed = 7,
  up = true,
  history,
}) {
  const c = useMemo(() => {
    if (history?.length) {
      const maxVolume = Math.max(...history.map((item) => item.volume || 0), 1);
      return history.map((item) => ({
        o: item.open,
        c: item.close,
        h: item.high,
        l: item.low,
        v: (item.volume || 0) / maxVolume,
        date: item.date,
      }));
    }

    let s = seed,
      r = () => (s = (s * 16807) % 2147483647) / 2147483647,
      p = 24650,
      a = [];
    for (let i = 0; i < n; i++) {
      const o = p,
        cl = o + (r() - (up ? 0.4 : 0.6)) * 60 + (up ? 3 : -3);
      a.push({
        o,
        c: cl,
        h: Math.max(o, cl) + r() * 25,
        l: Math.min(o, cl) - r() * 25,
        v: r(),
      });
      p = cl;
    }
    return a;
  }, [history, n, seed, up]);
  const W = 440,
    dataLow = history?.length ? Math.min(...c.map((item) => item.l)) : lo,
    dataHigh = history?.length ? Math.max(...c.map((item) => item.h)) : hi,
    padding = Math.max((dataHigh - dataLow) * 0.08, dataHigh * 0.002),
    chartLow = history?.length ? dataLow - padding : lo,
    chartHigh = history?.length ? dataHigh + padding : hi,
    pointCount = c.length,
    candleWidth = Math.max(3, Math.min(9, ((W - 70) / pointCount) * 0.55)),
    y = (v) => 8 + (1 - (v - chartLow) / (chartHigh - chartLow)) * (h - 40),
    x = (i) => 10 + (i * (W - 70)) / Math.max(1, pointCount - 1);
  const axisLabels = history?.length
    ? Array.from({ length: 6 }, (_, index) => {
        const item = c[Math.round((index * (pointCount - 1)) / 5)];
        return item
          ? new Date(`${item.date}T00:00:00`).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })
          : "";
      })
    : ["09:15", "10:30", "11:30", "12:30", "13:30", "15:00"];

  return (
    <svg
      viewBox={`0 0 ${W} ${h}`}
      width="100%"
      role="img"
      aria-label={
        history?.length
          ? "Historical stock price candlestick chart"
          : "Candlestick chart"
      }
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line
            x1="0"
            x2={W - 50}
            y1={y(chartHigh - (i * (chartHigh - chartLow)) / 4)}
            y2={y(chartHigh - (i * (chartHigh - chartLow)) / 4)}
            stroke="#e8eef8"
          />
          <text
            x={W - 4}
            y={y(chartHigh - (i * (chartHigh - chartLow)) / 4) + 3}
            fontSize="9"
            fill="#93a0bd"
            textAnchor="end"
          >
            {Math.round(chartHigh - (i * (chartHigh - chartLow)) / 4).toLocaleString()}
          </text>
        </g>
      ))}
      {c.map((k, i) => {
        const g = k.c >= k.o,
          col = g ? "#22c55e" : "#ef4444";
        return (
          <g key={i}>
            <rect
              x={x(i) - 2}
              y={h - 28 - k.v * 14}
              width="4"
              height={k.v * 14}
              fill={col}
              opacity=".3"
            />
            <line x1={x(i)} x2={x(i)} y1={y(k.h)} y2={y(k.l)} stroke={col} />
            <rect
              x={x(i) - candleWidth / 2}
              y={y(Math.max(k.o, k.c))}
              width={candleWidth}
              height={Math.max(2, Math.abs(y(k.o) - y(k.c)))}
              fill={col}
            />
          </g>
        );
      })}
      {axisLabels.map((t, i) => (
        <text
          key={`${t}-${i}`}
          x={10 + (i * (W - 70)) / 5}
          y={h - 4}
          fontSize="9"
          fill="#93a0bd"
          textAnchor="middle"
        >
          {t}
        </text>
      ))}
    </svg>
  );
}
export const Spark = ({ up = true, w = 60, h = 20 }) => (
  <svg width={w} height={h} viewBox="0 0 60 20">
    <path
      d={
        up
          ? "M0 16 L10 12 L18 14 L28 8 L38 10 L48 4 L60 3"
          : "M0 4 L12 8 L20 6 L32 12 L42 10 L52 16 L60 15"
      }
      fill="none"
      stroke={up ? "#22c55e" : "#ef4444"}
      strokeWidth="1.5"
    />
  </svg>
);
