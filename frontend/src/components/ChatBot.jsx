import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import "./ChatBot.css";

/* ─── Mock Finance AI Responses ─────────────────────────── */
const MOCK_RESPONSES = {
  greet: [
    "Hello! I'm **Learntra AI**, your personal finance assistant 🚀 Ask me anything about investing, markets, stocks, or financial planning!",
    "Hey there! I'm here to help you navigate the world of finance 💡 What would you like to learn today?",
  ],
  invest: [
    "Investing is all about putting money to work for you! Great starting points include:\n\n• **Index funds** — diversified, low-cost\n• **ETFs** — traded like stocks, broad exposure\n• **Stocks** — individual company ownership\n\nWould you like to explore any of these?",
    "Smart investing starts with understanding **risk vs. reward**. Generally:\n\n📈 Higher risk → higher potential return\n📉 Lower risk → more stability\n\nWhat's your investing goal — growth, income, or capital preservation?",
  ],
  stocks: [
    "Stocks represent ownership in a company 📊 Key metrics to evaluate:\n\n• **P/E Ratio** — price relative to earnings\n• **Market Cap** — company's total value\n• **EPS** — earnings per share\n• **Dividend Yield** — income paid to shareholders\n\nWant to dive deeper into any metric?",
    "When analyzing stocks, look at both **fundamental** and **technical** analysis:\n\n📌 Fundamentals: revenue, profit margins, debt\n📌 Technicals: price trends, moving averages, volume\n\nI can walk you through either approach!",
  ],
  portfolio: [
    "A well-balanced portfolio typically follows an **asset allocation** strategy:\n\n🟦 Stocks (growth) — 60–80%\n🟩 Bonds (stability) — 10–30%\n🟨 Cash / alternatives — 5–10%\n\nYour ideal mix depends on your age, risk tolerance, and goals!",
    "**Diversification** is the golden rule of portfolio management — don't put all your eggs in one basket 🧺\n\nSpread across:\n• Different sectors (tech, healthcare, energy)\n• Asset classes (stocks, bonds, real estate)\n• Geographies (US, international, emerging markets)",
  ],
  market: [
    "Markets are influenced by many factors 📰:\n\n• **Economic data** — GDP, inflation, jobs\n• **Central bank policy** — interest rate decisions\n• **Earnings reports** — company performance\n• **Geopolitical events** — global uncertainty\n\nWant me to explain any of these in detail?",
    "The stock market goes through cycles:\n\n🐂 **Bull market** — rising prices, strong economy\n🐻 **Bear market** — falling prices (>20% decline)\n📊 **Correction** — a 10–20% drop from highs\n\nKnowing where we are helps with investment decisions!",
  ],
  mutual: [
    "**Mutual funds** pool money from many investors to buy a diversified basket of assets 🏦\n\nTypes include:\n• **Equity funds** — stock-focused\n• **Debt funds** — bond-focused\n• **Hybrid funds** — mix of both\n• **Index funds** — track a market index\n\nLow-cost index funds are often recommended for beginners!",
  ],
  save: [
    "Smart saving strategies 💰:\n\n1. **Emergency fund** — 3–6 months of expenses\n2. **High-yield savings account** — beat inflation\n3. **50/30/20 rule** — needs, wants, savings\n4. **Automate transfers** — pay yourself first\n\nWhich would you like to explore more?",
  ],
  bond: [
    "**Bonds** are debt instruments — you lend money to a government or corporation and earn interest 📜\n\nKey concepts:\n• **Coupon rate** — annual interest paid\n• **Maturity date** — when principal is returned\n• **Yield** — effective return based on price\n• **Credit rating** — risk of default\n\nBonds are great for stability and income!",
  ],
  inflation: [
    "**Inflation** erodes purchasing power over time 📉 To beat it:\n\n• Invest in **real assets** (stocks, real estate, commodities)\n• Consider **TIPS** — Treasury Inflation-Protected Securities\n• **Avoid holding too much cash** for long periods\n• **Increase income** and invest the difference\n\nThe goal: make your money grow faster than inflation!",
  ],
  default: [
    "That's a great question! Let me think about the best way to explain this in the context of personal finance and investing... 🤔\n\nCould you be a bit more specific? For example:\n• Are you asking about a specific investment type?\n• Is this about managing risk?\n• Or planning for a financial goal?",
    "Interesting question! Finance is a broad topic 📚 I'm best at helping with:\n\n• Investing basics & strategies\n• Stock market concepts\n• Portfolio building\n• Savings & financial planning\n\nWhat area interests you most?",
  ],
};

/* ─── Suggestion Chips ──────────────────────────────────── */
const SUGGESTIONS = [
  "How do I start investing?",
  "What are index funds?",
  "Explain bonds",
  "How to build a portfolio?",
  "What is inflation?",
];

/* ─── Helper: Pick a mock response ─────────────────────── */
function getMockResponse(text) {
  const t = text.toLowerCase();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (/\b(hi|hello|hey|hii|greet)\b/.test(t)) return pick(MOCK_RESPONSES.greet);
  if (/\b(invest|investing|investment|invest)\b/.test(t)) return pick(MOCK_RESPONSES.invest);
  if (/\bstock(s|market)?\b/.test(t)) return pick(MOCK_RESPONSES.stocks);
  if (/\bportfolio\b/.test(t)) return pick(MOCK_RESPONSES.portfolio);
  if (/\b(market|markets|bull|bear)\b/.test(t)) return pick(MOCK_RESPONSES.market);
  if (/\b(mutual fund|mutual|fund)\b/.test(t)) return pick(MOCK_RESPONSES.mutual);
  if (/\b(sav(e|ing|ings))\b/.test(t)) return pick(MOCK_RESPONSES.save);
  if (/\bbond(s)?\b/.test(t)) return pick(MOCK_RESPONSES.bond);
  if (/\binflation\b/.test(t)) return pick(MOCK_RESPONSES.inflation);
  return pick(MOCK_RESPONSES.default);
}

/* ─── Format time ───────────────────────────────────────── */
function fmtTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Markdown-lite renderer (bold only) ────────────────── */
function RenderText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>{p}</span>
        )
      )}
    </span>
  );
}

/* ─── Initial welcome message ───────────────────────────── */
const WELCOME = {
  id: 0,
  role: "bot",
  text: "👋 Hi! I'm **Learntra AI**, your intelligent finance assistant.\n\nI can help you understand investing, markets, portfolios, and more. Try one of the suggestions below or ask me anything!",
  time: new Date(),
};

/* ─── Main Component ────────────────────────────────────── */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  /* auto-scroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  /* focus input when panel opens */
  useEffect(() => {
    if (open) {
      setShowBadge(false);
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [open]);

  /* auto-resize textarea */
  function handleInput(e) {
    const el = e.target;
    setInput(el.value);
    el.style.height = "22px";
    el.style.height = Math.min(el.scrollHeight, 90) + "px";
  }

  function sendMessage(text) {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      time: new Date(),
    };

    setMsgs((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "22px";
    }
    setTyping(true);

    /* Simulate AI thinking delay */
    const delay = 900 + Math.random() * 700;
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: getMockResponse(trimmed),
        time: new Date(),
      };
      setTyping(false);
      setMsgs((prev) => [...prev, botMsg]);
    }, delay);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* ── Chat Panel ── */}
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Learntra AI Chat">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar">
              <Bot size={22} />
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">Learntra AI</div>
              <div className="chat-header-status">
                <span className="status-dot" />
                Online · Finance Assistant
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages" role="log" aria-live="polite">
            <div className="chat-date">Today</div>

            {msgs.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                <div className="msg-icon">
                  {msg.role === "bot" ? (
                    <Bot size={14} color="#fff" />
                  ) : (
                    <User size={14} color="#fff" />
                  )}
                </div>
                <div>
                  <div className="msg-bubble">
                    <RenderText text={msg.text} />
                  </div>
                  <div className="msg-time">{fmtTime(msg.time)}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-typing">
                <div className="msg-icon" style={{
                  background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div className="typing-bubble">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Suggestion chips (only after welcome message when no further msgs) */}
            {msgs.length === 1 && !typing && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chat-chip"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Footer / Input */}
          <div className="chat-footer">
            <div className="chat-input-row">
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Ask about investing, markets, savings…"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                aria-label="Type a message"
              />
              <button
                className="chat-send"
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="chat-footer-note">
              AI responses are for educational purposes only.
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Trigger Bubble ── */}
      <button
        className={`chat-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open Learntra AI chat"}
        aria-expanded={open}
      >
        {showBadge && !open && <span className="chat-badge" />}
        {open ? <X size={22} /> : <Bot size={26} />}
      </button>
    </>
  );
}
