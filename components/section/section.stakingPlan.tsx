// components/section/section.stakingPlan.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, BadgeCheck, Award, Diamond, Crown, Zap, Target } from "lucide-react";
import { useTranslations } from "next-intl";

const tiers = [
  { 
    name: "starter", 
    min: 100, 
    max: 999, 
    apy: 9, 
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    darkBgGradient: "from-blue-950/50 to-cyan-950/50",
    border: "border-blue-200 dark:border-blue-700",
    icon: Sparkles,
    popular: false
  },
  { 
    name: "bronze", 
    min: 1000, 
    max: 4999, 
    apy: 11, 
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    darkBgGradient: "from-amber-950/50 to-orange-950/50",
    border: "border-amber-200 dark:border-amber-700",
    icon: Star,
    popular: false
  },
  { 
    name: "silver", 
    min: 5000, 
    max: 9999, 
    apy: 13, 
    gradient: "from-gray-500 to-slate-500",
    bgGradient: "from-gray-50 to-slate-50",
    darkBgGradient: "from-gray-950/50 to-slate-950/50",
    border: "border-gray-200 dark:border-gray-700",
    icon: BadgeCheck,
    popular: true
  },
  { 
    name: "gold", 
    min: 10000, 
    max: 19999, 
    apy: 15, 
    gradient: "from-yellow-500 to-amber-500",
    bgGradient: "from-yellow-50 to-amber-50",
    darkBgGradient: "from-yellow-950/50 to-amber-950/50",
    border: "border-yellow-200 dark:border-yellow-700",
    icon: Award,
    popular: false
  },
  { 
    name: "diamond", 
    min: 20000, 
    max: Infinity, 
    apy: 18, 
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    darkBgGradient: "from-purple-950/50 to-pink-950/50",
    border: "border-purple-200 dark:border-purple-700",
    icon: Diamond,
    popular: false
  },
];

export default function StakingTiersSection() {
  const t = useTranslations("StakingPlanSection");

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-950">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700/50 mb-6">
            <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Choose Your Tier</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Enhanced Tiers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`relative overflow-hidden bg-gradient-to-br ${tier.bgGradient} dark:${tier.darkBgGradient} ${tier.border} backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/10 dark:to-white/5 rounded-full -translate-y-16 translate-x-16" />

              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col items-center gap-6">
                  {/* Enhanced icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${tier.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {t(`plans.${tier.name}.name`)}
                    </h3>
                    
                    {/* Enhanced APY display */}
                    <div className="space-y-2">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {tier.apy}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Annual Percentage Yield
                      </div>
                    </div>

                    {/* Enhanced range display */}
                    <div className="space-y-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Min:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">${tier.min.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Max:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {tier.max === Infinity ? "Unlimited" : `$${tier.max.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced CTA button */}
                    <Button 
                      className={`w-full bg-gradient-to-r ${tier.gradient} hover:shadow-lg text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105`} 
                      asChild
                    >
                      <Link href="/staking">
                        <div className="flex items-center gap-2">
                          {t(`plans.${tier.name}.startStaking`)}
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-700/30">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              Higher tiers unlock additional benefits and rewards
            </span>
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </section>
  );
}