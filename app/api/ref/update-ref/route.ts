// app/api/update-referral/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
// import { verifyMessage } from "ethers";

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { userAddress, referrerAddress } = body;
    
    // Validate input
    if (!userAddress || !referrerAddress) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required parameters" 
      }, { status: 400 });
    }
    
    // Xác thực chữ ký để đảm bảo request đến từ đúng người dùng
    // const recoveredAddress = verifyMessage(message, signature);
    // if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
    //   return NextResponse.json({ 
    //     success: false, 
    //     message: "Invalid signature" 
    //   }, { status: 401 });
    // }
    
    // Lấy thông tin upline cũ (nếu có)
    const existingUser = await User.findOne({ address: userAddress.toLowerCase() });
    const oldReferrer = existingUser?.referrer;
    
    // Cập nhật hoặc tạo mới user với referrer mới
    const updatedUser = await User.findOneAndUpdate(
      { address: userAddress.toLowerCase() },
      { 
        $set: { 
          address: userAddress.toLowerCase(),
          referrer: referrerAddress.toLowerCase(),
          timeJoin: new Date(),
          updatedAt: new Date()
        } 
      },
      { upsert: true, new: true }
    );
    
    // Chỉ cần cập nhật directReferrals của upline mới
    if (referrerAddress) {
      await User.updateOne(
        { address: referrerAddress.toLowerCase() },
        { $inc: { directReferrals: 1 } }
      );
    }
    
    // Nếu đây là thay đổi upline (không phải đăng ký mới)
    if (oldReferrer && oldReferrer !== referrerAddress.toLowerCase()) {
      // Giảm directReferrals cho upline cũ
      await User.updateOne(
        { address: oldReferrer.toLowerCase() },
        { $inc: { directReferrals: -1 } }
      );
    }

    // Thay vì cập nhật totalDownlines ở đây, chúng ta gọi API calculate-downlines
    // để tính toán lại tất cả các tuyến dưới một cách chính xác
    // try {
    //   // Gọi API nội bộ để tính toán lại tuyến dưới
    //   // Sử dụng fetch có sẵn trong Next.js
    //   const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/user/calculate-downlines?token=${process.env.ADMIN_API_TOKEN}`;
      
    //   const response = await fetch(apiUrl);
    //   if (!response.ok) {
    //     console.warn('Không thể gọi API tính toán tuyến dưới:', await response.text());
    //   }
    // } catch (error) {
    //   console.error('Lỗi khi gọi API tính toán tuyến dưới:', error);
    //   // Vẫn tiếp tục xử lý, không cần phải thất bại toàn bộ request
    // }
    
    return NextResponse.json({ 
      success: true, 
      message: "Referral updated successfully",
      data: {
        address: updatedUser.address.toLowerCase(),
        referrer: updatedUser.referrer.toLowerCase(),
        oldReferrer: oldReferrer || null
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating referral:", error);
    
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal Server Error", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
