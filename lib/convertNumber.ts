/**
 * Converts a big number with 18 decimals (standard for most ERC20 tokens)
 * to a human-readable number format.
 * 
 * @param value - The value from blockchain (can be string, number, or BigInt)
 * @param decimals - Number of decimal places in the token (default: 18)
 * @param displayDecimals - Number of decimal places to show in result (default: 4)
 * @returns Formatted string representation of the value
 */
export function formatTokenAmount(
    value: string | number | bigint,
    decimals: number = 18,
    displayDecimals: number = 2
  ): string {
    if (!value) return '0';
  
    // Debug logs
    // console.log('formatTokenAmount input:', value, 'type:', typeof value);
    
    // Xử lý trực tiếp dưới dạng chuỗi để tránh vấn đề với số lớn
    let strValue: string;
    
    if (typeof value === 'string') {
      strValue = value.replace(/[^\d.]/g, '');
    } else if (typeof value === 'number') {
      strValue = value.toString();
    } else {
      strValue = value.toString();
    }
    
    // console.log('Cleaned string value:', strValue);
    
    // Xử lý các số lớn bằng phương pháp chuỗi để tránh giới hạn của BigInt
    try {
      // Phân tích số từ dạng chuỗi
      const valueLength = strValue.length;
      
      // Nếu chuỗi ngắn hơn số decimals, là số thập phân nhỏ
      if (valueLength <= decimals) {
        const paddedValue = strValue.padStart(decimals, '0');
        const result = `0.${paddedValue.substring(0, displayDecimals).padEnd(displayDecimals, '0')}`;
        // console.log('Small number result:', result);
        return result;
      }
      
      // Xác định phần nguyên và phần thập phân
      const integerPartLength = valueLength - decimals;
      const integerPart = strValue.substring(0, integerPartLength) || '0';
      const fractionalPart = strValue.substring(integerPartLength, integerPartLength + displayDecimals).padEnd(displayDecimals, '0');
      
      // console.log('Integer part:', integerPart, 'Fractional part:', fractionalPart);
      
      // Định dạng phần nguyên với dấu phân cách hàng nghìn
      let formattedInteger: string;
      try {
        formattedInteger = Number(integerPart).toLocaleString();
      } catch (e) {
        // Nếu số quá lớn cho Number, xử lý thủ công
        formattedInteger = integerPart;
        console.log('Number too large, using string directly:', integerPart);
      }
      
      // Chỉ hiển thị phần thập phân nếu khác 0
      const result = parseInt(fractionalPart) === 0
        ? formattedInteger
        : `${formattedInteger}.${fractionalPart}`;
      
      // console.log('Final formatted result:', result);
      return result;
      
    } catch (error) {
      // Fallback: sử dụng BigInt (hạn chế với số rất lớn)
      try {
        // console.log('Falling back to BigInt method');
        
        let bigIntValue: bigint;
        
        try {
          bigIntValue = BigInt(strValue);
        } catch {
          console.log('BigInt conversion failed, returning 0');
          return '0';
        }
        
        // Convert from wei to ether (or equivalent)
        const divisor = BigInt(10) ** BigInt(decimals);
        
        // Handle the integer part
        const integerPart = bigIntValue / divisor;
        
        // Handle the fractional part
        const remainder = bigIntValue % divisor;
        const fractionalPart = remainder.toString().padStart(decimals, '0');
        
        // Combine and format to requested decimal places
        const formattedFractional = fractionalPart.substring(0, displayDecimals);
        
        // Format with commas for thousands
        const formattedInteger = integerPart.toLocaleString();
        
        // Only show decimal part if it's not all zeros
        if (parseInt(formattedFractional) === 0) {
          return formattedInteger;
        }
        
        return `${formattedInteger}.${formattedFractional}`;
      } catch (fallbackError) {
        console.error('Fatal error in formatTokenAmount:', fallbackError);
        return '0';
      }
    }
  }
  
  /**
   * Converts a human-readable number to a big number with 18 decimals 
   * (for sending to blockchain)
   * 
   * @param value - The human-readable value (e.g. "1.5")
   * @param decimals - Number of decimal places in the token (default: 18)
   * @returns BigInt representation with proper decimals
   */
  export function parseTokenAmount(
    value: string | number,
    decimals: number = 18
  ): bigint {
    if (!value) return BigInt(0);
    
    const valueString = value.toString();
    
    // Split into integer and fractional parts
    const parts = valueString.split('.');
    const integerPart = parts[0] || '0';
    let fractionalPart = parts[1] || '';
    
    // Pad or truncate fractional part to match token decimals
    if (fractionalPart.length > decimals) {
      fractionalPart = fractionalPart.substring(0, decimals);
    } else {
      fractionalPart = fractionalPart.padEnd(decimals, '0');
    }
    
    // Remove leading zeros from integer part
    const cleanIntegerPart = integerPart.replace(/^0+/, '') || '0';
    
    // Combine parts and convert to BigInt
    const combinedValue = cleanIntegerPart + fractionalPart;
    
    return BigInt(combinedValue);
  }