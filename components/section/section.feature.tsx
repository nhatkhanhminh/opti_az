// components/section/section.feature.tsx
'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, LineChart, Users, Brain, Zap, Star, Globe, Lock } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
  const t = useTranslations('FeaturesSection');

  const features = [
    {
      key: "monthlyReturns",
      icon: LineChart,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      darkBgGradient: "from-blue-950/50 to-cyan-950/50"
    },
    {
      key: "aiPowered",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      darkBgGradient: "from-purple-950/50 to-pink-950/50"
    },
    {
      key: "secure",
      icon: Shield,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      darkBgGradient: "from-green-950/50 to-emerald-950/50"
    },
    {
      key: "referral",
      icon: Users,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      darkBgGradient: "from-orange-950/50 to-red-950/50"
    },
  ];
  
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700/50 mb-6">
            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Why Choose Us</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.key} 
              className="relative overflow-hidden h-full group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} dark:${feature.darkBgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/5 dark:to-white/10 rounded-full -translate-y-16 translate-x-16" />
              
              <CardContent className="p-8 relative z-10">
                {/* Icon with enhanced styling */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-300">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </div>

                {/* Hover effect indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-700/30">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              Trusted by thousands of users worldwide
            </span>
            <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
    </section>
  );
}