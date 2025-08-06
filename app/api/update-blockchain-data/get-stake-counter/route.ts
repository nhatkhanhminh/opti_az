import { NextRequest, NextResponse } from "next/server";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { bsc } from "thirdweb/chains";
import { DATASTAKING } from "@/Context/listaddress";

export async function GET(req: NextRequest) {
  try {
    // Khởi tạo contract
    const contract = getContract({
      client: client,
      chain: bsc,
      address: DATASTAKING,
    });
    
    // Gọi hàm stakeIdCounter từ contract
    const stakeIdCounter = await readContract({
      contract,
      method: "function stakeIdCounter() view returns (uint256)",
      params: []
    });
    
    return NextResponse.json({
      success: true,
      data: {
        stakeIdCounter: stakeIdCounter.toString(),
        count: Number(stakeIdCounter)
      }
    });
    
  } catch (error) {
    console.error("error get stake counter", error);
    
    let errorMessage = "error get stake counter";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "error get stake counter", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 