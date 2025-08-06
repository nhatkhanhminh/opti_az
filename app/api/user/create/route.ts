import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request body
    const data = await req.json();
    const { address } = data;
    
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu địa chỉ ví"
      }, { status: 400 });
    }

    // Chuẩn hóa địa chỉ ví (lowercase)
    const normalizedAddress = address.toLowerCase();

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ address: normalizedAddress });
    
    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: "Người dùng đã tồn tại",
        isNew: false,
        user: {
          address: existingUser.address,
          referrer: existingUser.referrer || null
        }
      });
    }
    
    // Tạo user mới
    const newUser = new User({
      address: normalizedAddress,
      referrer: data.referrer || null,
      totalInvestment: data.totalInvestment || 0,
      activeInvestment: data.activeInvestment || 0,
      rawInvestment: data.rawInvestment || '0',
      totalEarned: data.totalEarned || 0,
      rawEarned: data.rawEarned || '0',
      maxOut: data.maxOut || 0,
      level: data.level || 0,
      teamVolume: data.teamVolume || 0,
      directReferrals: data.directReferrals || 0,
      directVolume: data.directVolume || 0,
      totalDownlines: data.totalDownlines || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      timeJoin: data.timeJoin || new Date(),
      createdAt: new Date()
    });
    
    await newUser.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Tạo người dùng mới thành công",
      isNew: true,
      user: {
        address: newUser.address,
        referrer: newUser.referrer || null
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi tạo người dùng mới:", error);
    
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