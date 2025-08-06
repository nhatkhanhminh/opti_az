import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { address, teamVolume } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu địa chỉ ví" 
      }, { status: 400 });
    }

    if (teamVolume === undefined || teamVolume === null) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu giá trị teamVolume" 
      }, { status: 400 });
    }
    
    // Kiểm tra địa chỉ ví 0x0000... và không lưu vào DB
    if (address.match(/^0x0{5,}/)) {
      return NextResponse.json({ 
        success: false, 
        message: "Địa chỉ ví không hợp lệ (0x0000...)" 
      }, { status: 400 });
    }

    // Cập nhật hoặc tạo mới user với trường teamVolume
    const updatedUser = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { 
        $set: { 
          teamVolume: teamVolume,
          updatedAt: new Date()
        },
        $setOnInsert: {
          address: address.toLowerCase(),
          createdAt: new Date(),
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Cập nhật team volume thành công",
      data: {
        address: updatedUser.address,
        teamVolume: updatedUser.teamVolume
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi cập nhật team volume:", error);
    
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