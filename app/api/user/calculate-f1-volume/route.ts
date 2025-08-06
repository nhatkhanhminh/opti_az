import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { address } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu địa chỉ ví" 
      }, { status: 400 });
    }
    
    // Kiểm tra địa chỉ ví 0x0000... và không lưu vào DB
    if (address.match(/^0x0{5,}/)) {
      return NextResponse.json({ 
        success: false, 
        message: "Địa chỉ ví không hợp lệ (0x0000...)",
        data: {
          address: address,
          directVolume: 0,
          f1Count: 0
        }
      }, { status: 400 });
    }

    // Tìm tất cả user F1 trực tiếp (user có referrer là địa chỉ được chỉ định)
    const f1Users = await User.find({ 
      referrer: address.toLowerCase()
    });
    
    // Tính tổng totalInvestment của tất cả user F1
    let f1Volume = 0;
    for (const user of f1Users) {
      // Nếu user có totalInvestment, cộng vào tổng
      if (user.totalInvestment && typeof user.totalInvestment === 'number') {
        f1Volume += user.totalInvestment;
      }
    }
    
    // Cập nhật directVolume cho user
    const updatedUser = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { 
        $set: { 
          directVolume: f1Volume,
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
      message: "Tính toán và cập nhật F1 volume thành công",
      data: {
        address: updatedUser.address,
        directVolume: updatedUser.directVolume,
        f1Count: f1Users.length
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi tính toán F1 volume:", error);
    
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