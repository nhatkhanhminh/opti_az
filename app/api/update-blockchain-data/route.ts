import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { formatTokenAmount } from "@/lib/convertNumber";

export async function GET(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy địa chỉ ví từ query params
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: "missing address" 
      }, { status: 400 });
    }

    // Tìm thông tin người dùng
    const user = await User.findOne({ address: address.toLowerCase() }).lean();
    
    if (!user) {
      const updatedUser = await User.findOneAndUpdate(
        { address: address.toLowerCase() },
        { 
          $set: { referrer: null },
          $setOnInsert: { 
            createdAt: new Date(),
            totalStaked: 0,
            totalEarned: 0,
            isActive: true
          }
        },
        { 
          new: true,
          upsert: true 
        }
      );
      return NextResponse.json({ 
        success: true, 
        data: updatedUser
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: user
    });
    
  } catch (error) {
    console.error("error get user info:", error);
    
    let errorMessage = "unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "server error", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { walletAddress, totalInvestment, totalEarned } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        message: "missing address" 
      }, { status: 400 });
    }

    // Chuyển đổi dữ liệu từ cơ số 18 sang số thập phân thông thường
    const totalInvestmentFormatted = parseFloat(formatTokenAmount(totalInvestment, 18, 8));
    const totalEarnedFormatted = parseFloat(formatTokenAmount(totalEarned, 18, 8));
    
    // Tạo hoặc cập nhật người dùng
    const updatedUser = await User.findOneAndUpdate(
      { address: walletAddress.toLowerCase() },
      { 
        $set: { 
          totalInvestment: totalInvestmentFormatted,
          totalEarned: totalEarnedFormatted,
          rawInvestment: totalInvestment.toString(), // Lưu giữ giá trị gốc
          rawEarned: totalEarned.toString(),         // Lưu giữ giá trị gốc
          updatedAt: new Date()
        },
        $setOnInsert: {
          address: walletAddress.toLowerCase(),
          createdAt: new Date(),
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "update data success",
      data: {
        address: updatedUser.address,
        totalInvestment: updatedUser.totalInvestment,
        totalEarned: updatedUser.totalEarned,
        rawInvestment: updatedUser.rawInvestment,
        rawEarned: updatedUser.rawEarned
      }
    });
    
  } catch (error) {
    console.error("error update blockchain data:", error);
    
    let errorMessage = "unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "server error", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}