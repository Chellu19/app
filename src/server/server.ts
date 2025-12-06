import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // allow all origins (safe for dev)
app.use(express.json());

// GET /api/search?q=AAPL
app.get("/api/search", async (req: Request, res: Response) => {
  try {
    const q = req.query.q;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Missing query parameter `q`" });
    }

    const yahooRes = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${q}`
    );

    if (!yahooRes.ok) {
      return res
        .status(yahooRes.status)
        .json({ error: "Yahoo API request failed" });
    }

    const data = await yahooRes.json();
    return res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
