import { NextRequest, NextResponse } from "next/server";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { bsc } from "thirdweb/chains";
import { DATASTAKING } from "@/Context/listaddress";
import { formatTokenAmount } from "@/lib/convertNumber";
import { useReadContract } from "thirdweb/react";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;
    
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        message: "Thiếu địa chỉ ví"
      }, { status: 400 });
    }
    
    // Khởi tạo contract
    const contract = getContract({
      client: client,
      chain: bsc,
      address: DATASTAKING,
    });


    // Gọi hàm users từ contract để lấy dữ liệu
    const userData = await readContract({
      contract,
      method: "function users(address _user) view returns (uint256 totalStaked, uint256 totalMaxOut, uint256 totalEarned)",
      params: [walletAddress]
    });
    
    // Kiểm tra nếu không có dữ liệu
    if (!userData) {
      return NextResponse.json({
        success: false,
        message: "Không tìm thấy dữ liệu từ blockchain"
      }, { status: 404 });
    }
    
    // Trả về dữ liệu đã xử lý
    return NextResponse.json({
      success: true,
      data: {
        totalStaked: userData[0].toString(),
        totalMaxOut: userData[1].toString(),
        totalEarned: userData[2].toString(),
        formatted: {
          totalStaked: formatTokenAmount(userData[0].toString()),
          totalMaxOut: formatTokenAmount(userData[1].toString()),
          totalEarned: formatTokenAmount(userData[2].toString())
        }
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ contract:", error);
    
    let errorMessage = "Lỗi không xác định";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Lỗi khi truy vấn blockchain", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 