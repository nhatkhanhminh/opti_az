// components/hooks/useTokenData.tsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface TokenPrices {
  [tokenSymbol: string]: {
    USD: number;
    change24h: number; // Thay EUR bằng change24h
    lastUpdated: string;
  };
}

interface TokenData {
  prices: TokenPrices | null;
  loading: boolean;
  error: string | null;
}

const API_URL = "/api/prices";
const DEFAULT_INTERVAL = 120000; // 2 minutes

export const useTokenData = (refreshInterval = DEFAULT_INTERVAL): TokenData => {
  const [tokenData, setTokenData] = useState<TokenData>({
    prices: null,
    loading: true,
    error: null,
  });

  const fetchTokenPrices = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      setTokenData({
        prices: response.data.prices,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching token prices:", error);
      setTokenData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch token prices",
      }));
    }
  }, []);

  useEffect(() => {
    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTokenPrices, refreshInterval]);

  return tokenData;
};