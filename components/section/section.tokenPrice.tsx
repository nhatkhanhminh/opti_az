// components/TokenPricesSection.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTokenData } from "@/components/hooks/useTokenData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

type Token = {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change: string;
  positive: boolean;
};

export default function TokenPricesSection({ initialTokens }: { initialTokens: Token[] }) {
  const [localTokens, setLocalTokens] = useState(initialTokens);
  const { prices, loading, error } = useTokenData(240000); // 5 seconds

  useEffect(() => {
    if (prices && !loading) {
      setLocalTokens((prevTokens) =>
        prevTokens.map((token) => {
          const priceData = prices[token.symbol];
          if (priceData) {
            return {
              ...token,
              price: priceData.USD,
              change: `${priceData.change24h >= 0 ? "+" : ""}${priceData.change24h.toFixed(2)}%`,
              positive: priceData.change24h >= 0,
            };
          }
          return token;
        })
      );
    }
  }, [prices, loading]);

  return (
    <section className="py-16 bg-gradient-to-r from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700/50 mb-4">
            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Live Market Data</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Real-time Token Prices
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Track the latest prices and market movements
          </p>
        </div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {initialTokens.map((token, index) => (
              <motion.div
                key={token.symbol}
                className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20 dark:border-slate-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center p-2">
                  <Image src={token.icon} alt={token.name} width={32} height={32} className="rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50">
              <span className="text-sm text-red-600 dark:text-red-400">Unable to load market data</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {localTokens.map((token, index) => (
              <motion.div
                key={token.symbol}
                className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl border border-white/20 dark:border-slate-700/50 transition-all duration-300 transform hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center p-2">
                  <Image src={token.icon} alt={token.name} width={32} height={32} className="rounded-lg" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-lg text-slate-900 dark:text-white">
                    ${token.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    {token.positive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${token.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {token.change}
                    </span>
                  </div>
                </div>
                
                {/* Animated indicator */}
                {token.positive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Market Status */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-700/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Market data updates every 4 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}