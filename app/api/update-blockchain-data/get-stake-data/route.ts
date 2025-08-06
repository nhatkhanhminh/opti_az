import { NextRequest, NextResponse } from "next/server";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { bsc } from "thirdweb/chains";
import { DATASTAKING } from "@/Context/listaddress";
import { formatTokenAmount } from "@/lib/convertNumber";
import { formatUsdtAmount } from "@/lib/formatUsdt";
import { getUserStakes } from "@/ultis/useStakeInfo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stakeId } = body;
    
    if (stakeId === undefined) {
      return NextResponse.json({
        success: false,
        message: "Thiếu ID stake"
      }, { status: 400 });
    }
    
    // Khởi tạo contract
    const contract = getContract({
      client: client,
      chain: bsc,
      address: DATASTAKING,
    });
   
    // Giảm tải truy vấn bằng cách thêm thời gian chờ
    await new Promise(resolve => setTimeout(resolve, 500));

    // Gọi hàm getStakeInfo từ contract để lấy dữ liệu
    let stakeData;
    try {
      stakeData = await readContract({
        contract,
        method: "function getStakeInfo(uint256 _stakeId) view returns (address user, address token, uint256 amount, uint256 usdtAmount, uint256 planId, uint256 startTime, bool active, uint256 totalClaimed, uint256 lastClaimTime)",
        params: [stakeId]
      });
    } catch (readError: unknown) {
      console.error(`Lỗi khi đọc dữ liệu stake ${stakeId}:`, readError);
      
      // Kiểm tra lỗi AbiDecodingZeroDataError
      if (readError instanceof Error && readError.toString().includes('AbiDecodingZeroDataError')) {
        return NextResponse.json({
          success: false,
          message: "Lỗi AbiDecodingZeroDataError: Không thể đọc dữ liệu từ blockchain",
          details: "Có thể đã vượt quá giới hạn request hoặc stake không tồn tại"
        }, { status: 429 });
      }
      
      throw readError; // Ném lỗi để được xử lý ở catch bên ngoài
    }
    
    // Kiểm tra nếu không có dữ liệu
    if (!stakeData) {
      return NextResponse.json({
        success: false,
        message: "Không tìm thấy dữ liệu stake từ blockchain"
      }, { status: 404 });
    }
    
    // Đọc thông tin plan
    // const planData = await readContract({
    //   contract,
    //   method: "function plans(uint256 _planId) view returns (uint256 minAmount, uint256 maxAmount, uint256 monthlyROI, uint256 dailyROI)",
    //   params: [stakeData[4]]
    // }).catch(() => null); // Bắt lỗi nếu không đọc được thông tin plan
    
    // Tạo đối tượng dữ liệu
    const formattedData = {
      stakeId,
      user: stakeData[0],
      token: stakeData[1],
      amount: stakeData[2].toString(),
      usdtAmount: stakeData[3].toString(),
      planId: stakeData[4].toString(),
      startTime: stakeData[5].toString(),
      active: stakeData[6],
      totalClaimed: stakeData[7].toString(),
      lastClaimTime: stakeData[8].toString(),
      // plan: planData ? {
      //   minAmount: planData[0].toString(),
      //   maxAmount: planData[1].toString(),
      //   monthlyROI: planData[2].toString(),
      //   dailyROI: planData[3].toString(),
      // } : null,
      formatted: {
        amount: formatTokenAmount(stakeData[2].toString()),
        usdtAmount: formatUsdtAmount(stakeData[3].toString()),
        totalClaimed: formatTokenAmount(stakeData[7].toString()),
        startDate: new Date(Number(stakeData[5]) * 1000).toLocaleString(),
        lastClaimDate: stakeData[8].toString() !== "0" 
          ? new Date(Number(stakeData[8]) * 1000).toLocaleString() 
          : null,
        // monthlyRate: planData ? Number(planData[2]) / 100 : 0,
        // dailyRate: planData ? Number(planData[3]) / 100 : 0
      }
    };
    
    // Trả về dữ liệu đã xử lý
    return NextResponse.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu stake từ contract:", error);
    
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