import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Investment } from '@/lib/db/models/Investment';

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { userAddress } = body;
    
    // Tạo filter điều kiện
    const filter: any = {};
    if (userAddress) {
      filter.userAddress = userAddress;
    }
    
    // Tìm tất cả userAddress duy nhất từ bảng Investment
    const uniqueAddresses = await Investment.aggregate([
      { $match: filter },
      { $group: { 
        _id: "$userAddress",
        // Tổng giá trị đầu tư (USDT)
        totalInvestment: { $sum: "$usdtValue" },
        // Tổng đầu tư đang hoạt động
        activeInvestment: { 
          $sum: { 
            $cond: [
              { $eq: ["$status", "active"] }, 
              "$usdtValue", 
              0
            ] 
          }
        },
        // Tổng lãi đã kiếm được
        totalEarned: { $sum: "$earned" }
      }}
    ]);
    
    // Cập nhật hoặc tạo mới user
    let updatedCount = 0;
    let createdCount = 0;

    for (const item of uniqueAddresses) {
      const userAddress = item._id;
      const totalInvestment = item.totalInvestment || 0;
      const activeInvestment = item.activeInvestment || 0;
      const totalEarned = item.totalEarned || 0;
      
      // Kiểm tra xem user đã tồn tại chưa
      const existingUser = await User.findOne({ address: userAddress });
      
      if (existingUser) {
        // Cập nhật user
        await User.updateOne(
          { address: userAddress },
          { 
            $set: { 
              totalInvestment,
              activeInvestment,
              totalEarned
            }
          }
        );
        updatedCount++;
      } else {
        // Tạo mới user nếu chưa tồn tại
        await User.create({
          address: userAddress,
          totalInvestment,
          activeInvestment,
          totalEarned,
          timeJoin: new Date()
        });
        createdCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thành công dữ liệu đầu tư của người dùng',
      stats: {
        totalProcessed: uniqueAddresses.length,
        updated: updatedCount,
        created: createdCount
      }
    });
    
  } catch (error: any) {
    console.error('Lỗi khi cập nhật dữ liệu đầu tư:', error);
    return NextResponse.json({
      success: false,
      message: `Lỗi khi cập nhật dữ liệu đầu tư: ${error.message}`,
    }, { status: 500 });
  }
} 