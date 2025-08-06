import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { PriceHistory } from "@/lib/db/models/PriceHistory";

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ symbol: string }> }
) {
  const params = await paramsPromise;
  const symbol = params.symbol?.toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const days = daysParam ? parseInt(daysParam, 10) : 2;

  if (isNaN(days) || days <= 0) {
    return NextResponse.json(
      { error: "Invalid days parameter. Must be a positive number." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const historicalData = await PriceHistory.find({
      symbol: symbol,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: "asc" })
      .select("USD timestamp -_id") // Chỉ chọn trường USD và timestamp
      .lean(); // Sử dụng .lean() để trả về plain JavaScript objects

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json(
        {
          message: `No historical data found for ${symbol} in the last ${days} days.`,
          data: [],
        },
        { status: 200 }
      );
    }
    
    // Đảm bảo timestamp là một chuỗi ISO để nhất quán
    const formattedData = historicalData.map(item => ({
        ...item,
        timestamp: item.timestamp.toISOString(),
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error(
      `Error fetching historical prices for ${symbol}:`,
      error
    );
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch historical prices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic"; 