// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import tickerReducer from "./ticker";

export const store = configureStore({
  reducer: {
    tickers: tickerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
