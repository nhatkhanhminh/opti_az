import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { client } from "@/lib/client";
import { MEMBER } from "@/Context/listaddress";
import { bsc } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { userAddress, investmentAmount } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu địa chỉ ví" 
      }, { status: 400 });
    }

    // Nếu không có giá trị đầu tư, không có gì để cập nhật
    if (!investmentAmount || investmentAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Giá trị đầu tư không hợp lệ" 
      }, { status: 400 });
    }
    
    // Kết quả theo dõi
    const results = {
      uplinePath: [] as string[],
      processed: 0,
      success: 0,
      failed: 0,
      details: [] as any[],
    };
    
    // Lấy tuyến trên của địa chỉ ví từ blockchain
    const uplinePath = await getUplinePath(userAddress);
    results.uplinePath = uplinePath;
    
    // Nếu không có tuyến trên, trả về kết quả trống
    if (!uplinePath.length) {
      return NextResponse.json({
        success: true,
        message: "Địa chỉ này không có tuyến trên",
        results
      });
    }
    
    // Cập nhật teamVolume cho từng địa chỉ trong tuyến trên
    for (const uplineAddress of uplinePath) {
      try {
        results.processed++;
        
        // Cập nhật teamVolume
        const teamVolumeResult = await updateTeamVolume(uplineAddress);
        
        // Cập nhật directVolume nếu là F1 trực tiếp
        if (uplinePath.indexOf(uplineAddress) === 0) {
          // Đây là upline trực tiếp (F1), cập nhật directVolume
          await updateF1Volume(uplineAddress);
        }
        
        if (teamVolumeResult.success) {
          results.success++;
        } else {
          results.failed++;
        }
        
        results.details.push({
          address: uplineAddress,
          success: teamVolumeResult.success,
          teamVolume: teamVolumeResult.teamVolume,
          message: teamVolumeResult.message,
          isDirectUpline: uplinePath.indexOf(uplineAddress) === 0
        });
        
        // Chờ một chút để tránh quá tải API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Lỗi khi cập nhật volume cho ${uplineAddress}:`, error);
        results.failed++;
        results.details.push({
          address: uplineAddress,
          success: false,
          message: error instanceof Error ? error.message : "Lỗi không xác định",
          isDirectUpline: uplinePath.indexOf(uplineAddress) === 0
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật doanh số cho ${results.success}/${uplinePath.length} tuyến trên`,
      results
    });
    
  } catch (error) {
    console.error("Lỗi khi cập nhật doanh số tuyến trên:", error);
    
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

// Hàm lấy tuyến trên của một địa chỉ ví từ blockchain
async function getUplinePath(address: string): Promise<string[]> {
  try {
    const memberContract = getContract({
      address: MEMBER,
      chain: bsc,
      client: client,
    });
    
    let currentAddress = address.toLowerCase();
    const uplinePath: string[] = [];
    let depth = 0;
    const maxDepth = 20; // Giới hạn độ sâu để tránh vòng lặp vô hạn
    
    while (currentAddress && depth < maxDepth) {
      // Gọi hàm getUpline từ contract với cơ chế thử lại
      const uplineAddress = await getUplineWithRetry(memberContract, currentAddress);
      
      // Kiểm tra nếu upline là địa chỉ zero (0x0) hoặc trùng với địa chỉ hiện tại thì dừng
      if (
        !uplineAddress || 
        uplineAddress === "0x0000000000000000000000000000000000000000" || 
        uplineAddress.toLowerCase() === currentAddress
      ) {
        break;
      }
      
      // Thêm địa chỉ vào đường dẫn tuyến trên
      uplinePath.push(uplineAddress);
      currentAddress = uplineAddress.toLowerCase();
      depth++;
    }
    
    return uplinePath;
  } catch (error) {
    console.error(`Lỗi khi lấy tuyến trên cho ${address}:`, error);
    return [];
  }
}

// Hàm gọi getUpline với cơ chế thử lại
async function getUplineWithRetry(contract: any, address: string, maxRetries = 3): Promise<string> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const upline = await readContract({
        contract,
        method: "function getUpline(address member) view returns (address)",
        params: [address],
      });
      
      return upline as string;
    } catch (error) {
      retries++;
      console.error(`Lỗi khi gọi getUpline (lần ${retries}/${maxRetries}):`, error);
      
      // Kiểm tra nếu là lỗi AbiDecodingZeroDataError thì chờ dài hơn
      if (error instanceof Error && error.toString().includes('AbiDecodingZeroDataError')) {
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
      
      // Nếu đã hết số lần thử, ném lỗi
      if (retries >= maxRetries) {
        throw error;
      }
    }
  }
  
  // Nếu không lấy được upline, trả về địa chỉ zero
  return "0x0000000000000000000000000000000000000000";
}

// Hàm cập nhật teamVolume từ blockchain và lưu vào DB
async function updateTeamVolume(userAddress: string) {
  try {
    // Kiểm tra địa chỉ ví có hợp lệ không
    if (!userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return {
        success: false,
        teamVolume: "0",
        message: "Địa chỉ không hợp lệ"
      };
    }
    
    // Lấy team volume từ blockchain
    const memberContract = getContract({
      address: MEMBER,
      chain: bsc,
      client: client,
    });
    
    // Lấy team volume từ blockchain với cơ chế thử lại
    let teamVolume = "0";
    try {
      const teamVolumeData = await readContract({
        contract: memberContract,
        method: "function getTeamVolume(address member) view returns (uint256)",
        params: [userAddress],
      });
      
      // Chuyển đổi về dạng chuỗi
      teamVolume = teamVolumeData.toString();
    } catch (error) {
      console.error(`Lỗi khi lấy team volume cho ${userAddress}:`, error);
      return {
        success: false,
        teamVolume: "0",
        message: "Không thể lấy team volume từ blockchain"
      };
    }
    
    // Kiểm tra nếu địa chỉ bắt đầu bằng 0x0000000 thì không lưu vào DB
    if (userAddress.match(/^0x0{5,}/)) {
      return {
        success: false,
        teamVolume: teamVolume,
        message: "Địa chỉ ví không hợp lệ (0x0000...)"
      };
    }
    
    // Chuyển đổi team volume từ chuỗi sang số
    const teamVolumeNumber = parseFloat(teamVolume) || 0;
    
    // Cập nhật team volume vào cơ sở dữ liệu
    const updatedUser = await User.findOneAndUpdate(
      { address: userAddress.toLowerCase() },
      { 
        $set: { 
          teamVolume: teamVolumeNumber,
          updatedAt: new Date()
        },
        $setOnInsert: {
          address: userAddress.toLowerCase(),
          createdAt: new Date(),
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    
    return {
      success: true,
      address: userAddress,
      teamVolume: teamVolumeNumber.toString(),
      message: "Cập nhật team volume thành công"
    };
    
  } catch (error) {
    console.error(`Lỗi khi cập nhật team volume cho ${userAddress}:`, error);
    return {
      success: false,
      teamVolume: "0",
      message: error instanceof Error ? error.message : "Lỗi không xác định"
    };
  }
}

// Hàm cập nhật directVolume (F1 volume) bằng cách tính tổng từ các địa chỉ F1
async function updateF1Volume(userAddress: string) {
  try {
    // Kiểm tra địa chỉ ví có hợp lệ không
    if (!userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return {
        success: false,
        directVolume: 0,
        f1Count: 0,
        message: "Địa chỉ không hợp lệ"
      };
    }
    
    // Kiểm tra nếu địa chỉ bắt đầu bằng 0x0000000 thì không lưu vào DB
    if (userAddress.match(/^0x0{5,}/)) {
      return {
        success: false,
        directVolume: 0,
        f1Count: 0,
        message: "Địa chỉ ví không hợp lệ (0x0000...)"
      };
    }
    
    // Tìm tất cả user F1 trực tiếp (user có referrer là địa chỉ được chỉ định)
    const f1Users = await User.find({ 
      referrer: userAddress.toLowerCase()
    });
    
    // Tính tổng totalInvestment của tất cả user F1
    let f1Volume = 0;
    for (const user of f1Users) {
      // Nếu user có totalInvestment, cộng vào tổng
      if (user.totalInvestment && typeof user.totalInvestment === 'number') {
        f1Volume += user.totalInvestment;
      }
    }
    
    // Cập nhật directVolume cho user
    const updatedUser = await User.findOneAndUpdate(
      { address: userAddress.toLowerCase() },
      { 
        $set: { 
          directVolume: f1Volume,
          directReferrals: f1Users.length, // Cập nhật số lượng F1
          updatedAt: new Date()
        },
        $setOnInsert: {
          address: userAddress.toLowerCase(),
          createdAt: new Date(),
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    
    return {
      success: true,
      directVolume: f1Volume,
      f1Count: f1Users.length,
      message: "Cập nhật F1 volume thành công"
    };
    
  } catch (error) {
    console.error(`Lỗi khi cập nhật F1 volume cho ${userAddress}:`, error);
    return {
      success: false,
      directVolume: 0,
      f1Count: 0,
      message: error instanceof Error ? error.message : "Lỗi không xác định"
    };
  }
} 