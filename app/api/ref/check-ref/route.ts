// app/api/check-circular-referral/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userAddress, uplineAddress } = await req.json();
    
    // Kiểm tra nếu user đang set chính mình làm upline
    if (userAddress.toLowerCase() === uplineAddress.toLowerCase()) {
      return NextResponse.json({ 
        isCircular: true,
        message: "Cannot set yourself as upline" 
      });
    }
    
    // Kiểm tra vòng lặp referral
    const hasCircular = await checkCircularReferral(userAddress, uplineAddress);
    
    return NextResponse.json({ 
      isCircular: hasCircular,
      message: hasCircular ? "Circular referral chain detected" : "Valid upline"
    });
  } catch (error) {
    console.error("Error checking circular referral:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Hàm kiểm tra vòng lặp
async function checkCircularReferral(userAddress: string, uplineAddress: string, depth: number = 0, visited: Set<string> = new Set()) {
  // Giới hạn độ sâu để tránh stack overflow
  if (depth > 10) return false;
  
  // Nếu người dùng hiện tại nằm trong chuỗi upline, có vòng lặp
  if (uplineAddress.toLowerCase() === userAddress.toLowerCase()) {
    return true;
  }
  
  // Nếu đã thăm địa chỉ này, có vòng lặp
  if (visited.has(uplineAddress.toLowerCase())) {
    return true;
  }
  
  // Thêm upline hiện tại vào danh sách đã thăm
  visited.add(uplineAddress.toLowerCase());
  
  // Tìm upline của upline
  const uplineUser = await User.findOne({ address: uplineAddress });
  if (!uplineUser || !uplineUser.referrer) return false;
  
  // Kiểm tra đệ quy lên tuyến trên
  return checkCircularReferral(userAddress, uplineUser.referrer, depth + 1, visited);
}
