
import logging
import math
import os
from concurrent.futures import ThreadPoolExecutor
import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

logger = logging.getLogger(__name__)

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

GLOBAL_STOCKS = [
    {"symbol": "AAPL", "yahoo_symbol": "AAPL", "name": "Apple Inc.", "keywords": "technology iphone", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "MSFT", "yahoo_symbol": "MSFT", "name": "Microsoft", "keywords": "technology software", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "TSLA", "yahoo_symbol": "TSLA", "name": "Tesla", "keywords": "automotive electric vehicles", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "NVDA", "yahoo_symbol": "NVDA", "name": "NVIDIA", "keywords": "semiconductors technology", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "AMZN", "yahoo_symbol": "AMZN", "name": "Amazon", "keywords": "e-commerce technology", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "GOOGL", "yahoo_symbol": "GOOGL", "name": "Alphabet", "keywords": "google technology", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "BTC", "yahoo_symbol": "BTC-USD", "name": "Bitcoin", "keywords": "crypto cryptocurrency", "exchange": "Crypto", "currency": "USD"},
    {"symbol": "TENCENT", "yahoo_symbol": "0700.HK", "name": "Tencent", "keywords": "technology china", "exchange": "HKEX", "currency": "HKD"},
    {"symbol": "BABA", "yahoo_symbol": "9988.HK", "name": "Alibaba", "keywords": "e-commerce china", "exchange": "HKEX", "currency": "HKD"},
    {"symbol": "ICBC", "yahoo_symbol": "1398.HK", "name": "ICBC", "keywords": "banking china", "exchange": "HKEX", "currency": "HKD"},
    {"symbol": "TM", "yahoo_symbol": "TM", "name": "Toyota", "keywords": "automotive japan", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "SONY", "yahoo_symbol": "SONY", "name": "Sony", "keywords": "technology japan", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "MUFG", "yahoo_symbol": "MUFG", "name": "MUFG", "keywords": "banking japan", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "HSBC", "yahoo_symbol": "HSBC", "name": "HSBC", "keywords": "banking united kingdom", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "AZN", "yahoo_symbol": "AZN", "name": "AstraZeneca", "keywords": "healthcare pharmaceutical united kingdom", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "SHEL", "yahoo_symbol": "SHEL", "name": "Shell", "keywords": "energy united kingdom", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "RY", "yahoo_symbol": "RY", "name": "Royal Bank of Canada", "keywords": "banking canada", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "TD", "yahoo_symbol": "TD", "name": "TD Bank", "keywords": "banking canada", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "SHOP", "yahoo_symbol": "SHOP", "name": "Shopify", "keywords": "technology e-commerce canada", "exchange": "NASDAQ", "currency": "USD"},
    {"symbol": "TSM", "yahoo_symbol": "TSM", "name": "TSMC", "keywords": "semiconductors taiwan", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "MDTKF", "yahoo_symbol": "2454.TW", "name": "MediaTek", "keywords": "semiconductors taiwan", "exchange": "TWSE", "currency": "TWD"},
    {"symbol": "HNHAF", "yahoo_symbol": "2317.TW", "name": "Hon Hai", "keywords": "technology taiwan", "exchange": "TWSE", "currency": "TWD"},
    {"symbol": "005930", "yahoo_symbol": "005930.KS", "name": "Samsung", "keywords": "technology south korea", "exchange": "KRX", "currency": "KRW"},
    {"symbol": "000660", "yahoo_symbol": "000660.KS", "name": "SK Hynix", "keywords": "semiconductors south korea", "exchange": "KRX", "currency": "KRW"},
    {"symbol": "HYMTF", "yahoo_symbol": "005380.KS", "name": "Hyundai", "keywords": "automotive south korea", "exchange": "KRX", "currency": "KRW"},
    {"symbol": "LVMUY", "yahoo_symbol": "LVMUY", "name": "LVMH", "keywords": "luxury france", "exchange": "OTC", "currency": "USD"},
    {"symbol": "LRLCY", "yahoo_symbol": "LRLCY", "name": "L'Oréal", "keywords": "consumer france", "exchange": "OTC", "currency": "USD"},
    {"symbol": "HESAF", "yahoo_symbol": "RMS.PA", "name": "Hermès", "keywords": "luxury france", "exchange": "Euronext Paris", "currency": "EUR"},
    {"symbol": "SAP", "yahoo_symbol": "SAP", "name": "SAP", "keywords": "technology germany", "exchange": "NYSE", "currency": "USD"},
    {"symbol": "SIEGY", "yahoo_symbol": "SIEGY", "name": "Siemens", "keywords": "industrial germany", "exchange": "OTC", "currency": "USD"},
    {"symbol": "ALIZY", "yahoo_symbol": "ALIZY", "name": "Allianz", "keywords": "insurance germany", "exchange": "OTC", "currency": "USD"},
]
STOCK_CATALOG = INDIAN_STOCKS + GLOBAL_STOCKS
STOCKS_BY_SYMBOL = {stock["symbol"]: stock for stock in STOCK_CATALOG}
STOCKS_BY_SYMBOL.update(
    {
        stock["symbol"][:-3]: stock
        for stock in INDIAN_STOCKS
        if stock["symbol"].endswith(".NS")
    }
)
MARKET_INDICES = {
    "NIFTY 50": {
        "yahoo_symbol": "^NSEI",
        "name": "NIFTY 50",
        "exchange": "NSE",
        "currency": "INR",
    },
    "SENSEX": {
        "yahoo_symbol": "^BSESN",
        "name": "SENSEX",
        "exchange": "BSE",
        "currency": "INR",
    },
    "S&P 500": {
        "yahoo_symbol": "^GSPC",
        "name": "S&P 500",
        "exchange": "S&P",
        "currency": "USD",
    },
    "NASDAQ": {
        "yahoo_symbol": "^IXIC",
        "name": "NASDAQ Composite",
        "exchange": "NASDAQ",
        "currency": "USD",
    },
    "DOW JONES": {
        "yahoo_symbol": "^DJI",
        "name": "Dow Jones Industrial Average",
        "exchange": "DJI",
        "currency": "USD",
    },
}
MARKET_INDICES["^NSEI"] = MARKET_INDICES["NIFTY 50"]


def _resolve_yahoo_symbol(symbol: str) -> str:
    requested = symbol.strip().upper()
    if requested in MARKET_INDICES:
        return MARKET_INDICES[requested]["yahoo_symbol"]
    stock = STOCKS_BY_SYMBOL.get(requested)
    if stock:
        return stock.get("yahoo_symbol", stock["symbol"])
    if requested.endswith((".NS", ".BO")):
        return requested
    return requested + ".NS"


def _fetch_market_data(symbol: str):
    requested = symbol.strip().upper()
    stock_info = STOCKS_BY_SYMBOL.get(requested)
    if not stock_info:
        stock_info = STOCKS_BY_SYMBOL.get(
            requested.removesuffix(".NS").removesuffix(".BO")
        )
    market_info = MARKET_INDICES.get(requested)
    if not stock_info:
        stock_info = market_info

    try:
        ticker_symbol = _resolve_yahoo_symbol(requested)
        ticker = yf.Ticker(ticker_symbol)
        history = ticker.history(period="1mo", interval="1d")

        if history.empty:
            raise ValueError("Historical data not found.")

        try:
            info = ticker.info
        except Exception as error:
            logger.warning("Quote lookup failed for %s: %s", requested, error)
            info = {}

        quote_price = None
        for candidate in (info.get("currentPrice"), info.get("regularMarketPrice")):
            try:
                candidate = float(candidate)
            except (TypeError, ValueError):
                continue
            if math.isfinite(candidate) and candidate > 0:
                quote_price = candidate
                break

        latest_close = float(history["Close"].iloc[-1])
        price = quote_price or latest_close
        if not math.isfinite(price) or price <= 0:
            raise ValueError("Stock price not found.")

        records = []
        for date, row in history.iterrows():
            values = [row["Open"], row["High"], row["Low"], row["Close"]]
            if not all(math.isfinite(float(value)) for value in values):
                continue
            volume = float(row["Volume"])
            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(volume) if math.isfinite(volume) else 0,
            })

        if not records:
            raise ValueError("Historical data not found.")

        previous_close = info.get("previousClose")
        if not previous_close and len(records) > 1:
            previous_close = records[-2]["close"]
        try:
            previous_close = float(previous_close)
        except (TypeError, ValueError):
            previous_close = None
        change_percent = (
            ((price - previous_close) / previous_close) * 100
            if previous_close and math.isfinite(previous_close) and previous_close > 0
            else None
        )
        return {
            "symbol": requested,
            "company": info.get("longName")
            or (stock_info and stock_info["name"])
            or requested,
            "price": round(price, 2),
            "price_type": "quote" if quote_price is not None else "latest_close",
            "change_percent": round(change_percent, 2)
            if change_percent is not None
            else None,
            "currency": info.get("currency")
            or (stock_info and stock_info.get("currency"))
            or "INR",
            "exchange": info.get("fullExchangeName")
            or info.get("exchange")
            or (stock_info and stock_info.get("exchange"))
            or "NSE",
            "as_of": records[-1]["date"],
            "history": records,
        }
    except Exception as error:
        logger.warning("Market data fetch failed for %s: %s", requested, error)
        return {
            "symbol": requested,
            "error": "Market data is currently unavailable for this stock.",
        }


@app.get("/stocks/search")
def search_stocks(q: str):
    query = q.strip().lower()

    if len(query) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter at least 2 characters."
        )

    results = []

    for stock in STOCK_CATALOG:
        searchable_text = (
            stock["symbol"] + " " +
            stock["name"] + " " +
            stock["keywords"]
        ).lower()

        if query in searchable_text:
            results.append({
                "symbol": stock["symbol"],
                "name": stock["name"],
                "exchange": stock.get("exchange", "NSE"),
            })

    return {
        "query": q,
        "results": results
    }


@app.get("/stocks/market-data")
def get_market_data(symbols: str):
    requested_symbols = list(
        dict.fromkeys(symbol.strip().upper() for symbol in symbols.split(",") if symbol.strip())
    )
    if not requested_symbols:
        raise HTTPException(status_code=400, detail="Provide at least one stock symbol.")
    if len(requested_symbols) > 100:
        raise HTTPException(status_code=400, detail="Request no more than 100 stock symbols.")

    with ThreadPoolExecutor(max_workers=min(8, len(requested_symbols))) as executor:
        results = list(executor.map(_fetch_market_data, requested_symbols))

    return {"results": results}


@app.get("/stocks/{symbol}/history")
def get_stock_history(symbol: str, period: str = "1mo"):
    allowed_periods = ["1mo", "3mo", "6mo", "1y", "2y", "5y"]

    if period not in allowed_periods:
        raise HTTPException(
            status_code=400,
            detail="Invalid period. Choose 1mo, 3mo, 6mo, 1y, 2y or 5y."
        )

    try:
        ticker_symbol = _resolve_yahoo_symbol(symbol)
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
            "currency": (STOCKS_BY_SYMBOL.get(symbol.upper()) or {}).get(
                "currency", "INR"
            ),
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
        ticker_symbol = _resolve_yahoo_symbol(symbol)

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
            "currency": info.get("currency")
            or (STOCKS_BY_SYMBOL.get(symbol.upper()) or {}).get("currency", "INR"),
            "exchange": info.get("exchange")
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch stock data right now."
        )