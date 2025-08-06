import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy danh sách địa chỉ ví từ body request
    const body = await req.json();
    const { addresses } = body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cần cung cấp mảng địa chỉ ví" 
      }, { status: 400 });
    }
    
    // Chuẩn hóa địa chỉ (chuyển thành chữ thường)
    const normalizedAddresses = addresses.map(addr => addr.toLowerCase());
    
    // Truy vấn thông tin teamVolume cho các địa chỉ
    const leaders = await User.find(
      { address: { $in: normalizedAddresses } },
      { address: 1, teamVolume: 1, totalInvestment: 1, directVolume: 1, directReferrals: 1, totalDownlines: 1 }
    ).lean();
    
    // Đếm trực tiếp số lượng F1 từ cơ sở dữ liệu - dữ liệu chính xác hơn
    const directReferralCounts = await Promise.all(normalizedAddresses.map(async (address) => {
      const count = await User.countDocuments({ referrer: address.toLowerCase() });
      return { address, count };
    }));
    
    // Tạo kết quả với đầy đủ thông tin và cập nhật số F1 chính xác
    const result = normalizedAddresses.map(address => {
      const leader = leaders.find(l => l.address.toLowerCase() === address);
      const referralData = directReferralCounts.find(d => d.address === address);
      const directReferralsCount = referralData ? referralData.count : 0;
      
      // Đảm bảo mỗi leader có ít nhất 1 F1 (cho mục đích hiển thị)
      const minDirectReferrals = Math.max(directReferralsCount, leader?.directReferrals || 0, 1);
      
      return {
        address,
        teamVolume: leader?.teamVolume || 0,
        totalInvestment: leader?.totalInvestment || 0,
        directVolume: leader?.directVolume || 0,
        directReferrals: minDirectReferrals,
        totalDownlines: Math.max((leader?.totalDownlines || 0), minDirectReferrals), // Đảm bảo tổng số tuyến dưới ít nhất bằng số F1
        found: !!leader
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      data: result,
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy thông tin team volume:", error);
    
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