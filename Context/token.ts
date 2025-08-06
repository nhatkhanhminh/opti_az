// Context/token.ts
import { USDC, FIL, LINK, BNB, USDT, AZC } from "./listaddress";

export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  icon: string;
  address: string;
  decimals: number;
  comingSoon?: boolean;
}

export interface TokenType {
  id: string;
  name: string;
  icon: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  comingSoon?: boolean;
}

// Danh sách token mẫu
export const tokenShow = [
  { 
    id: "bnb", 
    name: "Binance Coin", 
    icon: "/images/tokens/bnb.webp", 
    tokenAddress: BNB,
    symbol: "BNB",
  },
  { 
    id: "eth", 
    name: "Ethereum", 
    icon: "/images/tokens/eth.webp", 
    tokenAddress: USDT,
    symbol: "ETH",
  },
  { 
    id: "fil", 
    name: "Filecoin", 
    icon: "/images/tokens/fil.webp", 
    tokenAddress: FIL,
    symbol: "FIL",
  },
  { 
    id: "link", 
    name: "Chainlink",
    icon: "/images/tokens/link.webp", 
    tokenAddress: LINK,
    symbol: "LINK",
  },
  { 
    id: "btc", 
    name: "Bitcoin", 
    icon: "/images/tokens/btc.webp", 
    tokenAddress: USDC,
    symbol: "BTC",
  }
]

export const tokenTypes = [
  { 
    id: "usdt", 
    name: "Tether", 
    icon: "/images/tokens/usdt.webp", 
    tokenAddress: USDT,
    symbol: "USDT",
    decimals: 18,
  },
  { 
    id: "bnb", 
    name: "Binance Coin", 
    icon: "/images/tokens/bnb.webp", 
    tokenAddress: BNB,
    symbol: "BNB",
    decimals: 18,
  },
  { 
    id: "fil", 
    name: "Filecoin", 
    icon: "/images/tokens/fil.webp", 
    tokenAddress: FIL,
    symbol: "FIL",
    decimals: 18,
  },
  { 
    id: "link", 
    name: "Chainlink",
    icon: "/images/tokens/link.webp", 
    tokenAddress: LINK,
    symbol: "LINK",
    decimals: 18,
  },
]