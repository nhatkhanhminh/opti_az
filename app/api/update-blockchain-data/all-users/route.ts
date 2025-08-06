import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy danh sách tất cả người dùng với thông tin totalInvestment, totalEarned, teamVolume và directVolume
    const users = await User.find({}, 'address totalInvestment totalEarned teamVolume directVolume updatedAt')
      .sort({ totalInvestment: -1 }) // Sắp xếp theo totalInvestment giảm dần
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: users,
      count: users.length
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    
    let errorMessage = "Lỗi không xác định";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Lỗi máy chủ", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}