import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    // Gọi API để cập nhật giá
    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + "/api/prices/update");
    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update prices";
    console.error("Cron job error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic"; 