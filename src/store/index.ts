import { configureStore } from "@reduxjs/toolkit";
import tickerReducer from "./ticker";

export const store = configureStore({
  reducer: {
    tickers: tickerReducer,
  },
});
