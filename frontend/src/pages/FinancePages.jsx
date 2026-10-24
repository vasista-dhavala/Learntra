import { Link } from "react-router-dom";
import {
  TrendingUp,
  Building2,
  Globe2,
  Landmark,
  Radio,
  BarChart3,
  LineChart,
  FileText,
  Wallet,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Newspaper,
} from "lucide-react";

import StockChart, { Spark } from "../components/StockChart.jsx";
import { stocks, indices, popular } from "../data/data.js";
import { inr, Chg } from "../utils/helpers.jsx";
import "./FinancePages.css";

const Demo = () => (
  <p className="tiny">
    Simulated demo content. FinSim AI does not provide real-time financial
    advice or live trading.
  </p>
);

const PageHero = ({ icon: Icon, eyebrow, title, description }) => (
  <div className="finance-page-hero">
    <div className="finance-hero-icon">
      <Icon size={28} />
    </div>

    <div>
      <div className="finance-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  </div>
);

const NewsCard = ({ title, category, time, description }) => (
  <article className="news-card card">
    <div className="news-card-top">
      <span className="pill">{category}</span>
      <span className="tiny">{time}</span>
    </div>

    <h3>{title}</h3>

    <p className="mu">{description}</p>

    <Link to="/news/live-market-news" className="news-read">
      Read more <ArrowRight size={14} />
    </Link>
  </article>
);

const NewsPage = ({ title, description, icon = Newspaper, category }) => {
  const stories = [
    [
      "Markets watch global signals as investors assess the next move",
      "Markets",
      "12 min ago",
      "A simulated market briefing covering major indices, investor sentiment and global market signals.",
    ],
    [
      "Companies prepare for another important earnings season",
      "Companies",
      "28 min ago",
      "A demo overview of company results, earnings expectations and what investors typically watch.",
    ],
    [
      "Economic indicators remain important for investors",
      "Economy",
      "1 hr ago",
      "Learn how inflation, interest rates, employment and growth can influence financial markets.",
    ],
    [
      "Policy decisions can influence financial markets",
      "Government",
      "2 hrs ago",
      "Understand why government decisions and economic policies can affect businesses and investors.",
    ],
    [
      "Investors keep an eye on major market movements",
      "Markets",
      "3 hrs ago",
      "A simulated live-style market update designed for financial learning.",
    ],
    [
      "Technology and financial companies remain in focus",
      "Companies",
      "4 hrs ago",
      "Explore how company developments can influence investor expectations.",
    ],
  ];

  return (
    <main className="wrap page">
      <PageHero
        icon={icon}
        eyebrow={category || "NEWS"}
        title={title}
        description={description}
      />

      <Demo />

      <div className="section-heading">
        <div>
          <h2>Latest News</h2>
          <p className="mu">Stay informed with simplified financial news.</p>
        </div>
      </div>

      <div className="news-grid">
        {stories.map((story, i) => (
          <NewsCard
            key={i}
            title={story[0]}
            category={story[1]}
            time={story[2]}
            description={story[3]}
          />
        ))}
      </div>

      <div className="finance-bottom-cta">
        <div>
          <h3>Want to understand the market better?</h3>
          <p>Learn the concepts behind the headlines before investing.</p>
        </div>

        <Link to="/learn" className="btn p">
          Start Learning <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
};

export function NewsMarkets() {
  return (
    <NewsPage
      icon={TrendingUp}
      category="NEWS · MARKETS"
      title="Market News"
      description="Follow major market movements, indices and investor sentiment."
    />
  );
}

export function NewsCompanies() {
  return (
    <NewsPage
      icon={Building2}
      category="NEWS · COMPANIES"
      title="Company News"
      description="Explore company developments, earnings and business updates."
    />
  );
}

export function NewsEconomy() {
  return (
    <NewsPage
      icon={Globe2}
      category="NEWS · ECONOMY"
      title="Economy"
      description="Understand the economic events and indicators that influence markets."
    />
  );
}

export function NewsGovernment() {
  return (
    <NewsPage
      icon={Landmark}
      category="NEWS · GOVERNMENT"
      title="Government & Policy"
      description="Learn how government decisions and policies can affect the economy and markets."
    />
  );
}

export function LiveMarketNews() {
  return (
    <NewsPage
      icon={Radio}
      category="NEWS · LIVE"
      title="Live Market News"
      description="A simulated live-style feed for following market events in one place."
    />
  );
}

/* =========================================================
   INVESTING
========================================================= */

const InvestingHero = ({ icon: Icon, title, description }) => (
  <PageHero
    icon={Icon}
    eyebrow="INVESTING"
    title={title}
    description={description}
  />
);

export function InvestingStocks() {
  const list = stocks.filter((x) => popular.includes(x.s));

  return (
    <main className="wrap page">
      <InvestingHero
        icon={BarChart3}
        title="Stocks"
        description="Understand stocks, track companies and practise trading with virtual money."
      />

      <Demo />

      <div className="g3">
        {list.map((s) => (
          <div className="card investment-stock-card" key={s.s}>
            <div className="investment-stock-head">
              <div>
                <b>{s.s}</b>
                <div className="tiny">{s.n}</div>
              </div>

              <Spark up={s.c >= 0} />
            </div>

            <div className="big">{inr(s.p)}</div>

            <Chg c={s.c} />

            <Link
              to={`/invest/simulation?asset=${s.s}`}
              className="btn p sm"
              style={{ marginTop: 12 }}
            >
              Trade <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      <div className="g2 investing-content">
        <div className="card">
          <h3>What are stocks?</h3>
          <p className="mu">
            Stocks represent ownership in a company. Investors can potentially
            benefit when the company grows and its share price increases.
          </p>

          <ul className="finance-list">
            <li>Ownership in companies</li>
            <li>Potential capital growth</li>
            <li>Market price fluctuations</li>
            <li>Higher risk than many traditional savings products</li>
          </ul>
        </div>

        <div className="card">
          <h3>NIFTY 50</h3>
          <StockChart />

          <Link to="/markets" className="btn out sm" style={{ marginTop: 12 }}>
            Explore Markets
          </Link>
        </div>
      </div>
    </main>
  );
}

export function InvestingBonds() {
  return (
    <main className="wrap page">
      <InvestingHero
        icon={ShieldCheck}
        title="Bonds"
        description="Learn how bonds work, why investors use them and how they differ from stocks."
      />

      <Demo />

      <div className="g3">
        {[
          [
            "Government Bonds",
            "Debt instruments issued by governments to raise money.",
          ],
          ["Corporate Bonds", "Companies can issue bonds to raise capital."],
          [
            "Bond Returns",
            "Understand coupon payments, maturity and price changes.",
          ],
        ].map(([title, text]) => (
          <div className="card" key={title}>
            <h3>{title}</h3>
            <p className="mu">{text}</p>
          </div>
        ))}
      </div>

      <div className="finance-info-banner">
        <ShieldCheck size={28} />
        <div>
          <b>Bonds can play a role in diversification</b>
          <p>
            Learn about risk, maturity and interest rates before making
            investment decisions.
          </p>
        </div>
      </div>
    </main>
  );
}

export function InvestingIPOs() {
  return (
    <main className="wrap page">
      <InvestingHero
        icon={FileText}
        title="Initial Public Offerings"
        description="Learn what IPOs are and how companies enter the public market."
      />

      <Demo />

      <div className="g3">
        {[
          [
            "What is an IPO?",
            "An IPO is when a private company offers shares to the public for the first time.",
          ],
          [
            "Why companies launch IPOs",
            "Companies can raise capital for growth, expansion and other business objectives.",
          ],
          [
            "IPO risks",
            "IPO prices can be volatile and investors should understand the company before investing.",
          ],
        ].map(([title, text]) => (
          <div className="card" key={title}>
            <h3>{title}</h3>
            <p className="mu">{text}</p>
          </div>
        ))}
      </div>

      <Link to="/learn" className="btn p">
        Learn Investing Basics <ArrowRight size={16} />
      </Link>
    </main>
  );
}

export function InvestingTrading() {
  return (
    <main className="wrap page">
      <InvestingHero
        icon={LineChart}
        title="Trading"
        description="Practise buying and selling assets without risking real money."
      />

      <Demo />

      <div className="g3">
        <div className="card">
          <h3>Technical Analysis</h3>
          <p className="mu">
            Learn how charts, trends and price patterns can be used to study
            market behaviour.
          </p>
        </div>

        <div className="card">
          <h3>Risk Management</h3>
          <p className="mu">
            Understand position sizing, diversification and why protecting
            capital matters.
          </p>
        </div>

        <div className="card">
          <h3>Virtual Trading</h3>
          <p className="mu">
            Use FinSim AI's simulation to practise trades with ₹1,00,000 virtual
            money.
          </p>
        </div>
      </div>

      <div className="finance-bottom-cta">
        <div>
          <h3>Ready to practise?</h3>
          <p>Trade using virtual money with zero financial risk.</p>
        </div>

        <Link to="/invest/simulation" className="btn b">
          Start Trading <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

export function InvestingMutualFunds() {
  return (
    <main className="wrap page">
      <InvestingHero
        icon={Wallet}
        title="Mutual Funds"
        description="Learn how mutual funds pool investor money and invest across assets."
      />

      <Demo />

      <div className="g3">
        {[
          [
            "Equity Funds",
            "Primarily invest in stocks and can offer higher growth potential with higher risk.",
          ],
          [
            "Debt Funds",
            "Focus on debt instruments and can provide a different risk-return profile.",
          ],
          [
            "Index Funds",
            "Track a market index instead of trying to outperform it.",
          ],
        ].map(([title, text]) => (
          <div className="card" key={title}>
            <h3>{title}</h3>
            <p className="mu">{text}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Important concepts</h3>

        <div className="g3" style={{ marginBottom: 0 }}>
          <div>
            <b>NAV</b>
            <p className="tiny">Net Asset Value of a fund.</p>
          </div>

          <div>
            <b>SIP</b>
            <p className="tiny">Invest a fixed amount regularly.</p>
          </div>

          <div>
            <b>Expense Ratio</b>
            <p className="tiny">The fee charged for managing a fund.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   BANKING
========================================================= */

export function Banking() {
  return (
    <main className="wrap page">
      <PageHero
        icon={Landmark}
        eyebrow="BANKING"
        title="Banking"
        description="Understand everyday banking, accounts, interest and responsible money management."
      />

      <Demo />

      <div className="g3">
        <div className="card">
          <h3>Savings Accounts</h3>
          <p className="mu">
            Learn how savings accounts work and why keeping an emergency fund
            matters.
          </p>
        </div>

        <div className="card">
          <h3>Interest Rates</h3>
          <p className="mu">
            Understand how interest affects your savings and borrowing.
          </p>
        </div>

        <div className="card">
          <h3>Digital Banking</h3>
          <p className="mu">
            Learn the basics of modern digital banking and safe financial
            habits.
          </p>
        </div>
      </div>

      <Link to="/personal-finance/savings" className="btn p">
        Plan Your Savings <ArrowRight size={16} />
      </Link>
    </main>
  );
}

/* =========================================================
   PERSONAL FINANCE
========================================================= */

export function PersonalSavings() {
  return (
    <main className="wrap page">
      <PageHero
        icon={PiggyBank}
        eyebrow="PERSONAL FINANCE"
        title="Savings"
        description="Build better saving habits and understand where your money goes."
      />

      <Demo />

      <div className="g3">
        <div className="card">
          <h3>Emergency Fund</h3>
          <p className="mu">
            Build a reserve that can help cover unexpected expenses.
          </p>
        </div>

        <div className="card">
          <h3>Monthly Savings</h3>
          <p className="mu">
            Set aside a consistent amount every month before spending the rest.
          </p>
        </div>

        <div className="card">
          <h3>Financial Goals</h3>
          <p className="mu">
            Turn large goals into smaller monthly saving targets.
          </p>
        </div>
      </div>

      <div className="finance-bottom-cta">
        <div>
          <h3>Want a personalised demo plan?</h3>
          <p>
            Enter your income, expenses and goals to generate a sample plan.
          </p>
        </div>

        <Link to="/personal-finance/financial-plan" className="btn b">
          Build Financial Plan <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

export function FinancialPlan() {
  return (
    <main className="wrap page">
      <PageHero
        icon={Wallet}
        eyebrow="PERSONAL FINANCE"
        title="Financial Plan"
        description="Create a simple financial plan based on your income, expenses, goals and risk preference."
      />

      <Demo />

      <div className="g2">
        <div className="card">
          <h3>Build your plan</h3>

          <div className="fld">
            <span>Age Group</span>
            <select>
              <option>Teens</option>
              <option>20s</option>
              <option>30s</option>
              <option>40s</option>
              <option>50+</option>
            </select>
          </div>

          <div className="fld">
            <span>Monthly Income</span>
            <input type="number" placeholder="₹30,000" />
          </div>

          <div className="fld">
            <span>Monthly Expenses</span>
            <input type="number" placeholder="₹15,000" />
          </div>

          <div className="fld">
            <span>Savings Goal</span>
            <input placeholder="Buy a House" />
          </div>

          <div className="fld">
            <span>Risk Preference</span>
            <select>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>

          <Link
            to="/save"
            className="btn g"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            Generate Plan
          </Link>
        </div>

        <div className="card financial-plan-preview">
          <div className="finance-plan-icon">
            <Wallet size={24} />
          </div>

          <h3>Sample Financial Plan</h3>

          <div className="row">
            <span>Needs</span>
            <b>50%</b>
          </div>

          <div className="row">
            <span>Savings</span>
            <b className="up">20%</b>
          </div>

          <div className="row">
            <span>Investments</span>
            <b>20%</b>
          </div>

          <div className="row">
            <span>Lifestyle</span>
            <b>10%</b>
          </div>

          <p className="tiny" style={{ marginTop: 14 }}>
            This is a sample educational allocation, not financial advice.
          </p>
        </div>
      </div>
    </main>
  );
}
