import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Rocket, Moon, Sun, Menu, ChevronDown } from "lucide-react";
import "./Navbar.css";

const groups = [
  {
    label: "NEWS",
    items: [
      ["Markets", "/news/markets"],
      ["Companies", "/news/companies"],
      ["Economy", "/news/economy"],
      ["Government", "/news/government"],
      ["Live Market News", "/news/live-market-news"],
    ],
  },
  {
    label: "INVESTING",
    items: [
      ["Stocks", "/investing/stocks"],
      ["Bonds", "/investing/bonds"],
      ["IPOs", "/investing/ipos"],
      ["Trading", "/investing/trading"],
      ["Mutual Funds", "/investing/mutual-funds"],
    ],
  },
  {
    label: "SIMULATION",
    items: [
      ["Login", "/login"],
      ["Portfolio", "/portfolio"],
      ["Trade", "/invest/simulation"],
    ],
  },
  {
    label: "PERSONAL FINANCE",
    items: [
      ["Savings", "/personal-finance/savings"],
      ["Financial Plan", "/personal-finance/financial-plan"],
    ],
  },
];

export default function Navbar() {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("finsim-theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);

    localStorage.setItem("finsim-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };

  const isGroupActive = (items) =>
    items.some(([_, path]) => location.pathname === path);

  const toggleGroup = (label) => {
    setOpenGroup((current) => (current === label ? null : label));
  };

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        {/* LOGO */}
        <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
          <Rocket color="#2563eb" size={28} />
          <span>FinSim AI</span>
        </Link>

        {/* NAVIGATION */}
        <nav className={`nav-menu ${mobileOpen ? "open" : ""}`}>
          {groups.map((group) => {
            const active = isGroupActive(group.items);

            return (
              <div
                className={`nav-group ${active ? "active" : ""} ${
                  openGroup === group.label ? "mobile-open" : ""
                }`}
                key={group.label}
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  className="nav-group-trigger"
                  onClick={() => toggleGroup(group.label)}
                >
                  {group.label}
                  <ChevronDown size={15} />
                </button>

                <div className="nav-dropdown">
                  {group.items.map(([name, path]) => (
                    <Link
                      key={path}
                      to={path}
                      className={
                        location.pathname === path
                          ? "dropdown-link active"
                          : "dropdown-link"
                      }
                      onClick={() => {
                        setMobileOpen(false);
                        setOpenGroup(null);
                      }}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* MOBILE LOGIN */}
          <div className="mobile-auth">
            <Link
              to="/login"
              className="btn p"
              onClick={() => setMobileOpen(false)}
            >
              Login / Sign Up
            </Link>
          </div>
        </nav>

        {/* RIGHT SIDE */}
        <div className="right">
          {/* DARK MODE */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* LOGIN */}
          <Link to="/login" className="btn p sm">
            Login / Sign Up
          </Link>

          {/* MOBILE MENU */}
          <button
            className="burger"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
