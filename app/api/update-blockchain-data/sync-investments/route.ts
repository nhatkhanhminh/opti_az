import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { Investment } from '@/lib/db/models/Investment';
import { formatTokenAmount } from "@/lib/convertNumber";
import { formatUsdtAmount, parseUsdtForDatabase } from "@/lib/formatUsdt";

// Hàm tính thủ công giá trị USDT cho các số lớn
function calculateUsdtValueManually(rawValue: string, decimals: number): number {
  try {
    // Loại bỏ các ký tự không phải số
    const cleanValue = rawValue.replace(/[^\d]/g, '');
    
    // Nếu chuỗi trống, trả về 0
    if (!cleanValue) return 0;
    
    console.log('Clean value for manual calculation:', cleanValue);
    
    // Nếu độ dài chuỗi nhỏ hơn hoặc bằng số decimals, đây là một số nhỏ
    if (cleanValue.length <= decimals) {
      return parseFloat(`0.${cleanValue.padStart(decimals, '0')}`);
    }
    
    // Xác định vị trí thập phân bằng cách trừ đi số decimals từ độ dài chuỗi
    const integerPartLength = cleanValue.length - decimals;
    const integerPart = cleanValue.substring(0, integerPartLength) || '0';
    const fractionalPart = cleanValue.substring(integerPartLength, integerPartLength + 8) || '0';
    
    // console.log('Manual calculation - Integer part:', integerPart);
    // console.log('Manual calculation - Fractional part:', fractionalPart);
    
    // Tạo số thực từ hai phần
    const numberValue = parseFloat(`${integerPart}.${fractionalPart}`);
    // console.log('Manual calculation - Final value:', numberValue);
    
    return numberValue;
  } catch (error) {
    console.error('Lỗi khi tính thủ công giá trị USDT:', error);
    return 0;
  }
}

// Hàm tính thủ công giá trị amount token 
function calculateAmountManually(rawValue: string | number | bigint, decimals: number): number {
  try {
    // Chuyển về chuỗi để xử lý
    const valueStr = rawValue.toString().replace(/[^\d.]/g, '');
    
    // Log để debug
    console.log('Amount raw value:', rawValue);
    console.log('Amount clean string:', valueStr);
    
    // Nếu chuỗi trống, trả về 0
    if (!valueStr) return 0;
    
    // Kiểm tra nếu đã có dấu chấm thập phân
    if (valueStr.includes('.')) {
      return parseFloat(valueStr);
    }
    
    // Xử lý chuỗi số nguyên lớn
    const valueLength = valueStr.length;
    
    // Nếu là số nhỏ hơn 10^decimals
    if (valueLength <= decimals) {
      const result = parseFloat(`0.${'0'.repeat(decimals - valueLength)}${valueStr}`);
      console.log('Small amount result:', result);
      return result;
    }
    
    // Xử lý số lớn
    const integerPartLength = valueLength - decimals;
    const integerPart = valueStr.substring(0, integerPartLength);
    const fractionalPart = valueStr.substring(integerPartLength, integerPartLength + Math.min(8, decimals));
    
    console.log('Amount integer part:', integerPart);
    console.log('Amount fractional part:', fractionalPart);
    
    // Tạo chuỗi số thập phân và chuyển đổi
    const floatStr = `${integerPart}.${fractionalPart}`;
    const result = parseFloat(floatStr);
    
    console.log('Final amount value:', result);
    return result;
  } catch (error) {
    console.error('Lỗi khi tính giá trị amount:', error);
    
    // Fallback: Thử chuyển đổi trực tiếp
    try {
      // Phương pháp tối giản: lấy phần nguyên từ chuỗi
      const cleanValue = rawValue.toString().replace(/[^\d]/g, '');
      if (cleanValue.length > decimals) {
        const integerPartLength = cleanValue.length - decimals;
        const integerPart = cleanValue.substring(0, integerPartLength);
        const fractionalPart = cleanValue.substring(integerPartLength, integerPartLength + 2);
        return parseFloat(`${integerPart}.${fractionalPart}`);
      }
      return 0;
    } catch (e) {
      console.error('Lỗi nghiêm trọng khi xử lý amount:', e);
      return 0;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Lấy dữ liệu từ request
    const body = await req.json();
    const { stakeData, onlyHighValue = false } = body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!stakeData) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu dữ liệu stake" 
      }, { status: 400 });
    }

    // Chuyển đổi dữ liệu timestamp sang Date
    const startTime = new Date(Number(stakeData.startTime) * 1000);
    const lastClaimTime = stakeData.lastClaimTime && stakeData.lastClaimTime !== "0" 
      ? new Date(Number(stakeData.lastClaimTime) * 1000) 
      : null;
    
    // Tính toán nextClaimDate (thời gian claim tiếp theo, ví dụ: 1 ngày sau lần claim cuối)
    const nextClaimDate = lastClaimTime 
      ? new Date(lastClaimTime.getTime() + 24 * 60 * 60 * 1000) // 1 ngày sau lần claim cuối
      : new Date(startTime.getTime() + 24 * 60 * 60 * 1000);    // hoặc 1 ngày sau khi bắt đầu stake
    
    // Xác định token từ địa chỉ token
    const tokenSymbol = getTokenSymbol(stakeData.token);
    
    // Chuyển đổi giá trị ROI

    
    // Xác định trạng thái stake
    const status = !stakeData.active ? 'completed' : 'active';
    
    // Đảm bảo giá trị USDT được chuyển đổi chính xác
    // Giá trị usdtAmount từ blockchain thường có 18 decimals
    // Kiểm tra và log giá trị để debug
    console.log('Raw usdtAmount from blockchain:', stakeData.usdtAmount);
    
    // Chuỗi usdtAmount từ blockchain cần được chuyển đổi đúng cách
    let usdtValueFormatted;
    try {
      // Sử dụng hàm mới formatUsdtAmount để định dạng giá trị USDT
      usdtValueFormatted = formatUsdtAmount(stakeData.usdtAmount, 18, 8);
      console.log('Formatted usdtValue (as string):', usdtValueFormatted);
      
      // Chuyển đổi từ chuỗi sang số để lưu vào database sử dụng hàm parseUsdtForDatabase
      const usdtValueNumber = parseUsdtForDatabase(usdtValueFormatted);
      console.log('Parsed usdtValue (as number):', usdtValueNumber);
      
      // Kiểm tra thêm nếu giá trị USDT quá nhỏ so với giá trị gốc
      // Điều này có thể xảy ra nếu có lỗi khi chuyển đổi số lớn
      const rawUsdtValue = stakeData.usdtAmount.toString();
      
      // Đối với các số rất lớn (>1000 USDT), kiểm tra thêm để đảm bảo định dạng đúng
      if (rawUsdtValue.length > 21 && usdtValueNumber < 100) {
        console.log('CẢNH BÁO: Phát hiện sự cố chuyển đổi giá trị lớn!');
        
        // Thử phương pháp chuyển đổi thay thế cho số lớn
        // Ước tính giá trị bằng cách đếm số chữ số và điều chỉnh vị trí thập phân
        const estimatedValue = calculateUsdtValueManually(rawUsdtValue, 18);
        console.log('Giá trị USDT được tính thủ công:', estimatedValue);
        
        // Sử dụng giá trị được tính thủ công nếu lớn hơn giá trị ban đầu
        if (estimatedValue > usdtValueNumber) {
          console.log('Sử dụng giá trị được tính thủ công thay thế:', estimatedValue);
          
          // Cập nhật giá trị USDT để sử dụng trong DB
          const correctedUsdtValue = estimatedValue;
          
          // Kiểm tra nếu chế độ chỉ lưu giá trị cao được bật
          if (onlyHighValue && correctedUsdtValue < 1000) {
            return NextResponse.json({
              success: false,
              message: "Stake bị bỏ qua do giá trị nhỏ hơn 1000 USDT (chế độ chỉ lưu giá trị cao đang bật)",
              actualValue: correctedUsdtValue
            });
          }
          
          // Tạo hoặc cập nhật Investment với giá trị đã sửa
          const investmentWithCorrectedValue = await Investment.findOneAndUpdate(
            { 
              userAddress: stakeData.user.toLowerCase(),
              stakeId: stakeData.stakeId
            },
            { 
              $set: { 
                planId: Number(stakeData.planId),
                token: tokenSymbol,
                amount: calculateAmountManually(stakeData.amount, 18),
                // Sử dụng giá trị USDT đã được sửa chữa
                usdtValue: correctedUsdtValue,
                status: status,
                totalClaimed: calculateAmountManually(stakeData.totalClaimed, 18),
                lastClaimDate: lastClaimTime,
                nextClaimDate: nextClaimDate,
                startDate: startTime,
                rawData: {
                  amount: stakeData.amount,
                  usdtAmount: stakeData.usdtAmount,
                  totalClaimed: stakeData.totalClaimed
                },
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            { upsert: true, new: true }
          );
          
          return NextResponse.json({ 
            success: true, 
            message: "Đồng bộ dữ liệu stake thành công (với giá trị đã sửa)",
            data: investmentWithCorrectedValue
          });
        }
      }
      
      // Đối với các giá trị thông thường (được xử lý đúng)
      // Kiểm tra nếu chế độ chỉ lưu giá trị cao được bật
      if (onlyHighValue && usdtValueNumber < 1000) {
        return NextResponse.json({
          success: false,
          message: "Stake bị bỏ qua do giá trị nhỏ hơn 1000 USDT (chế độ chỉ lưu giá trị cao đang bật)",
          actualValue: usdtValueNumber
        });
      }
      
      // Tạo hoặc cập nhật Investment
      const updatedInvestment = await Investment.findOneAndUpdate(
        { 
          userAddress: stakeData.user.toLowerCase(),
          stakeId: stakeData.stakeId
        },
        { 
          $set: { 
            planId: Number(stakeData.planId),
            token: tokenSymbol,
            amount: calculateAmountManually(stakeData.amount, 18),
            // Sử dụng giá trị USDT đã được sửa chữa
            usdtValue: usdtValueNumber,
            status: status,
            totalClaimed: calculateAmountManually(stakeData.totalClaimed, 18),
            lastClaimDate: lastClaimTime,
            nextClaimDate: nextClaimDate,
            startDate: startTime,
            rawData: {
              amount: stakeData.amount,
              usdtAmount: stakeData.usdtAmount,
              totalClaimed: stakeData.totalClaimed
            },
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: "Đồng bộ dữ liệu stake thành công",
        data: updatedInvestment
      });
    } catch (error) {
      console.error("Lỗi khi chuyển đổi giá trị USDT:", error);
      return NextResponse.json(
        { 
          success: false, 
          error: "Lỗi chuyển đổi giá trị USDT", 
          details: error instanceof Error ? error.message : "Lỗi không xác định"
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Lỗi khi đồng bộ dữ liệu stake:", error);
    
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

// Hàm trợ giúp để lấy symbol token từ địa chỉ
function getTokenSymbol(tokenAddress: string): string {
  // Địa chỉ token mẫu (cần cập nhật theo thực tế)
  const tokenAddresses: Record<string, string> = {
    "0x55d398326f99059fF775485246999027B3197955": "USDT",
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": "USDC",
    "0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153": "FIL",
    "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD": "LINK",
    "0x0000000000000000000000000000000000000000": "BNB",
    // Thêm các token khác ở đây
  };
  
  // Chuyển địa chỉ về lowercase để so sánh
  const normalizedAddress = tokenAddress.toLowerCase();
  
  // Tìm token symbol tương ứng
  for (const [address, symbol] of Object.entries(tokenAddresses)) {
    if (address.toLowerCase() === normalizedAddress) {
      return symbol;
    }
  }
  
  // Nếu không tìm thấy, trả về "UNKNOWN"
  return "UNKNOWN";
} 