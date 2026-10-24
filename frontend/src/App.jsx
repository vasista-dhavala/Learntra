import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";

/* -------------------------------------------------------
   Lazy-loaded pages — keeps the initial JS bundle small.
   Each page is loaded on-demand when the user navigates.
------------------------------------------------------- */

/* Helper: creates a lazy component from a named export */
function lazyNamed(factory, name) {
  return lazy(() => factory().then((mod) => ({ default: mod[name] })));
}

/* Minimal loading indicator shown while chunks load */
function Loading() {
  return (
    <div style={{ padding: 60, textAlign: "center", color: "#5f6f8c" }}>
      Loading…
    </div>
  );
}

/* Pages.jsx exports */
const InvestPage = lazyNamed(() => import("./pages/Pages.jsx"), "Invest");
const SimulationPage = lazyNamed(() => import("./pages/Pages.jsx"), "Simulation");
const PortfolioPage = lazyNamed(() => import("./pages/Pages.jsx"), "Portfolio");
const LearnPage = lazyNamed(() => import("./pages/Pages.jsx"), "Learn");
const LessonsPage = lazyNamed(() => import("./pages/Pages.jsx"), "Lessons");
const LessonDetailPage = lazyNamed(() => import("./pages/Pages.jsx"), "LessonDetail");
const SavePage = lazyNamed(() => import("./pages/Pages.jsx"), "Save");
const MarketsPage = lazyNamed(() => import("./pages/Pages.jsx"), "Markets");
const AboutPage = lazyNamed(() => import("./pages/Pages.jsx"), "About");
const LoginPage = lazyNamed(() => import("./pages/Pages.jsx"), "Login");
const SignupPage = lazyNamed(() => import("./pages/Pages.jsx"), "Signup");
const NotFoundPage = lazyNamed(() => import("./pages/Pages.jsx"), "NotFound");

/* FinancePages.jsx exports */
const NewsMarketsPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "NewsMarkets");
const NewsCompaniesPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "NewsCompanies");
const NewsEconomyPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "NewsEconomy");
const NewsGovernmentPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "NewsGovernment");
const LiveMarketNewsPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "LiveMarketNews");
const InvestingStocksPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "InvestingStocks");
const InvestingBondsPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "InvestingBonds");
const InvestingIPOsPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "InvestingIPOs");
const InvestingTradingPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "InvestingTrading");
const InvestingMutualFundsPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "InvestingMutualFunds");
const BankingPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "Banking");
const PersonalSavingsPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "PersonalSavings");
const FinancialPlanPage = lazyNamed(() => import("./pages/FinancePages.jsx"), "FinancialPlan");

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />

      <ErrorBoundary key={pathname}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* HOME */}
            <Route path="/" element={<Home />} />

            {/* EXISTING INVEST */}
            <Route path="/invest" element={<InvestPage />} />
            <Route path="/invest/simulation" element={<SimulationPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />

            {/* NEWS */}
            <Route path="/news/markets" element={<NewsMarketsPage />} />
            <Route path="/news/companies" element={<NewsCompaniesPage />} />
            <Route path="/news/economy" element={<NewsEconomyPage />} />
            <Route path="/news/government" element={<NewsGovernmentPage />} />
            <Route path="/news/live-market-news" element={<LiveMarketNewsPage />} />

            {/* INVESTING */}
            <Route path="/investing/stocks" element={<InvestingStocksPage />} />
            <Route path="/investing/bonds" element={<InvestingBondsPage />} />
            <Route path="/investing/ipos" element={<InvestingIPOsPage />} />
            <Route path="/investing/trading" element={<InvestingTradingPage />} />
            <Route
              path="/investing/mutual-funds"
              element={<InvestingMutualFundsPage />}
            />

            {/* LEARN */}
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/lessons" element={<LessonsPage />} />
            <Route path="/learn/lessons/:id" element={<LessonDetailPage />} />

            {/* PERSONAL FINANCE */}
            <Route
              path="/personal-finance/savings"
              element={<PersonalSavingsPage />}
            />
            <Route
              path="/personal-finance/financial-plan"
              element={<FinancialPlanPage />}
            />

            {/* BANKING */}
            <Route path="/banking" element={<BankingPage />} />

            {/* EXISTING SAVE */}
            <Route path="/save" element={<SavePage />} />

            {/* MARKETS */}
            <Route path="/markets" element={<MarketsPage />} />

            {/* COMPANY */}
            <Route path="/about" element={<AboutPage />} />

            {/* AUTH */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* 404 */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <Footer />
    </>
  );
}
