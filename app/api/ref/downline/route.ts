// app/api/downlines/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress')?.toLowerCase();
    const level = searchParams.get('level') || 'all';
    const investmentStatus = searchParams.get('investmentStatus') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 });
    }
    
    // Các trường cần lấy từ database
    const fieldsToSelect = {
      address: 1,
      referrer: 1,
      totalInvestment: 1,
      directVolume: 1,
      teamVolume: 1,
      createdAt: 1,
      timeJoin: 1,
      isActive: 1,
      _id: 1
    };
    
    // Query để lấy các F1
    const f1Query = { referrer: userAddress };
    
    const directDownlines = await User.find(f1Query)
      .select(fieldsToSelect)
      .lean()
      .exec();
    
    // Add this line to mark F1 users with level 1
    directDownlines.forEach(user => { user.level = 1 });

    let allDownlines = [...directDownlines];
    
    if (level === 'all' || parseInt(level) > 1) {
      // Lấy các ID của F1 để tìm F2
      let currentLevel = 1;
      let previousLevelAddresses = directDownlines.map(user => user.address);
      
      // Lặp qua các cấp từ F2 đến F10
      while (currentLevel < 10 && previousLevelAddresses.length > 0 && (level === 'all' || parseInt(level) > currentLevel)) {
        currentLevel++;
        
        // Tìm tuyến dưới của cấp trước đó
        const nextLevelQuery = { referrer: { $in: previousLevelAddresses } };
        const nextLevelDownlines = await User.find(nextLevelQuery)
          .select(fieldsToSelect)
          .lean()
          .exec();
        
        // Đánh dấu level
        nextLevelDownlines.forEach(user => { user.level = currentLevel; });
        
        // Thêm vào mảng kết quả
        allDownlines = [...allDownlines, ...nextLevelDownlines];
        
        // Chuẩn bị cho cấp tiếp theo
        previousLevelAddresses = nextLevelDownlines.map(user => user.address);
        
        // Nếu không còn tuyến dưới, dừng vòng lặp
        if (nextLevelDownlines.length === 0) {
          break;
        }
      }
    }
    
    // Lọc theo level
    if (level !== 'all') {
      allDownlines = allDownlines.filter(user => user.level === parseInt(level));
    }
    
    // Lọc theo trạng thái đầu tư
    if (investmentStatus !== 'all') {
      const hasInvestment = investmentStatus === 'invested';
      allDownlines = allDownlines.filter(user => 
        hasInvestment ? (user.totalInvestment > 0) : (user.totalInvestment === 0)
      );
    }
    
    // Phân trang
    const totalCount = allDownlines.length;
    const paginatedDownlines = allDownlines.slice((page - 1) * limit, page * limit);
    
    // Lấy thông tin người dùng hiện tại
    const currentUser = await User.findOne({ address: userAddress })
      .select(fieldsToSelect)
      .lean()
      .exec();
    
    // Debug thông tin đơn giản hơn
    console.log('API Debug - Total downlines:', allDownlines.length);
    console.log('API Debug - Has current user data:', !!currentUser);
    
    return NextResponse.json({
      success: true,
      data: paginatedDownlines,
      currentUser: currentUser || null,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching downlines:", error);
    return NextResponse.json(
      { error: "Failed to fetch downlines" },
      { status: 500 }
    );
  }
}