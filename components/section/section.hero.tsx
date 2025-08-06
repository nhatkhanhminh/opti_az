// components/HeroSection.tsx
"use client";

import { ArrowRight, Circle, Sparkles, TrendingUp, Users, Shield } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEarningsCalculator } from "@/hooks/useEarningsCalculator";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Stats = { TotalStaked: string; exchanges: string; avgReturn: string; totalUsers: string };

export default function HeroSection({ initialStats }: { initialStats: Stats }) {
  const { demoAmount, setDemoAmount, currentApy, monthlyEarnings, dailyEarnings, maxEarnings } = useEarningsCalculator(5000);
  
  const t = useTranslations('HeroSection');
  const tStats = useTranslations('HeroSection.stats');
  const tCalc = useTranslations('HeroSection.calculator');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left side: Content */}
          <div className="space-y-8 animate-[fade-in-left_0.6s_ease-out]">
            <div className="space-y-6">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700/50 animate-[fade-in_0.6s_ease-out]">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('badge')}</span>
              </div>

              {/* Enhanced Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                {t('title')} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                  {t('titleHighlight')}
                </span>
              </h1>

              {/* Enhanced Description */}
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {t('description')}
              </p>
            </div>

            {/* Enhanced CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/staking">
                <RainbowButton className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-3">
                    {t('startStaking')}
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </RainbowButton>
              </Link>
              {/* <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
                <Link href="/about">Learn More</Link>
              </Button> */}
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 animate-[fade-up_0.6s_ease-out]">
              {Object.entries(initialStats).map(([key, value], index) => (
                <div
                  key={key}
                  className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {tStats(key as keyof typeof initialStats)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Calculator Card */}
          <div className="relative lg:h-[700px] animate-[fade-in-right_0.6s_ease-out]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
            <div className="relative h-full p-6 flex items-center justify-center">
              <Card className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tCalc('title')}</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {tCalc('description')}
                      </p>
                    </div>

                    {/* Calculator */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">{tCalc('stakeAmount')}</label>
                        <input
                          type="range"
                          min="100"
                          max="50000"
                          step="100"
                          value={demoAmount}
                          onChange={(e) => setDemoAmount(Number(e.target.value))}
                          className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                          aria-label="Stake amount slider"
                        />
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-slate-600 dark:text-slate-400">${demoAmount.toLocaleString()}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentApy}% {tCalc('monthlyAPY')}</span>
                        </div>
                      </div>

                      {/* Earnings Display */}
                      <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200/50 dark:border-blue-700/30">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-slate-700 dark:text-slate-300">{tCalc('monthly')}</span>
                          </div>
                          <span className="font-bold text-blue-600 dark:text-blue-400">${monthlyEarnings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-slate-700 dark:text-slate-300">{tCalc('daily')}</span>
                          </div>
                          <span className="font-bold text-green-600 dark:text-green-400">${dailyEarnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-slate-700 dark:text-slate-300">{tCalc('max')}</span>
                          </div>
                          <span className="font-bold text-purple-600 dark:text-purple-400">${maxEarnings}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                      size="lg" 
                      asChild
                    >
                      <Link href="/staking">{tCalc('startEarning')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}