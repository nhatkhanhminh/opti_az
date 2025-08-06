import { NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { Investment } from '@/lib/db/models/Investment';

export async function GET() {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Truy vấn danh sách top 5 stake có chi phí claim cao nhất
    const topClaimersPipeline = [
      // Bước 1: Chỉ lấy các bản ghi có totalClaimed > 0
      { 
        $match: { 
          totalClaimed: { $gt: 0 } 
        } 
      },
      // Bước 2: Sắp xếp giảm dần theo totalClaimed
      { 
        $sort: { 
          "totalClaimed": -1 
        } 
      },
      // Bước 3: Chỉ lấy 5 bản ghi đầu tiên
      { 
        $limit: 5 
      },
      // Bước 4: Chọn các trường cần thiết
      { 
        $project: { 
          _id: 0,
          stakeId: 1,
          userAddress: 1,
          token: 1,
          totalClaimed: 1,
          status: 1,
          startDate: 1
        } 
      }
    ] as any[];
    
    const topClaimers = await Investment.aggregate(topClaimersPipeline);
    
    return NextResponse.json({
      success: true,
      data: topClaimers
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy danh sách top claimers:", error);
    
    let errorMessage = "Lỗi không xác định";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Lỗi khi truy vấn cơ sở dữ liệu", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}