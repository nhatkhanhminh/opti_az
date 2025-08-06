import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    // Kết nối đến database
    await connectDB();

    // Lấy địa chỉ user từ query parameter
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "no address" }, { status: 400 });
    }

    // Chuẩn hóa địa chỉ ví (lowercase)
    const normalizedAddress = address.toLowerCase();

    // Tìm user trong database
    const user = await User.findOne({ address: normalizedAddress });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Not found",
        totalDownlines: 0
      });
    }

    // Trả về số lượng tuyến dưới đã được lưu trữ
    return NextResponse.json({
      success: true,
      totalDownlines: user.totalDownlines || 0,
      address: normalizedAddress,
      directReferrals: user.directReferrals || 0
    });
  } catch (error) {
    console.error("error get downline count:", error);
    return NextResponse.json(
      { error: "server error", details: String(error) },
      { status: 500 }
    );
  }
} 