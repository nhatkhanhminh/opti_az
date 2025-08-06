import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { Investment } from '@/lib/db/models/Investment';

// Cơ chế retry
const MAX_RETRIES = 3;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy thông tin từ request
    const body = await req.json();
    const {  userAddress } = body;
    
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        message: "dont have user address" 
      }, { status: 400 });
    }

    // Bước 1: Lấy stakeIdCounter với retry
    let stakeCounter = null;
    let lastError = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const counterResponse = await fetch('/api/update-blockchain-data/get-stake-counter', {
          cache: 'no-store' // Đảm bảo không dùng cache
        });
        
        if (!counterResponse.ok) {
          throw new Error("error call API get-stake-counter");
        }
        
        const counterData = await counterResponse.json();
        
        if (counterData.success) {
          stakeCounter = counterData.data.count;
          break; // Thoát vòng lặp nếu thành công
        } else {
          throw new Error(counterData.error || "error get stake counter");
        }
      } catch (error) {
        lastError = error;
        console.error(`error get stake counter lần ${attempt}/${MAX_RETRIES}:`, error);
        
        // Exponential backoff
        if (attempt < MAX_RETRIES) {
          const waitTime = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s, ...
          await delay(waitTime);
        }
      }
    }
    
    if (stakeCounter === null) {
      return NextResponse.json({ 
        success: false, 
        error: "error get stake counter", 
        details: lastError instanceof Error ? lastError.message : String(lastError)
      }, { status: 500 });
    }
    
    // Bước 2: Tính ID của stake mới nhất
    const latestStakeId = stakeCounter - 1;
    
    if (latestStakeId < 0) {
      return NextResponse.json({ 
        success: false, 
        message: "no stake in system" 
      }, { status: 400 });
    }
    
    // Bước 3: Lấy thông tin chi tiết của stake mới nhất với retry
    let stakeData = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const stakeResponse = await fetch('/api/update-blockchain-data/get-stake-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stakeId: latestStakeId }),
        });
        
        if (!stakeResponse.ok) {
          throw new Error("error call API get-stake-data");
        }
        
        const stakeResult = await stakeResponse.json();
        
        if (stakeResult.success) {
          stakeData = stakeResult.data;
          break; // Thoát vòng lặp nếu thành công
        } else {
          throw new Error(stakeResult.error || "error get stake data");
        }
      } catch (error) {
        lastError = error;
        console.error(`error get stake data lần ${attempt}/${MAX_RETRIES}:`, error);
        
        // Exponential backoff
        if (attempt < MAX_RETRIES) {
          const waitTime = 1000 * Math.pow(2, attempt - 1);
          await delay(waitTime);
        }
      }
    }
    
    if (stakeData === null) {
      return NextResponse.json({ 
        success: false, 
        error: "error get stake data", 
        details: lastError instanceof Error ? lastError.message : String(lastError)
      }, { status: 500 });
    }
    
    // Kiểm tra xem stake có thuộc về người dùng hiện tại không
    if (stakeData.user.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json({ 
        success: false, 
        message: "newest stake not belong to user" 
      }, { status: 400 });
    }
    
    // Bước 4: Lưu dữ liệu stake vào database
    try {
      const syncResponse = await fetch('/api/update-blockchain-data/sync-investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stakeData }),
      });
      
      if (!syncResponse.ok) {
        throw new Error("error call API sync-investments");
      }
      
      const syncResult = await syncResponse.json();
      
      if (!syncResult.success) {
        throw new Error(syncResult.error || "error sync investments");
      }
      
      // Bước 5: Thêm thông tin giao dịch vào cơ sở dữ liệu (không đợi)
      try {
        // Cập nhật txHash cho investment
        await Investment.findOneAndUpdate(
          { 
            userAddress: userAddress.toLowerCase(),
            stakeId: latestStakeId
          },
        
        );
      } catch (updateError) {
        // console.error("error update txHash:", updateError);
        // Không ảnh hưởng đến kết quả
      }
      
      // Trả về kết quả thành công
      return NextResponse.json({
        success: true,
        message: "success sync stake",
        data: {
          stakeId: latestStakeId,
          user: stakeData.user,
          amount: stakeData.formatted.amount,
          usdtAmount: stakeData.formatted.usdtAmount,
          token: getTokenSymbol(stakeData.token)
        }
      });
      
    } catch (error) {
      console.error("error sync stake:", error);
      
      return NextResponse.json({ 
        success: false, 
        error: "error save stake data", 
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("system error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: "system error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Sử dụng lại function từ API sync-investments
function getTokenSymbol(tokenAddress: string): string {
  // Địa chỉ token mẫu (cần cập nhật theo thực tế)
  const tokenAddresses: Record<string, string> = {
    "0x55d398326f99059fF775485246999027B3197955": "USDT",
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": "USDC",
    "0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153": "FIL",
    "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD": "LINK",
    "0x0000000000000000000000000000000000000000": "BNB",
  };
  
  const normalizedAddress = tokenAddress.toLowerCase();
  
  for (const [address, symbol] of Object.entries(tokenAddresses)) {
    if (address.toLowerCase() === normalizedAddress) {
      return symbol;
    }
  }
  
  return "UNKNOWN";
}