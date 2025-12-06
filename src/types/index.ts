export interface Ticker {
  symbol: string;
  shortname?: string;
  quoteType?: string;
}

export interface TickerState {
  query: string;
  queryDisplay: string;
  results: Ticker[];
  loading: boolean;
}

export interface PortfolioStock {
  ticker: Ticker;
  amount: number;
}
