// app/api/prices/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { PriceHistory } from "@/lib/db/models/PriceHistory";

async function fetchFallbackPrices() {
  const API_URL = "https://api.coingecko.com/api/v3/simple/price";
  const COIN_IDS = {
    BNB: "binancecoin",
    USDC: "usd-coin",
    USDT: "tether",
    WLD: "worldcoin",
    FIL: "filecoin",
    BTC: "bitcoin",
    ETH: "ethereum",
    LINK: "chainlink",
  };

  try {
    const response = await fetch(
      `${API_URL}?ids=${Object.values(COIN_IDS).join(",")}&vs_currencies=usd&include_24hr_change=true`,
      { cache: "no-store" }
    );
    const data = await response.json();

    const prices: Record<string, { USD: number; change24h: number; lastUpdated: string }> = {};
    Object.entries(COIN_IDS).forEach(([symbol, id]) => {
      const tokenData = data[id];
      if (tokenData) {
        prices[symbol] = {
          USD: tokenData.usd,
          change24h: tokenData.usd_24h_change,
          lastUpdated: new Date(tokenData.last_updated_at * 1000).toISOString(),
        };
      }
    });
    return prices;
  } catch (error) {
    console.error("Error fetching fallback prices:", error);
    return null;
  }
}

async function getLatestPricesFromDB() {
  try {
    await connectDB();

    const latestPrices = await PriceHistory.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$symbol",
          USD: { $first: "$USD" },
          change24h: { $first: "$change24h" },
          lastUpdated: { $first: "$timestamp" },
        },
      },
    ]);

    const prices: Record<string, { USD: number; change24h: number; lastUpdated: string }> = {};
    latestPrices.forEach((price) => {
      prices[price._id] = {
        USD: price.USD,
        change24h: price.change24h,
        lastUpdated: price.lastUpdated.toISOString(),
      };
    });

    if (Object.keys(prices).length === 0) {
      const fallbackPrices = await fetchFallbackPrices();
      if (fallbackPrices) {
        const priceEntries = Object.entries(fallbackPrices).map(([symbol, data]) => ({
          symbol,
          USD: data.USD,
          change24h: data.change24h,
          timestamp: new Date(data.lastUpdated),
        }));
        await PriceHistory.insertMany(priceEntries);
        return fallbackPrices;
      }
    }

    return prices;
  } catch (error) {
    console.error("Error fetching prices from database:", error);
    return null;
  }
}

export async function GET() {
  try {
    const prices = await getLatestPricesFromDB();
    if (!prices) {
      throw new Error("Failed to fetch prices from database or fallback");
    }
    return NextResponse.json({ prices }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch prices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";