import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Brain,
  PiggyBank,
  CheckCircle2,
  Rocket,
  Bot,
} from "lucide-react";
import Globe from "../components/Globe.jsx";
import StockChart, { Spark } from "../components/StockChart.jsx";
import { movers } from "../data/data.js";
import "./Home.css";
const Cards = [
  [
    "01",
    "INVEST",
    "Invest in real markets via simulation. Practice trading risk-free with virtual money.",
    "Start Investing",
    "/invest",
    TrendingUp,
    "linear-gradient(135deg,#2563eb,#3b82f6)",
    "#2563eb",
  ],
  [
    "02",
    "LEARN",
    "Learn how to invest with AI mentors. Understand markets, strategies and more.",
    "Learn with AI",
    "/learn",
    Brain,
    "linear-gradient(135deg,#0891b2,#06b6d4)",
    "#0891b2",
  ],
  [
    "03",
    "SAVE",
    "Learn how to save and manage money smartly at any age group.",
    "Build Plan",
    "/save",
    PiggyBank,
    "linear-gradient(135deg,#15803d,#22c55e)",
    "#16a34a",
  ],
];
function P({ n, t, col, sub, body, list, cols, lc, children }) {
  return (
    <section className="wrap">
      <div className="panel" style={{ "--cols": cols }}>
        <div>
          <div className="ph">
            <span className="num" style={{ background: col }}>
              {n}
            </span>
            <h2 style={{ color: lc }}>{t}</h2>
          </div>
          <p className="sub">{sub}</p>
          <p className="body">{body}</p>
          <ul className="chk">
            {list.map((l) => (
              <li key={l}>
                <CheckCircle2 size={14} color={lc} />
                {l}
              </li>
            ))}
          </ul>
        </div>
        {children}
      </div>
    </section>
  );
}
const Donut = () => {
  const seg = [
    ["#2563eb", 50],
    ["#16a34a", 20],
    ["#f59e0b", 20],
    ["#ec4899", 10],
  ];
  let o = 0;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {seg.map(([c, v]) => {
        const d = v * 2.827,
          e = (
            <circle
              key={c}
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={c}
              strokeWidth="13"
              strokeDasharray={`${d - 2} ${282.7 - d + 2}`}
              strokeDashoffset={-o * 2.827}
              transform="rotate(-90 60 60)"
            />
          );
        o += v;
        return e;
      })}
    </svg>
  );
};
export default function Home() {
  return (
    <main>
      <div className="herowrap">
        <section className="hero2">
          <div className="hbox">
            <h1>
              Learn Finance.
              <br />
              Simulate Investing.
              <br />
              Build Your <span className="grad">Future.</span>
            </h1>
            <p>
              The AI-powered platform to practice investing, learn smart
              strategies and build better money habits for life.
            </p>
            <div className="cta">
              <Link to="/invest/simulation" className="btn p">
                Start Simulation <ArrowRight size={16} />
              </Link>
              <Link to="/invest" className="btn out">
                Explore Platform
              </Link>
            </div>
          </div>
          <div className="cards3">
            {Cards.map(([n, t, d, cta, to, I, bg, c]) => (
              <div key={t} className="card fc">
                <div className="ico" style={{ background: bg }}>
                  <I size={22} />
                </div>
                <small style={{ color: c }}>{n}</small>
                <h3>{t}</h3>
                <p>{d}</p>
                <Link to={to} style={{ color: c }}>
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
          <Globe />
        </section>
      </div>
      <P
        n="01"
        t="INVEST"
        col="#2563eb"
        lc="#2563eb"
        cols="1fr 0.75fr 1.5fr"
        sub="Practice. Simulate. Grow."
        body="Use virtual money to invest in stocks, ETFs, crypto and more. Test strategies, manage your portfolio and track performance – all without financial risk."
        list={[
          "Real market data",
          "Virtual trading",
          "Portfolio analytics",
          "Risk-free practice",
        ]}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div className="card">
            <div className="tiny">Virtual Balance</div>
            <div className="big">₹1,00,000.00</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
              }}
            >
              <span className="up tiny">+₹4,250 (4.25%)</span>
              <Spark w={70} />
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, marginBottom: 6 }}>Top Movers</div>
            {movers.map((m) => (
              <div className="row" key={m.s}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <i
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: m.col,
                    }}
                  />
                  {m.s}
                </span>
                <span>{m.p}</span>
                <span className={m.c > 0 ? "up" : "dn"}>
                  {m.c > 0 ? "+" : ""}
                  {m.c.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div className="tiny">NIFTY 50</div>
              <b style={{ fontSize: 15 }}>24,854.65</b>{" "}
              <span className="up tiny">+166.35 (0.68%)</span>
            </div>
            <div className="tab">
              {["1D", "1W", "1M", "1Y"].map((t, i) => (
                <button key={t} className={i ? "" : "on"}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <StockChart />
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              to="/invest/simulation"
              className="btn g sm"
              style={{ width: 84, justifyContent: "center" }}
            >
              Buy
            </Link>
            <Link
              to="/invest/simulation"
              className="btn s sm"
              style={{ width: 84, justifyContent: "center" }}
            >
              Sell
            </Link>
          </div>
        </div>
      </P>
      <P
        n="02"
        t="LEARN"
        col="#0891b2"
        lc="#0891b2"
        cols="1fr 1.3fr 1fr"
        sub="Understand. Ask. Grow."
        body="Get your personal AI mentor anytime you want. Ask questions, understand complex topics and learn investing the smart way."
        list={[
          "AI explanations",
          "Concepts made easy",
          "Interactive learning",
          "Learn at your pace",
        ]}
      >
        <div className="card chat">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Bot size={18} color="#2563eb" />
            AI Mentor
          </div>
          <div className="bub u">Why did the NIFTY 50 fall today?</div>
          <div className="bub a">
            The NIFTY 50 fell mainly due to profit booking in IT stocks, weak
            global cues and rising US bond yields. Investors are also cautious
            ahead of upcoming economic data.
          </div>
          <div className="bub u">How can I reduce risk in my portfolio?</div>
          <div className="bub a" style={{ width: 60 }}>
            • • •
          </div>
        </div>
        <div className="card">
          <div style={{ marginBottom: 8 }}>Popular Topics</div>
          {[
            "What is a Stock?",
            "What is Diversification?",
            "How does the Stock Market work?",
            "What is P/E Ratio?",
            "How to Build a Portfolio?",
          ].map((t, i) => (
            <Link
              key={t}
              to={`/learn/lessons/${[1, 3, 2, 4, 8][i]}`}
              className="top"
            >
              <i style={{ background: "#e0e9ff" }}>
                <Rocket size={12} />
              </i>
              {t}
            </Link>
          ))}
          <Link
            to="/learn/lessons"
            className="btn out sm"
            style={{ marginTop: 8 }}
          >
            View All Lessons
          </Link>
        </div>
      </P>
      <P
        n="03"
        t="SAVE"
        col="#15803d"
        lc="#16a34a"
        cols="1fr 1.1fr 1.2fr"
        sub="Plan Today. Secure Tomorrow."
        body="Learn how to save and manage money smartly at any age. Set goals, track expenses and build a better financial future."
        list={[
          "Budget planning",
          "Goal tracking",
          "Smart saving tips",
          "For every age group",
        ]}
      >
        <div className="card">
          <div style={{ marginBottom: 6 }}>Your Financial Plan</div>
          {[
            ["Age Group", "20s"],
            ["Monthly Income", "₹30,000"],
            ["Monthly Expenses", "₹15,000"],
            ["Savings Goal", "Buy a House"],
          ].map(([a, b]) => (
            <div className="fld" key={a}>
              <span>{a}</span>
              <input readOnly value={b} />
            </div>
          ))}
          <Link
            to="/save"
            className="btn g"
            style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
          >
            Generate Plan
          </Link>
        </div>
        <div className="card">
          <div style={{ marginBottom: 6 }}>AI Recommended Plan</div>
          <div className="tiny" style={{ marginBottom: 10 }}>
            Monthly Allocation
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Donut />
            <div style={{ flex: 1, fontSize: 12 }}>
              {[
                ["Needs", "#2563eb", 50],
                ["Savings", "#16a34a", 20],
                ["Investments", "#f59e0b", 20],
                ["Lifestyle", "#ec4899", 10],
              ].map(([n, c, v]) => (
                <div className="row" key={n}>
                  <span>
                    <i
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: c,
                        marginRight: 8,
                      }}
                    />
                    {n}
                  </span>
                  <span>{v}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="tiny" style={{ marginTop: 12 }}>
            *This is a sample plan generated by AI.
          </p>
        </div>
      </P>
      <section className="wrap">
        <div className="banner">
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Rocket size={36} color="#a5b4fc" />
            <div>
              <h3>Ready to start your financial journey?</h3>
              <p>
                Join thousands of learners who are investing in their future
                with FinSim AI.
              </p>
            </div>
          </div>
          <Link to="/signup" className="btn b">
            Get Started for Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
