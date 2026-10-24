# FinSim AI

An AI-powered financial literacy platform that helps people learn about trading with simulation and AI mentors. Built with React and Vite.

## Features

- **Invest** — Simulate trading with ₹1,00,000 virtual money using real market data
- **Learn** — AI mentor chatbot and 19 bite-sized lessons across 6 topics
- **Save** — Financial planning tools and AI-generated saving plans
- **Markets** — Track stocks, indices and popular assets
- **Globe** — Interactive 3D globe showing global stock data (Three.js)
- **News** — Simulated financial news across Markets, Companies, Economy and Government
- **Dark Mode** — Full light/dark theme support

## Tech Stack

- React 18
- Vite 5
- React Router 6
- Three.js + @react-three/fiber
- Lucide React (icons)
- Vanilla CSS

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/vasista-dhavala/FinSim-AI.git
   cd FinSim-AI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── main.jsx              # App entry point
├── App.jsx               # Routes & layout
├── index.css             # Global styles & design tokens
├── components/           # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── Footer.jsx
│   ├── Globe.jsx
│   ├── Navbar.jsx
│   └── StockChart.jsx
├── data/                 # Static data & state management
│   ├── data.js
│   ├── landMask.js
│   └── store.js
├── utils/                # Shared helpers
│   └── helpers.jsx
└── pages/                # Route page components
    ├── Home.jsx
    ├── Pages.jsx
    └── FinancePages.jsx
```

## Project Supervisor

Ankit Farkya

## License

This is a student project for educational purposes.
