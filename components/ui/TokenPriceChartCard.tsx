'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useTokenData } from '@/components/hooks/useTokenData'; // Giả sử hook này tồn tại và cung cấp giá, % thay đổi
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Interface cho dữ liệu lịch sử giá từ API
interface PriceDataPoint {
  timestamp: string; // ISO string
  USD: number;
}

// Interface cho props của component
interface TokenPriceChartCardProps {
  tokenAddress: string;
  tokenSymbol: string; // Ví dụ: "BNB", "FIL"
  // Danh sách token images để hiển thị icon, tương tự như trong Swap page
  tokenImages: Array<{ address: string; icon: string }>; 
}

// Hàm helper để định dạng ngày tháng cho XAxis của biểu đồ
const formatDateTick = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

// Hàm helper để định dạng giá cho Tooltip và YAxis
const formatPriceTick = (price: number) => {
  if (price < 0.01) return `$${price.toFixed(5)}`; // More precision for very small numbers
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

export const TokenPriceChartCard: React.FC<TokenPriceChartCardProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenImages,
}) => {
  const t = useTranslations("SwapPage"); // Hoặc một namespace phù hợp hơn
  const [historicalData, setHistoricalData] = useState<PriceDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [errorChart, setErrorChart] = useState<string | null>(null);

  const { prices: tokenPrices, loading: tokenPricesLoading } = useTokenData();

  const currentTokenData = tokenPrices && tokenPrices[tokenSymbol] 
    ? tokenPrices[tokenSymbol] 
    : null;

  const tokenIcon = tokenImages.find(img => img.address.toLowerCase() === tokenAddress.toLowerCase())?.icon;

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!tokenSymbol) return;
      setIsLoadingChart(true);
      setErrorChart(null);
      try {
        const response = await axios.get<{ data: PriceDataPoint[] }>(
          `/api/prices/${tokenSymbol}/history?days=2`
        );
        if (response.data && response.data.data) {
          setHistoricalData(response.data.data);
        } else {
          setHistoricalData([]);
        }
      } catch (err) {
        console.error(`Error fetching historical data for ${tokenSymbol}:`, err);
        setErrorChart(t('errorFetchingPriceHistory') || 'Failed to load chart data');
        setHistoricalData([]);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchHistoricalData();
  }, [tokenSymbol, t]);

  const priceChange24h = currentTokenData?.change24h;
  const currentPrice = currentTokenData?.USD;

  const priceChangeColor = priceChange24h && priceChange24h > 0 ? 'text-green-500' : 'text-red-500';
  const chartLineColor = priceChange24h && priceChange24h > 0 ? '#22c55e' : '#ef4444'; // green-500 or red-500

  return (
    <div className="rounded-lg bg-muted/30 p-3 w-full min-w-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center min-w-0 flex-1 mr-2">
            {tokenIcon && (
            <Image src={tokenIcon} alt={tokenSymbol} width={24} height={24} className="rounded-full mr-2 flex-shrink-0" />
            )}
            {!tokenIcon && <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 flex items-center justify-center text-xs font-bold flex-shrink-0">{tokenSymbol.charAt(0)}</div>}
            <h3 className="text-sm font-medium text-foreground truncate">{tokenSymbol}</h3>
        </div>
        <div className="text-right flex-shrink-0">
            {tokenPricesLoading ? (
                <Skeleton className="h-4 w-16 mb-1" />
            ) : currentPrice !== undefined ? (
                <p className="text-sm font-medium text-foreground">{formatPriceTick(currentPrice)}</p>
            ) : (
                <p className="text-sm text-muted-foreground">N/A</p>
            )}
            {tokenPricesLoading ? (
                <Skeleton className="h-3 w-12" />
            ) : priceChange24h !== undefined ? (
                <p className={`text-xs ${priceChangeColor}`}>
                {priceChange24h.toFixed(2)}%
                </p>
            ) : (
                <p className="text-xs text-muted-foreground">N/A</p>
            )}
        </div>
      </div>

      <div className="h-28 w-full">
        {isLoadingChart && (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        {!isLoadingChart && errorChart && (
          <div className="flex items-center justify-center h-full text-xs text-red-500 px-2 text-center">
            {errorChart}
          </div>
        )}
        {!isLoadingChart && !errorChart && historicalData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} horizontal={false}/>
              <XAxis hide={true} dataKey="timestamp" />
              <YAxis hide={true} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.375rem', // rounded-md
                  fontSize: '0.75rem', // text-xs
                  padding: '0.25rem 0.5rem', // py-1 px-2
                  boxShadow: 'var(--tw-shadow)'
                }}
                labelFormatter={(label: string) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}
                formatter={(value: number) => [formatPriceTick(value), null]} // Loại bỏ label "Price"
                cursor={{ stroke: 'hsl(var(--foreground))', strokeOpacity: 0.3, strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="USD"
                stroke={chartLineColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
         {!isLoadingChart && !errorChart && historicalData.length === 0 && (
           <div className="flex items-center justify-center h-full text-xs text-muted-foreground px-2 text-center">
            {t('noPriceDataForChart') || 'No price data for chart'}
          </div>
         )}
      </div>
    </div>
  );
}; 