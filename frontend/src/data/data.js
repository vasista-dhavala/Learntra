export const movers = [
  { s: "TCS", p: "₹3,910.15", c: 1.32, col: "#2563eb" },
  { s: "RELIANCE", p: "₹2,950.40", c: 0.85, col: "#f59e0b" },
  { s: "HDFCBANK", p: "₹1,678.60", c: -0.42, col: "#ef4444" },
  { s: "INFY", p: "₹1,412.35", c: 0.68, col: "#14b8a6" },
];
export const topics = [
  {
    n: "Investing Basics",
    d: "Start here: what investing is and why starting early matters.",
  },
  { n: "Stocks", d: "How shares, exchanges and valuation work." },
  {
    n: "Mutual Funds",
    d: "Pooled investing, ETFs and what funds really cost.",
  },
  {
    n: "SIP",
    d: "Invest a fixed amount every month and let time do the work.",
  },
  { n: "Risk", d: "Understand risk and return before you put money in." },
  {
    n: "Diversification",
    d: "Spread your money so one mistake cannot sink you.",
  },
];
export const lessons = [
  [
    "What is a Stock?",
    "Ownership in a company, explained simply.",
    "Beginner",
    "Stocks",
    5,
  ],
  [
    "What is the Stock Market?",
    "How buyers and sellers meet to trade shares.",
    "Beginner",
    "Stocks",
    6,
  ],
  [
    "Diversification",
    "Spread risk across assets so one loss hurts less.",
    "Beginner",
    "Diversification",
    7,
  ],
  [
    "P/E Ratio",
    "Compare price with earnings to judge value.",
    "Intermediate",
    "Stocks",
    8,
  ],
  [
    "Mutual Funds",
    "Pooled money managed by professionals.",
    "Beginner",
    "Mutual Funds",
    6,
  ],
  [
    "ETFs",
    "Index-tracking funds traded like stocks.",
    "Intermediate",
    "Mutual Funds",
    7,
  ],
  [
    "Compound Interest",
    "Why starting early matters so much.",
    "Beginner",
    "Investing Basics",
    5,
  ],
  [
    "Portfolio Building",
    "Combine assets that match your goals.",
    "Intermediate",
    "Investing Basics",
    9,
  ],
  [
    "Risk Management",
    "Position sizing, stop-losses and limits.",
    "Advanced",
    "Risk",
    10,
  ],
  [
    "Asset Allocation",
    "Split money between stocks, bonds and cash.",
    "Advanced",
    "Diversification",
    9,
  ],
  [
    "What is Investing?",
    "Put money to work instead of letting it sit idle.",
    "Beginner",
    "Investing Basics",
    5,
  ],
  [
    "What is a SIP?",
    "Invest a fixed sum every month, automatically.",
    "Beginner",
    "SIP",
    6,
  ],
  [
    "SIP vs Lump Sum",
    "When monthly investing beats one big investment.",
    "Intermediate",
    "SIP",
    8,
  ],
  [
    "Rupee Cost Averaging",
    "How SIPs buy more units when prices fall.",
    "Intermediate",
    "SIP",
    7,
  ],
  [
    "Risk vs Return",
    "Why higher returns come with higher risk.",
    "Beginner",
    "Risk",
    6,
  ],
  [
    "Volatility Explained",
    "Why prices swing and how to stay calm.",
    "Intermediate",
    "Risk",
    7,
  ],
  [
    "Rebalancing Your Portfolio",
    "Restore your mix when markets move it.",
    "Advanced",
    "Diversification",
    8,
  ],
  [
    "Expense Ratio",
    "The hidden fee that eats fund returns.",
    "Intermediate",
    "Mutual Funds",
    5,
  ],
  [
    "Reading a Stock Chart",
    "Candles, trends and volume made simple.",
    "Intermediate",
    "Stocks",
    9,
  ],
].map((l, i) => ({
  id: i + 1,
  title: l[0],
  desc: l[1],
  level: l[2],
  cat: l[3],
  min: l[4],
  progress: [100, 60, 30, 0, 0, 0, 80, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0, 0][i],
}));
export const indices = [
  ["NIFTY 50", "24,854.65", 0.68],
  ["SENSEX", "81,455.20", 0.64],
  ["S&P 500", "5,612.40", 0.42],
  ["NASDAQ", "17,870.15", 0.88],
  ["DOW JONES", "41,250.60", -0.12],
];
export const stocks = [
  ["TCS", "Tata Consultancy Services", "IT", 3910.15, 1.32, "India"],
  ["RELIANCE", "Reliance Industries", "Energy", 2950.4, 0.85, "India"],
  ["HDFCBANK", "HDFC Bank", "Banking", 1678.6, -0.42, "India"],
  ["INFY", "Infosys", "IT", 1412.35, 0.68, "India"],
  ["ICICIBANK", "ICICI Bank", "Banking", 1245.8, 0.54, "India"],
  ["SBIN", "State Bank of India", "Banking", 812.25, -0.18, "India"],
  ["ITC", "ITC Ltd", "FMCG", 468.9, 0.31, "India"],
  ["BHARTIARTL", "Bharti Airtel", "Telecom", 1620.45, 1.05, "India"],

  ["AAPL", "Apple Inc.", "Technology", 19015, 1.28, "US"],
  ["MSFT", "Microsoft", "Technology", 35960, 0.74, "US"],
  ["TSLA", "Tesla", "Automotive", 20395, 2.35, "US"],
  ["NVDA", "NVIDIA", "Semiconductors", 9960, 1.9, "US"],
  ["AMZN", "Amazon", "E-commerce", 15650, -0.36, "US"],
  ["GOOGL", "Alphabet", "Technology", 32800, 1.06, "US"],

  ["BTC", "Bitcoin", "Crypto", 5400000, 1.15, "Crypto"],

  /* China */
  ["TENCENT", "Tencent", "Technology", 4700, 1.14, "China"],
  ["BABA", "Alibaba", "E-commerce", 9500, 0.67, "China"],
  ["ICBC", "ICBC", "Banking", 82, 0.31, "China"],

  /* Japan */
  ["TM", "Toyota", "Automotive", 1600, 0.92, "Japan"],
  ["SONY", "Sony", "Technology", 9500, 0.56, "Japan"],
  ["MUFG", "MUFG", "Banking", 1800, -0.21, "Japan"],

  /* UK */
  ["HSBC", "HSBC", "Banking", 9000, 0.63, "UK"],
  ["AZN", "AstraZeneca", "Healthcare", 15000, 0.48, "UK"],
  ["SHEL", "Shell", "Energy", 3000, -0.35, "UK"],

  /* Canada */
  ["RY", "RBC", "Banking", 7800, 0.71, "Canada"],
  ["TD", "TD Bank", "Banking", 6800, 0.42, "Canada"],
  ["SHOP", "Shopify", "Technology", 12000, 1.87, "Canada"],

  /* Taiwan */
  ["TSM", "TSMC", "Semiconductors", 35500, 1.73, "Taiwan"],
  ["MDTKF", "MediaTek", "Semiconductors", 9500, 0.82, "Taiwan"],
  ["HNHAF", "Hon Hai", "Technology", 1100, 0.61, "Taiwan"],

  /* South Korea */
  ["005930", "Samsung", "Technology", 17000, 1.44, "South Korea"],
  ["000660", "SK Hynix", "Semiconductors", 125000, 2.12, "South Korea"],
  ["HYMTF", "Hyundai", "Automotive", 18000, 0.58, "South Korea"],

  /* France */
  ["LVMUY", "LVMH", "Luxury", 18500, 0.73, "France"],
  ["LRLCY", "L'Oréal", "Consumer", 40000, 0.46, "France"],
  ["HESAF", "Hermès", "Luxury", 80000, 0.91, "France"],

  /* Germany */
  ["SAP", "SAP", "Technology", 28000, 1.02, "Germany"],
  ["SIEGY", "Siemens", "Industrial", 25000, 0.37, "Germany"],
  ["ALIZY", "Allianz", "Insurance", 40000, 0.29, "Germany"],
].map((s) => ({
  s: s[0],
  n: s[1],
  sec: s[2],
  p: s[3],
  c: s[4],
  r: s[5],
}));
export const popular = [
  "TCS",
  "RELIANCE",
  "HDFCBANK",
  "AAPL",
  "TSLA",
  "NVDA",
  "BTC",
];
export const assets = stocks.map((s) => [s.s, s.p, s.c]);
export const mkts = [
  ["Apple", "NASDAQ", "+1.28%"],
  ["Tesla", "NASDAQ", "+2.35%"],
  ["S&P 500", "INDEX", "+0.42%"],
  ["Bitcoin", "CRYPTO", "+1.15%"],
  ["NSE", "SENSEX", "+0.64%"],
  ["Reliance", "NSE", "+0.73%"],
];
