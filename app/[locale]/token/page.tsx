"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Coins,
  Zap,
  ShieldCheck,
  Rocket,
  ArrowRight,
  Globe,
  BarChart3,
  Users,
  Wallet,
  Lock,
  Gamepad2,
  Megaphone,
  Droplets,
  Gift,
  Landmark,
  Copy,
} from "lucide-react";
import Link from "next/link";
import  useWalletStore  from '@/store/userWalletStore';
import { toast } from 'sonner';
import { shortenWalletAddress } from "@/lib/shortAddress";
import { useTranslations } from 'next-intl';

// Token allocation data
const tokenAllocation = [
  { name: "Staking Rewards", value: 50, color: "#8b5cf6", icon: Lock },
  { name: "Liquidity Pool + CEX", value: 20, color: "#3b82f6", icon: Droplets },
  { name: "Gaming Ecosystem", value: 10, color: "#10b981", icon: Gamepad2 },
  { name: "Reserve fund", value: 10, color: "#f59e0b", icon: Megaphone },
  { name: "Growth Fund", value: 5, color: "#ec4899", icon: Gift },
  { name: "Marketing", value: 3, color: "#6366f1", icon: Users },
  { name: "Development", value: 2, color: "#ef4444", icon: Rocket },
];

// Token release schedule
const releaseSchedule = [
  { name: "Q1 2025", Tokens: 2100000 },
  { name: "Q2 2025", Tokens: 3150000 },
  { name: "Q3 2025", Tokens: 4200000 },
  { name: "Q4 2025", Tokens: 5250000 },
  { name: "Q1 2026", Tokens: 6300000 },
];

// Token utility data
const tokenUtility = [
  {
    title: "Staking Rewards",
    description:
      "Earn passive income by staking AZC tokens with competitive APY rates",
    icon: Lock,
  },
  {
    title: "Platform Governance",
    description:
      "Vote on key platform decisions and shape the future of the ecosystem",
    icon: ShieldCheck,
  },
  {
    title: "Transaction Fee Discounts",
    description: "Enjoy reduced fees when using AZC for platform transactions",
    icon: Wallet,
  },
  {
    title: "Gaming Rewards",
    description: "Earn and spend AZC tokens in our integrated gaming ecosystem",
    icon: Gamepad2,
  },
  {
    title: "Exclusive Access",
    description:
      "Unlock premium features and early access to new platform capabilities",
    icon: Zap,
  },
  {
    title: "Global Payments",
    description:
      "Use AZC for fast, secure transactions across our partner network",
    icon: Globe,
  },
];



export default function TokenPage() {
  const t = useTranslations('TokenPage');
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");

  const { account } = useWalletStore();

  const handleJoinPartnerProgram = () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }
    window.location.href = '/partner';
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("0x88F7246f4Df4dd4E9D1d5bd1fC7A13E89a43a7F9");
    toast.success(t('details.copySuccess'));
  };

  return (
    <div className="min-h-screen  flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  Tokenomics
                </Badge>
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">{t('title')}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  {t('description')}
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    {t('metrics.totalSupply.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{t('metrics.totalSupply.value')}</p>
                  <p className="text-muted-foreground">{t('metrics.totalSupply.unit')}</p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('metrics.targetPrice.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{t('metrics.targetPrice.value')}</p>
                  <p className="text-muted-foreground">{t('metrics.targetPrice.unit')}</p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    {t('metrics.tokenType.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{t('metrics.tokenType.value')}</p>
                  <p className="text-muted-foreground">{t('metrics.tokenType.unit')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
     {/* Token Details */}
     <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('details.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('details.description')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium">{t('details.name')}</span>
                      <span className="font-mono">AZ Coin</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium">{t('details.symbol')}</span>
                      <span className="font-mono">AZC</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium">{t('details.totalSupply')}</span>
                      <span className="font-mono">21,000,000</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium">{t('details.targetPrice')}</span>
                      <span className="font-mono">$10 - $15</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium">{t('details.blockchain')}</span>
                      <span className="font-mono">Binance Smart Chain (BSC)</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium">{t('details.tokenType')}</span>
                      <span className="font-mono">BEP-20</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b last:border-0">
                      <span className="font-medium">{t('details.contractAddress')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono hidden lg:flex">0x88F7246f4Df4dd4E9D1d5bd1fC7A13E89a43a7F9</span>
                        <span className="font-mono lg:hidden">{shortenWalletAddress("0x88F7246f4Df4dd4E9D1d5bd1fC7A13E89a43a7F9")}</span>
                        <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Token Allocation Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('allocation.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('allocation.description')}
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="w-full lg:w-1/2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{t('allocation.distribution')}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={chartView === "pie" ? "default" : "outline"}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setChartView("pie")}
                        >
                          {t('allocation.chart.pie')}
                        </Button>
                        <Button
                          variant={chartView === "bar" ? "default" : "outline"}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setChartView("bar")}
                        >
                          {t('allocation.chart.bar')}
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {t('allocation.totalSupply')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartView === "pie" ? (
                          <PieChart>
                            <Pie
                              data={tokenAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                              labelLine={false}
                            >
                              {tokenAllocation.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${value}% (${(
                                  value * 210000
                                ).toLocaleString()} AZC)`,
                                "Allocation",
                              ]}
                            />
                          </PieChart>
                        ) : (
                          <BarChart
                            data={tokenAllocation}
                            layout="vertical"
                            margin={{
                              top: 20,
                              right: 30,
                              left: 100,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={100}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              formatter={(value: number) => [
                                `${value}% (${(
                                  value * 210000
                                ).toLocaleString()} AZC)`,
                                "Allocation",
                              ]}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {tokenAllocation.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full lg:w-1/2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('allocation.breakdown')}</CardTitle>
                    <CardDescription>
                      {t('allocation.breakdownDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {tokenAllocation.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: `${item.color}20` }}
                                >
                                  <Icon
                                    className="h-4 w-4"
                                    style={{ color: item.color }}
                                  />
                                </div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{item.value}%</span>
                                <div className="text-xs text-muted-foreground">
                                  {(item.value * 210000).toLocaleString()} AZC
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={item.value}
                              className="h-2"
                              style={{ backgroundColor: `${item.color}20` }}
                            >
                              <div
                                className="h-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </Progress>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Token Release Schedule */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('releaseSchedule.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('releaseSchedule.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('releaseSchedule.timeline')}</CardTitle>
                    <CardDescription>{t('releaseSchedule.timelineDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={releaseSchedule} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`${value.toLocaleString()} AZC`, "Tokens Released"]}
                            contentStyle={{ borderRadius: "8px" }}
                          />
                          <Bar
                            dataKey="Tokens"
                            fill="var(--chart-2)"
                            radius={[4, 4, 0, 0]}
                            name="Tokens Released"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('releaseSchedule.breakdown')}</CardTitle>
                    <CardDescription>{t('releaseSchedule.breakdownDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {releaseSchedule.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm font-mono">{((item.Tokens / 21000000) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Released</span>
                            <span>{item.Tokens.toLocaleString()} AZC</span>
                          </div>
                          <Progress
                            value={(item.Tokens / 21000000) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Token Burn Schedule */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{t('burn.title')}</h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
              {t('burn.desc', { date: 'July 20, 2025', amount: '100,000' })}
              </p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-xl">
                <Card className="bg-primary/5 border shadow-md rounded-xl">
                  <CardContent className="pt-8 pb-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
                          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2v2m0 16v2m8-10h2M2 12H4m15.07-7.07l1.42 1.42M4.93 19.07l1.42-1.42m12.72 0l1.42 1.42M4.93 4.93L6.35 6.35" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4l3 3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        <span className="text-lg font-semibold text-primary">AZC Burn</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-center">
                        <div className="bg-white/70 dark:bg-zinc-800/70 rounded-lg p-3 shadow-sm border border-border">
                          <div className="text-xs text-muted-foreground font-medium">{t('burn.card.totalWeeks')}</div>
                          <div className="text-base font-semibold">104</div>
                        </div>
                        <div className="bg-white/70 dark:bg-zinc-800/70 rounded-lg p-3 shadow-sm border border-border">
                          <div className="text-xs text-muted-foreground font-medium">{t('burn.card.totalToBurn')}</div>
                          <div className="text-base font-semibold">10,400,000 AZC</div>
                        </div>
                        <div className="bg-white/70 dark:bg-zinc-800/70 rounded-lg p-3 shadow-sm border border-border">
                          <div className="text-xs text-muted-foreground font-medium">{t('burn.card.startDate')}</div>
                          <div className="text-base font-semibold">July 20, 2025</div>
                        </div>
                        <div className="bg-white/70 dark:bg-zinc-800/70 rounded-lg p-3 shadow-sm border border-border">
                          <div className="text-xs text-muted-foreground font-medium">{t('burn.card.weeklyAmount')}</div>
                          <div className="text-base font-semibold">100,000 AZC</div>
                        </div>
                        <div className="bg-white/70 dark:bg-zinc-800/70 rounded-lg p-3 shadow-sm border border-border col-span-1 sm:col-span-2">
                          <div className="text-xs text-muted-foreground font-medium">{t('burn.card.alreadyBurned')}</div>
                          <div className="text-base font-semibold">300,000 AZC</div>
                        </div>
                      </div>
                      <Progress value={3} className="h-2 mt-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-xl">
                <Card className="bg-primary/5 border shadow-md rounded-xl">
                  <CardContent className="py-6">
                    <p className="text-base md:text-lg text-center text-muted-foreground font-normal">
                    {t('burn.purpose')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Token Utility */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('utility.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('utility.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokenUtility.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">
                          {t(`utility.features.${item.title.toLowerCase().replace(/\s+/g, '')}.title`)}
                        </h3>
                        <p className="text-muted-foreground">
                          {t(`utility.features.${item.title.toLowerCase().replace(/\s+/g, '')}.description`)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

       
        {/* How to Get AZC */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('getToken.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('getToken.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 dark:bg-gradient-to-br from-primary/10 to-transparent" />
                <CardContent className="pt-6 relative">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      {t('getToken.exchanges.title')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('getToken.exchanges.description')}
                    </p>
                    <Button variant="outline" className="mt-2 cursor-pointer">
                      {t('getToken.exchanges.button')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 dark:bg-gradient-to-br from-primary/10 to-transparent" />
                <CardContent className="pt-6 relative">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      {t('getToken.staking.title')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('getToken.staking.description')}
                    </p>
                    <Link href="/staking">
                      <Button variant="outline" className="mt-2 cursor-pointer">
                        {t('getToken.staking.button')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 dark:bg-gradient-to-br from-primary/10 to-transparent" />
                <CardContent className="pt-6 relative">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      {t('getToken.referral.title')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('getToken.referral.description')}
                    </p>
                    <Button variant="outline" className="mt-2 cursor-pointer" onClick={handleJoinPartnerProgram}>
                      {t('getToken.referral.button')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/staking">
                    {t('cta.staking')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/roadmap">
                    {t('cta.roadmap')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
