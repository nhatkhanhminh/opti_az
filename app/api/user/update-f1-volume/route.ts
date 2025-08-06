import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { address, f1Volume } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu địa chỉ ví" 
      }, { status: 400 });
    }

    if (f1Volume === undefined || f1Volume === null) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu giá trị f1Volume" 
      }, { status: 400 });
    }

    // Cập nhật hoặc tạo mới user với trường directVolume (F1 Volume)
    const updatedUser = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { 
        $set: { 
          directVolume: f1Volume, // Lưu vào trường directVolume thay vì f1Volume
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
      message: "Cập nhật F1 volume thành công",
      data: {
        address: updatedUser.address,
        directVolume: updatedUser.directVolume // Trả về giá trị từ trường directVolume
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi cập nhật F1 volume:", error);
    
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