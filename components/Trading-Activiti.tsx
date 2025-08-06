"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp, ChevronUp } from "lucide-react"
import { useTranslations } from "next-intl"

// Sample trading data
const tokens = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "FIL/USDT","WLD/USDT","LINK/USDT"]
const exchanges = ["Binance", "OKX", "Bybit", "KuCoin", "Gate.io","Hyperliquid","Huobi","Bitget","MEXC","Bitfinex","Kraken","Coinbase","Kraken","Poloniex","Bittrex","HitBTC","Bitstamp","Coinbase",]

const generateTrade = () => {
  const token = tokens[Math.floor(Math.random() * tokens.length)]
  const exchange = exchanges[Math.floor(Math.random() * exchanges.length)]
  const amount = (Math.random() * 990 + 100).toFixed(2)
  const profit = (Math.random() * 5 - 1).toFixed(2)
  const profitUsd = ((Number(amount) * Number(profit)) / 100).toFixed(2)

  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    token,
    exchange,
    amount: `$${amount}`,
    profit: `${profit}%`,
    profitUsd: `$${profitUsd}`,
    isProfit: Number(profit) > 0,
  }
}

// Generate chart data
const generateChartData = () => {
  const data = []
  const now = Date.now()
  for (let i = 0; i < 24; i++) {
    data.push({
      time: new Date(now - (23 - i) * 3600000).toISOString(),
      profit: Number((Math.random() * 15 + 5).toFixed(2)),
    })
  }
  return data
}

export default function TradingActivity() {
  const t = useTranslations('TradingActivitySection')
  const [trades, setTrades] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalTrades: 0,
    successRate: 0,
    avgProfit: 0,
    dailyProfit: 0,
  })
  const [chartData, setChartData] = useState(generateChartData())

  // Add new trades periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade = generateTrade()
      setTrades((prev) => [newTrade, ...prev].slice(0, 10))

      // Update stats
      setStats((prev) => ({
        totalTrades: prev.totalTrades + 1,
        successRate: Math.round(
          (prev.successRate * prev.totalTrades + (newTrade.isProfit ? 100 : 0)) / (prev.totalTrades + 1),
        ),
        avgProfit: Number(
          ((prev.avgProfit * prev.totalTrades + Number(newTrade.profit)) / (prev.totalTrades + 1)).toFixed(2),
        ),
        dailyProfit: Number((prev.dailyProfit + Number(newTrade.profitUsd.slice(1))).toFixed(2)),
      }))

      // Update chart data
      setChartData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: new Date().toISOString(),
            profit: Number((Math.random() * 15 + 5).toFixed(2)),
          },
        ]
        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {t('badge')}
          </Badge>
          <h2 className="text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('stats.totalTrades.title')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs text-muted-foreground">{t('stats.totalTrades.description', { count: exchanges.length })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('stats.successRate.title')}</CardTitle>
              <ChevronUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">{t('stats.successRate.description')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('stats.avgProfit.title')}</CardTitle>
              <ChevronUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,3%</div>
              <p className="text-xs text-muted-foreground">{t('stats.avgProfit.description')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('stats.realtimeProfit.title')}</CardTitle>
              <ChevronUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.dailyProfit}</div>
              <p className="text-xs text-muted-foreground">{t('stats.realtimeProfit.description')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('performance.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="var(--chart-2)"
                      fill="url(#profitGradient)"
                      strokeWidth={2}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">{t('performance.tooltip.profit')}:</div>
                                <div className="font-medium">{payload[0].value}%</div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('recentTrades.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[300px] overflow-hidden">
                <AnimatePresence>
                  {trades.map((trade) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4 last:mb-0"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                        <div>
                          <div className="font-medium">{trade.token}</div>
                          <div className="text-sm text-muted-foreground">{trade.exchange}</div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center ${trade.isProfit ? "text-green-500" : "text-red-500"}`}>
                            {trade.isProfit ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            <span>{trade.profit}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{trade.amount}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

