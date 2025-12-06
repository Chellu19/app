// store/tickerSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Ticker, TickerState } from "../types";

export const initialState: TickerState = {
  query: "",
  queryDisplay: "",
  results: [],
  loading: false,
};

export const fetchTickers = createAsyncThunk<Ticker[], string>(
  "tickers/fetch",
  async (query: string) => {
    const res = await fetch(`http://localhost:3001/api/search?q=${query}`);

    const data = await res.json();

    const tickers: Ticker[] = (data.quotes || []).filter(
      (q: Ticker) => q.quoteType === "EQUITY" || q.quoteType === "ETF"
    );

    return tickers;
  }
);

const tickerSlice = createSlice({
  name: "tickers",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setQueryDisplay(state, action: PayloadAction<string>) {
      state.queryDisplay = action.payload;
    },
    clearResults(state) {
      state.results = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickers.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchTickers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setQuery, clearResults, setQueryDisplay } = tickerSlice.actions;
export default tickerSlice.reducer;
