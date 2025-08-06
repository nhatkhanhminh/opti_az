import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { Investment } from '@/lib/db/models/Investment';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy query params
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '2000');
    
    // Tạo filter query
    const filterQuery: any = {};
    
    if (userAddress) {
      filterQuery.userAddress = userAddress.toLowerCase();
    }
    
    if (status) {
      filterQuery.status = status;
    }
    
    // Lấy danh sách investments với pagination
    const investments = await Investment.find(filterQuery)
      .sort({ startDate: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: investments,
      count: investments.length,
      pagination: {
        limit
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy danh sách investments:", error);
    
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