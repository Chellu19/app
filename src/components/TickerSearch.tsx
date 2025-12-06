// TickerSearch.tsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setQuery, clearResults, fetchTickers } from "../store/ticker";
import "./TickerSearch.css";
import type { Ticker } from "../types";
import { setQueryDisplay } from "../store/ticker";
interface Props {
  onSelect?: (ticker: Ticker) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TickerSearch: React.FC<Props> = ({ onSelect, onKeyDown }) => {
  const dispatch = useAppDispatch();
  const { query, results, loading, queryDisplay } = useAppSelector(
    (s) => s.tickers
  );

  const [highlight, setHighlight] = useState<number>(0);

  // Debounce ticker search
  useEffect(() => {
    if (!query) {
      dispatch(clearResults());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(fetchTickers(query));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handleSelect = (item: Ticker) => {
    onSelect?.(item);
    dispatch(setQuery(""));
    dispatch(setQueryDisplay(item.shortname || ""));
    dispatch(clearResults());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlight]) {
      handleSelect(results[highlight]);
    }
  };

  return (
    <>
      <input
        className="input-box"
        placeholder="Search ticker (AAPL, NVDA, TSLA...)"
        value={queryDisplay}
        onChange={(e) => {
          dispatch(setQuery(e.target.value));
          dispatch(setQueryDisplay(e.target.value));
        }}
        onKeyDown={(e) => {
          handleKeyDown(e);
          if (onKeyDown) {
            onKeyDown(e);
          }
        }}
      />

      {loading && (
        <div className="absolute bg-black border w-full mt-1 p-2">
          Loading...
        </div>
      )}

      {results.length > 0 && (
        <div className="suggestions-box">
          {results.map((r, i) => (
            <div
              key={r.symbol}
              className={`px-4 py-2 cursor-pointer ${
                i === highlight ? "suggestion-item" : "suggestion-item"
              }`}
              onClick={() => handleSelect(r)}
            >
              <div className="suggestion-item">
                <div>{r.symbol}</div>
                <div>{r.shortname}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TickerSearch;
