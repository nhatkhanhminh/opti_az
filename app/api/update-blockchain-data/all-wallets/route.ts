import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy tất cả địa chỉ ví từ cơ sở dữ liệu
    const users = await User.find({}, 'address').lean();
    
    // Tạo mảng địa chỉ ví
    const walletAddresses = users.map(user => user.address);
    
    return NextResponse.json({ 
      success: true, 
      data: walletAddresses,
      count: walletAddresses.length
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ ví:", error);
    
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