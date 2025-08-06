/**
 * Shortens a cryptocurrency wallet address by showing only the beginning and end
 * with an ellipsis in the middle.
 * 
 * @param address - The full wallet address to shorten
 * @param startChars - Number of characters to keep at the beginning (default: 6)
 * @param endChars - Number of characters to keep at the end (default: 4)
 * @returns The shortened address string
 */
export function shortenWalletAddress(
    address: string,
    startChars: number = 6,
    endChars: number = 4
  ): string {
    if (!address) return '';
    
    // Handle case where address is too short to shorten
    if (address.length <= startChars + endChars) {
      return address;
    }
    
    // Extract the start and end portions and combine them with ellipsis
    const start = address.slice(0, startChars);
    const end = address.slice(-endChars);
    
    return `${start}...${end}`;
  }
  
  // Example usage:
  // const fullAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  // const shortened = shortenWalletAddress(fullAddress); // "0x742d...f44e"
  // const customShortened = shortenWalletAddress(fullAddress, 8, 6); // "0x742d35Cc...454e4438f44e"