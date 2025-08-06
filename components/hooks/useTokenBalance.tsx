import { useEffect, useState } from 'react';
import { Token } from '@/components/TokenSelector';
import { useWalletBalance } from "thirdweb/react";

interface UseTokenBalanceProps {
  address: string | undefined;
  token: Token;
  client: any;
  chain: any;
}

export const useTokenBalance = ({ address, token, client, chain }: UseTokenBalanceProps) => {
  const [balance, setBalance] = useState("0");
  
  const { data: balanceData, isLoading, error } = useWalletBalance({
    chain: chain,
    address: address,
    client: client,
    tokenAddress: address,
  });

  useEffect(() => {
    if (balanceData) {
      // Convert balance to formatted string
      setBalance(balanceData.displayValue);
    }
  }, [balanceData]);

  return { 
    balance,
    isLoading,
    error 
  };
};