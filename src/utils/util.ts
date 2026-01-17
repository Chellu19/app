import { mean } from "mathjs";
import type { Ticker } from "../types";

interface PriceDictionary {
  [key: string]: number[];
}

export async function getPrices(tickers: Ticker[]): Promise<PriceDictionary> {
  const priceData: PriceDictionary = {};

  // Fetch all tickers at once
  const results = await fetch(
    `http://localhost:3001/api/prices?tickers=${tickers
      .map((t) => t.symbol)
      .join(",")}`
  ).then((res) => res.json());

  // results is assumed to be an array where results[i] corresponds to tickers[i]
  tickers.forEach((ticker, idx) => {
    const tickerData = results[idx].prices; // historical data for this ticker
    const prices: number[] = [];
    let lastValidPrice = 0;

    for (const r of tickerData) {
      if (r.close != null) {
        prices.push(r.close);
        lastValidPrice = r.close;
      } else {
        prices.push(lastValidPrice);
      }
    }
    priceData[ticker.symbol] = prices;
  });

  return priceData;
}

// takes a price array and returns the daily returns array
function computeReturns(priceArray: number[]) {
  const returns = [];
  for (let i = 1; i < priceArray.length; i++) {
    returns.push((priceArray[i] - priceArray[i - 1]) / priceArray[i - 1]);
  }
  return returns;
}

// map the above function for each ticker in the portfolio
export function allReturns(priceData: PriceDictionary) {
  const returnsData: PriceDictionary = {};
  for (const [ticker, prices] of Object.entries(priceData)) {
    returnsData[ticker] = computeReturns(prices);
  }
  return returnsData;
}

// compute covariance matrix from the returns data above
export function covarianceMatrix(returnsData: PriceDictionary) {
  const tickers = Object.keys(returnsData);
  const n = tickers.length;
  const length = returnsData[tickers[0]].length;

  const covMatrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = returnsData[tickers[i]];
      const y = returnsData[tickers[j]];
      const meanX = mean(x);
      const meanY = mean(y);

      let cov = 0;
      for (let k = 0; k < length; k++) {
        cov += (x[k] - meanX || 0) * (y[k] - meanY || 0);
      }
      covMatrix[i][j] = cov / (length - 1); // sample covariance
    }
  }
  console.log(covMatrix);
  return { covMatrix, tickers };
}

// computes metrics using data provided
export function portfolioMetrics(
  weights: number[],
  returnsData: PriceDictionary,
  covMatrix: number[][],
  tradingDays = 252,
  riskFreeRate = 0.04
) {
  const tickers = Object.keys(returnsData);
  const n = tickers.length;

  // 1️⃣ Compute expected daily return of portfolio
  const meanReturns = tickers.map((t) => mean(returnsData[t]));
  let portfolioReturnDaily = 0;
  for (let i = 0; i < n; i++) {
    portfolioReturnDaily += weights[i] * meanReturns[i];
  }

  const portfolioReturnAnnual = portfolioReturnDaily * tradingDays;

  let portVar = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      portVar += weights[i] * weights[j] * covMatrix[i][j];
    }
  }

  const portfolioVolDaily = Math.sqrt(Math.abs(portVar));
  const portfolioVolAnnual = portfolioVolDaily * Math.sqrt(tradingDays);

  const sharpeRatio =
    (portfolioReturnAnnual - riskFreeRate) / portfolioVolAnnual;

  return {
    annualReturn: portfolioReturnAnnual,
    annualVolatility: portfolioVolAnnual,
    sharpeRatio,
  };
}
