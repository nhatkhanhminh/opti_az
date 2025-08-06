/**
 * Xử lý số USDT từ blockchain với độ chính xác cao
 * Khắc phục vấn đề số lớn (>1000) bị cắt sai
 * 
 * @param value - Giá trị từ blockchain (có thể là chuỗi, số, hoặc BigInt)
 * @param decimals - Số chữ số thập phân trong token (mặc định: 18)
 * @param displayDecimals - Số chữ số thập phân hiển thị trong kết quả (mặc định: 2)
 * @returns Chuỗi biểu diễn giá trị đã được định dạng
 */
export function formatUsdtAmount(
  value: string | number | bigint,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  if (!value) return '0';

  let bigValue: string;
  
  // Chuyển đổi giá trị đầu vào thành chuỗi để xử lý
  if (typeof value === 'string') {
    bigValue = value;
  } else if (typeof value === 'number') {
    bigValue = value.toString();
  } else {
    bigValue = value.toString();
  }
  
  // Loại bỏ ký tự không phải số (giữ lại dấu chấm nếu có)
  bigValue = bigValue.replace(/[^\d.]/g, '');
  
  // Nếu chuỗi trống sau khi loại bỏ, trả về 0
  if (!bigValue) return '0';
  
  // Xử lý giá trị với độ chính xác cao
  try {
    // Độ dài chuỗi
    const valueLength = bigValue.length;
    
    // Debug log
    // console.log('Original value:', value);
    // console.log('Converted bigValue:', bigValue);
    // console.log('Value length:', valueLength);
    // console.log('Decimals:', decimals);
    
    // Nếu giá trị có ít ký tự hơn số decimals, thêm số 0 vào đầu
    if (valueLength <= decimals) {
      const paddedValue = bigValue.padStart(decimals + 1, '0');
      const result = `0.${paddedValue.substring(0, displayDecimals).padEnd(displayDecimals, '0')}`;
      console.log('Small value result:', result);
      return result;
    }
    
    // Xác định vị trí dấu thập phân
    const integerPartLength = valueLength - decimals;
    const integerPart = bigValue.substring(0, integerPartLength) || '0';
    const fractionalPart = bigValue.substring(integerPartLength, integerPartLength + displayDecimals).padEnd(displayDecimals, '0');
    
    // console.log('Integer part:', integerPart);
    // console.log('Fractional part:', fractionalPart);
    
    // Định dạng phần nguyên với dấu phân cách hàng nghìn
    const formattedIntegerPart = Number(integerPart).toLocaleString();
    
    // Chỉ hiển thị phần thập phân nếu nó không phải tất cả là số 0
    const result = Number(fractionalPart) === 0 
      ? formattedIntegerPart 
      : `${formattedIntegerPart}.${fractionalPart}`;
      
    // console.log('Final formatted result:', result);
    return result;
  } catch (error) {
    console.error("Lỗi khi định dạng số USDT:", error, "giá trị:", bigValue);
    return '0';
  }
}

/**
 * Chuyển đổi chuỗi USDT thành số để lưu vào database
 * 
 * @param formattedValue - Chuỗi USDT đã được định dạng (ví dụ: "1,234.56")
 * @returns Số thực để lưu vào database
 */
export function parseUsdtForDatabase(formattedValue: string): number {
  try {
    // Loại bỏ dấu phân cách hàng nghìn
    const cleanValue = formattedValue.replace(/,/g, '');
    // Chuyển đổi sang số
    const result = parseFloat(cleanValue);
    
    // Debug log
    // console.log('parseUsdtForDatabase input:', formattedValue);
    // console.log('Cleaned value:', cleanValue);
    // console.log('parseUsdtForDatabase result:', result);
    
    return result;
  } catch (error) {
    console.error("Lỗi khi chuyển đổi USDT sang số:", error);
    return 0;
  }
} 