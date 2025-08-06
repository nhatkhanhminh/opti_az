import { NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { Investment } from '@/lib/db/models/Investment';

export async function GET() {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Thống kê tổng claim theo token
    const totalByTokenPipeline = [
      {
        $match: {
          totalClaimed: { $gt: 0 } // Chỉ lấy các bản ghi có totalClaimed > 0
        }
      },
      {
        $group: {
          _id: "$token",
          total: { $sum: "$totalClaimed" }
        }
      },
      {
        $project: {
          _id: 0,
          token: "$_id",
          total: { $round: ["$total", 2] } // Làm tròn đến 2 chữ số thập phân
        }
      }
    ];
    
    const tokenTotals = await Investment.aggregate(totalByTokenPipeline);
    
    // Tạo object với key là token và value là total
    const totalByToken = tokenTotals.reduce((result: Record<string, number>, item: any) => {
      result[item.token] = item.total;
      return result;
    }, {});
    
    // Thống kê theo trạng thái
    const statsByStatusPipeline = [
      {
        $match: {
          totalClaimed: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalClaimed: { $sum: "$totalClaimed" }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          totalClaimed: { $round: ["$totalClaimed", 2] }
        }
      }
    ];
    
    const statsByStatus = await Investment.aggregate(statsByStatusPipeline);
    
    // Các thống kê tổng quát
    const overallStatsPipeline = [
      {
        $match: {
          totalClaimed: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalClaimed: { $sum: "$totalClaimed" },
          avgClaimed: { $avg: "$totalClaimed" },
          maxClaimed: { $max: "$totalClaimed" },
          minClaimed: { $min: "$totalClaimed" }
        }
      },
      {
        $project: {
          _id: 0,
          totalCount: 1,
          totalClaimed: { $round: ["$totalClaimed", 2] },
          avgClaimed: { $round: ["$avgClaimed", 2] },
          maxClaimed: { $round: ["$maxClaimed", 2] },
          minClaimed: { $round: ["$minClaimed", 2] }
        }
      }
    ];
    
    const overallStats = await Investment.aggregate(overallStatsPipeline);
    
    return NextResponse.json({
      success: true,
      data: {
        totalByToken,
        statsByStatus,
        overallStats: overallStats.length > 0 ? overallStats[0] : null
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy thống kê chi phí claim:", error);
    
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