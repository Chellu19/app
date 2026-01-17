import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import "./Home.css";
import TickerSearch from "../../components/TickerSearch";
import type { Ticker, PortfolioStock } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import { setQuery, setQueryDisplay } from "../../store/ticker";
import { Alert } from "@mui/material";
import {
  getPrices,
  allReturns,
  covarianceMatrix,
  portfolioMetrics,
} from "../../utils/util";
import PortfolioMetricsCard from "../../components/PortfolioMetricsCard";

interface WeightsMap {
  [key: string]: number;
}

interface PortfolioInfo {
  annualReturn: number;
  annualVolatility: number;
  sharpeRatio: number;
}

const Home: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<Ticker>();
  const [amountInput, setAmountInput] = useState<string>();
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [message, setMessage] = useState<string>("");

  const [showPortfolio, setShowPortfolio] = useState<boolean>(false);
  const [portfolioInfo, setPortfolioInfo] = useState<PortfolioInfo>();

  const dispatch = useAppDispatch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addToPortfolio(selectedTicker, +(amountInput || ""));
    }
  };

  const addToPortfolio = (ticker: Ticker | undefined, amount: number) => {
    if (!ticker) {
      setMessage("Please select a valid ticker");
      return;
    } else if (!amount || amount <= 0) {
      setMessage("Amount invested must be greater than $0");
      return;
    } else if (!portfolio.map((stock) => stock.ticker).includes(ticker)) {
      setPortfolio([...portfolio, { ticker, amount }]);
      setMessage("");
    } else if (ticker) {
      setPortfolio(
        portfolio.map((stock) =>
          stock.ticker === ticker
            ? { ticker, amount: stock.amount + amount }
            : stock
        )
      );
      setMessage("");
    }
    dispatch(setQuery(""));
    dispatch(setQueryDisplay(""));
    setAmountInput("");
    setShowPortfolio(false);
  };

  const removeFromPortfolio = (ticker: PortfolioStock) => {
    setPortfolio(portfolio.filter((t) => t !== ticker));
    setShowPortfolio(false);
  };

  const onAnalyse = async () => {
    const tickers = portfolio.map((s) => s.ticker);
    const totalAmount = portfolio.reduce((a, b) => a + b.amount, 0);
    const weights: WeightsMap = {};
    for (const stock of portfolio) {
      weights[stock.ticker.symbol] = stock.amount / totalAmount;
    }
    const priceHistory = await getPrices(tickers);

    const priceHistoryWithReturns = allReturns(priceHistory);

    const covar = covarianceMatrix(priceHistoryWithReturns);
    const portfolioWeights = covar.tickers.map((ticker) => weights[ticker]);
    const portfolioStats = portfolioMetrics(
      portfolioWeights,
      priceHistoryWithReturns,
      covar.covMatrix
    );
    setPortfolioInfo(portfolioStats);
    setShowPortfolio(true);
    return portfolioStats;
  };

  return (
    <div className="page-container">
      <div className="card-container">
        <h1 className="title">My Stock Portfolio</h1>
        {message && (
          <>
            <Alert severity="error">{message}</Alert>
            <br />
          </>
        )}

        <div className="input-section">
          <label className="input-label">Add Stock Ticker</label>

          <div className="input-wrapper">
            <div className="input-area">
              <TickerSearch
                onSelect={(t) => setSelectedTicker(t)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={() =>
                addToPortfolio(selectedTicker, +(amountInput || ""))
              }
              disabled={!selectedTicker || !amountInput}
              className={`add-button ${
                !selectedTicker || !amountInput ? "disabled" : ""
              }`}
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>
        <div className="input-section">
          <div className="input-wrapper">
            <input
              type="number"
              className="input-box"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onKeyDown={handleKeyDown}
            ></input>
          </div>
        </div>

        <h2 className="portfolio-title">
          Portfolio Holdings ({portfolio.length})
        </h2>

        {portfolio.length === 0 ? (
          <div className="portfolio-empty">
            <p>No stocks in your portfolio yet.</p>
            <p className="empty-sub">Start by adding some tickers above!</p>
          </div>
        ) : (
          <div>
            <div className="portfolio-grid">
              {portfolio.map((ticker) => (
                <div key={ticker.ticker.symbol} className="portfolio-item">
                  <span className="portfolio-ticker">
                    {ticker.ticker.symbol} - ${ticker.amount}
                  </span>
                  <button
                    onClick={() => removeFromPortfolio(ticker)}
                    className="remove-btn"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <br />
            <button
              className="optimise-button"
              onClick={() => onAnalyse().then((val) => console.log(val))}
            >
              Analyse
            </button>
            <br />
          </div>
        )}
        {showPortfolio && (
          <PortfolioMetricsCard
            sharpe={portfolioInfo?.sharpeRatio || 0}
            volatility={portfolioInfo?.annualVolatility || 0}
            annualReturn={portfolioInfo?.annualReturn || 0}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
