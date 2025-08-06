"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-4 w-4" />}
        title="Multi-Exchange"
        description="Operating on 100+ crypto exchanges"
      />
     
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Settings className="h-4 w-4" />}
        title="Risk Management"
        description="Advanced algorithms for optimal returns"
      />
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-4 w-4" />}
        title="AI Trading Bot"
        description="24/7 automated trading across markets at 100+ exchanges"
        showTrades={true}
      />
      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Sparkles className="h-4 w-4" />}
        title="Enhanced Security"
        description="State-of-the-art encryption and multi-factor authentication to protect your assets"
      />
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Search className="h-4 w-4" />}
        title="Real-time Analysis"
        description="Instant market data processing"
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  showTrades?: boolean;
}

const GridItem = ({ area, icon, title, description, showTrades }: GridItemProps) => {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    if (showTrades) {
      const interval = setInterval(() => {
        const newTrade = generateTrade();
        setTrades((prev) => [newTrade, ...prev].slice(0, 4));
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [showTrades]);

  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </h2>
              {showTrades && (
                <div className="mt-4 h-36 overflow-hidden">
                  <AnimatePresence>
                    {trades.map((trade) => (
                      <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-2 last:mb-0"
                      >
                        <div className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                          <div className="font-medium">{trade.token}</div>
                          <div className={`text-right ${trade.isProfit ? "text-green-500" : "text-red-500"}`}>
                            {trade.profit}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const generateTrade = () => {
  const tokens = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "FIL/USDT", "WLD/USDT"];
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const profit = (Math.random() * 5 - 1).toFixed(2);

  return {
    id: Date.now(),
    token,
    profit: `${profit}%`,
    isProfit: Number(profit) > 0,
  };
};
