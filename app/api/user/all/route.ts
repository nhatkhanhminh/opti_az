import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy tham số giới hạn từ query
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    // Lấy danh sách người dùng với thông tin address và referrer
    const users = await User.find({}, 'address referrer')
      .limit(limit)
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