
import os
import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase connection
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials are missing from .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Learntra Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Learntra Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/db-check")
def database_check():
    try:
        response = (
            supabase.table("portfolios")
            .select("id")
            .limit(1)
            .execute()
        )

        return {
            "status": "connected",
            "message": "Successfully connected to Supabase!",
            "records_found": len(response.data)
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed: " + str(error)
        )


# Indian stock directory
INDIAN_STOCKS = [
    # Banking
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "keywords": "bank private banking"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "keywords": "bank private banking"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "keywords": "bank sbi public banking"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank", "keywords": "bank private banking"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "keywords": "bank private banking"},
    {"symbol": "INDUSINDBK.NS", "name": "IndusInd Bank", "keywords": "bank private banking"},
    {"symbol": "BANKBARODA.NS", "name": "Bank of Baroda", "keywords": "bank public banking"},
    {"symbol": "PNB.NS", "name": "Punjab National Bank", "keywords": "bank pnb public banking"},
    {"symbol": "IDFCFIRSTB.NS", "name": "IDFC First Bank", "keywords": "bank private banking"},
    {"symbol": "FEDERALBNK.NS", "name": "Federal Bank", "keywords": "bank private banking"},

    # IT
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "keywords": "it software tata"},
    {"symbol": "INFY.NS", "name": "Infosys", "keywords": "it software"},
    {"symbol": "WIPRO.NS", "name": "Wipro", "keywords": "it software"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies", "keywords": "it software"},
    {"symbol": "TECHM.NS", "name": "Tech Mahindra", "keywords": "it software"},

    # Tata Group
    {"symbol": "TATASTEEL.NS", "name": "Tata Steel", "keywords": "tata steel metal"},
    {"symbol": "TATAPOWER.NS", "name": "Tata Power", "keywords": "tata power energy"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors", "keywords": "tata motors automobile"},
    {"symbol": "TMPV.NS", "name": "Tata Motors Passenger Vehicles", "keywords": "tata motors automobile"},
    {"symbol": "TRENT.NS", "name": "Trent", "keywords": "tata retail"},

    # Other popular companies
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "keywords": "reliance energy retail"},
    {"symbol": "ITC.NS", "name": "ITC Limited", "keywords": "itc fmcg"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever", "keywords": "fmcg consumer"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "keywords": "airtel telecom"},
    {"symbol": "LT.NS", "name": "Larsen and Toubro", "keywords": "lt infrastructure construction"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki", "keywords": "maruti automobile cars"},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical", "keywords": "pharma medicine"},
    {"symbol": "TITAN.NS", "name": "Titan Company", "keywords": "titan jewellery"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints", "keywords": "paint"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance", "keywords": "bajaj finance nbfc"},
]


@app.get("/stocks/search")
def search_stocks(q: str):
    query = q.strip().lower()

    if len(query) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter at least 2 characters."
        )

    results = []

    for stock in INDIAN_STOCKS:
        searchable_text = (
            stock["symbol"] + " " +
            stock["name"] + " " +
            stock["keywords"]
        ).lower()

        if query in searchable_text:
            results.append({
                "symbol": stock["symbol"],
                "name": stock["name"],
                "exchange": "NSE"
            })

    return {
        "query": q,
        "results": results
    }

@app.get("/stocks/{symbol}/history")
def get_stock_history(symbol: str, period: str = "1mo"):
    allowed_periods = ["1mo", "3mo", "6mo", "1y", "2y", "5y"]

    if period not in allowed_periods:
        raise HTTPException(
            status_code=400,
            detail="Invalid period. Choose 1mo, 3mo, 6mo, 1y, 2y or 5y."
        )

    try:
        ticker_symbol = symbol.upper()

        if not ticker_symbol.endswith((".NS", ".BO")):
            ticker_symbol += ".NS"

        stock = yf.Ticker(ticker_symbol)
        history = stock.history(period=period)

        if history.empty:
            raise HTTPException(
                status_code=404,
                detail="Historical data not found."
            )

        records = []

        for date, row in history.iterrows():
            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })

        return {
            "symbol": ticker_symbol,
            "period": period,
            "currency": "INR",
            "history": records
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch historical stock data."
        )

@app.get("/stocks/{symbol}")
def get_stock_price(symbol: str):
    try:
        ticker_symbol = symbol.upper()

        # Use NSE as the default exchange
        if not ticker_symbol.endswith((".NS", ".BO")):
            ticker_symbol += ".NS"

        stock = yf.Ticker(ticker_symbol)
        info = stock.info

        price = info.get("currentPrice") or info.get("regularMarketPrice")

        if not price:
            raise HTTPException(
                status_code=404,
                detail="Stock price not found. Check the symbol."
            )

        return {
            "symbol": ticker_symbol,
            "company": info.get("longName", ticker_symbol),
            "price": price,
            "currency": "INR",
            "exchange": info.get("exchange")
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch stock data right now."
        )