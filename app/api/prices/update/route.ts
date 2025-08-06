// app/api/prices/update/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/db/connect";
import { PriceHistory } from "@/lib/db/models/PriceHistory";

const API_URL = "https://api.coingecko.com/api/v3/simple/price";
const COIN_IDS = {
  BNB: "binancecoin",
  USDC: "usd-coin",
  USDT: "tether",
  FIL: "filecoin",
  BTC: "bitcoin",
  ETH: "ethereum",
  LINK: "chainlink",
};

// Danh sách các stablecoin có giá cố định 1 USD
const STABLE_COINS = ["USDT", "USDC"];

async function updatePrices() {
  try {
    // Lấy thời gian hiện tại cho stablecoin
    const currentTime = new Date().toISOString();
    
    // Khởi tạo đối tượng prices
    const prices: Record<string, { USD: number; change24h: number; lastUpdated: string }> = {};
    
    // Thiết lập giá cố định cho stablecoin
    STABLE_COINS.forEach(symbol => {
      prices[symbol] = {
        USD: 1, // Giá cố định 1 USD
        change24h: 0, // Không có thay đổi giá
        lastUpdated: currentTime,
      };
    });
    
    // Lấy danh sách các token không phải stablecoin cần cập nhật từ API
    const nonStableCoinIds = Object.entries(COIN_IDS)
      .filter(([symbol]) => !STABLE_COINS.includes(symbol))
      .map(([, id]) => id)
      .join(",");
    
    // Chỉ gọi API nếu có token cần cập nhật
    if (nonStableCoinIds.length > 0) {
      const response = await axios.get(API_URL, {
        params: {
          ids: nonStableCoinIds,
          vs_currencies: "usd",
          include_24hr_change: true,
        },
        timeout: 10000,
      });

      // Xử lý dữ liệu từ API cho các token không phải stablecoin
      Object.entries(COIN_IDS).forEach(([symbol, id]) => {
        // Bỏ qua các stablecoin vì đã được thiết lập ở trên
        if (STABLE_COINS.includes(symbol)) {
          return;
        }
        
        const tokenData = response.data[id];
        if (tokenData && tokenData.usd && tokenData.usd_24h_change !== undefined) {
          // Kiểm tra last_updated_at trước khi tạo Date
          const timestamp = tokenData.last_updated_at;
          let lastUpdated: string;
          if (typeof timestamp === "number" && !isNaN(timestamp)) {
            lastUpdated = new Date(timestamp * 1000).toISOString();
          } else {
            // console.warn(`Invalid last_updated_at for ${symbol}: ${timestamp}`);
            lastUpdated = currentTime; // Dùng thời gian hiện tại làm fallback
          }

          prices[symbol] = {
            USD: tokenData.usd,
            change24h: tokenData.usd_24h_change,
            lastUpdated,
          };
        } else {
          console.warn(`Missing data for ${symbol} from CoinGecko`);
        }
      });
    }

    await connectDB();
    const priceEntries = Object.entries(prices).map(([symbol, data]) => ({
      symbol,
      USD: data.USD,
      change24h: data.change24h,
      timestamp: new Date(data.lastUpdated),
    }));

    await Promise.all(
      priceEntries.map((entry) =>
        PriceHistory.updateOne(
          { symbol: entry.symbol, timestamp: entry.timestamp },
          { $set: entry },
          { upsert: true }
        )
      )
    );

    return prices;
  } catch (error) {
    console.error("Error updating prices:", error);
    throw error instanceof Error ? error : new Error("Unknown error updating prices");
  }
}

export async function POST() {
  try {
    const prices = await updatePrices();
    return NextResponse.json({ success: true, prices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update prices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";