// components/TokenBalance.tsx
import React from 'react';
import { useTokenBalance } from '@/components/hooks/useTokenBalance';
import { Token } from '@/components/TokenSelector';
import { Skeleton } from '@/components/ui/skeleton';
import {client} from '@/lib/client'
interface TokenBalanceProps {
  address: `0x${string}` | undefined;
  token: Token;
  className?: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  address, 
  token,
  className = "" 
}) => {
  const { balance } = useTokenBalance({ 
    chain: 56,
    address,
    client,
    token 
  });
  const isLoading = balance === undefined;

  if (!address) {
    return <span className={className}>0 {token.symbol}</span>;
  }

  if (isLoading) {
    return <Skeleton className="w-24 h-4" />;
  }

  return (
    <span className={className}>
      {parseFloat(balance).toLocaleString()} {token.symbol}
    </span>
  );
};

export default TokenBalance;