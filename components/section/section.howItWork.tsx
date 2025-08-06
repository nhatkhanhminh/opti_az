// components/section/section.howItWork.tsx
import { Card } from "@/components/ui/card";
import { Wallet, LineChart, ArrowUpRight, CheckCircle2, Play, Zap, Target, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HowItWorksSection() {
  const t = useTranslations("HowItWorksSection");

  const steps = [
    {
      step: 1,
      title: t("steps.connectWallet.title"),
      description: t("steps.connectWallet.description"),
      icon: Wallet,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      darkBgGradient: "from-blue-950/50 to-cyan-950/50"
    },
    {
      step: 2,
      title: t("steps.chooseStake.title"),
      description: t("steps.chooseStake.description"),
      icon: LineChart,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      darkBgGradient: "from-purple-950/50 to-pink-950/50"
    },
    {
      step: 3,
      title: t("steps.startEarning.title"),
      description: t("steps.startEarning.description"),
      icon: ArrowUpRight,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      darkBgGradient: "from-green-950/50 to-emerald-950/50"
    },
    {
      step: 4,
      title: t("steps.claimRewards.title"),
      description: t("steps.claimRewards.description"),
      icon: CheckCircle2,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      darkBgGradient: "from-orange-950/50 to-red-950/50"
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-700/50 mb-6">
            <Play className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Simple Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Enhanced connecting line */}
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 rounded-full hidden lg:block" />
            
            {steps.map((item, index) => (
              <div key={item.step} className="relative mb-16 last:mb-0 group">
                <div className="flex gap-8 items-start">
                  {/* Enhanced step indicator */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white font-bold text-xl relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  
                  {/* Enhanced card */}
                  <Card className={`flex-1 rounded-2xl p-8 shadow-lg border-0 bg-gradient-to-br ${item.bgGradient} dark:${item.darkBgGradient} backdrop-blur-sm group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1`}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                          {item.step}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Connecting arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-6">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-700/30">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              Ready to start earning? Connect your wallet now!
            </span>
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </section>
  );
}