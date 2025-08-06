"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {

  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  Brain,
  Rocket,
  Target,
  Layers,
  Zap,
  ArrowRight,
  BarChart3,
  LineChart,
  Network,
  Lock,
  Gamepad2,
  Bot,
  Wallet,
  Lightbulb,
  Shield,
  Sparkles,
} from "lucide-react"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { AnimatedTestimonialsDemo } from "@/components/ui/team-animated"
import PartnerLogos from "@/components/Partners"
import Link from "next/link"
import { useTranslations } from "next-intl"


const ecosystemDistribution = [
  { name: "Staking", value: 35, color: "#8b5cf6" },
  { name: "Gaming", value: 25, color: "#10b981" },
  { name: "Trading", value: 30, color: "#3b82f6" },
  { name: "Other", value: 10, color: "#f59e0b" },
]

const userGrowth = [
  { quarter: "Q1 2025", users: 5000 },
  { quarter: "Q2 2025", users: 12000 },
  { quarter: "Q3 2025", users: 25000 },
  { quarter: "Q4 2025", users: 42000 },
  { quarter: "Q1 2026", users: 68000 },
  { quarter: "Q2 2026", users: 95000 },
]



// Ecosystem components
const ecosystemComponents = [
  {
    title: "multichainStaking",
    description: "multichainStaking",
    icon: Lock,
    color: "from-violet-500/20 to-violet-500/5",
  },
  {
    title: "aiTrading",
    description: "aiTrading",
    icon: Brain,
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "telegramGaming",
    description: "telegramGaming",
    icon: Gamepad2,
    color: "from-green-500/20 to-green-500/5",
  },
  {
    title: "crossExchange",
    description: "crossExchange",
    icon: BarChart3,
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    title: "aiBots",
    description: "aiBots",
    icon: Bot,
    color: "from-pink-500/20 to-pink-500/5",
  },
  {
    title: "wallet",
    description: "wallet",
    icon: Wallet,
    color: "from-cyan-500/20 to-cyan-500/5",
  },
]

// AI Technology features
const aiFeatures = [
  {
    title: "multiModel",
    description: "multiModel",
    icon: Layers,
  },
  {
    title: "patternRecognition",
    description: "patternRecognition",
    icon: LineChart,
  },
  {
    title: "sentimentAnalysis",
    description: "sentimentAnalysis",
    icon: Lightbulb,
  },
  {
    title: "riskManagement",
    description: "riskManagement",
    icon: Shield,
  },
  {
    title: "crossExchange",
    description: "crossExchange",
    icon: Network,
  },
  {
    title: "continuousLearning",
    description: "continuousLearning",
    icon: Sparkles,
  },
]

export default function AboutPage() {
  const t = useTranslations("AboutPage")

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {t("hero.badge")}
                </Badge>
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">
                  {t("hero.title")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  {t("hero.description")}
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 items-center mt-12">
              <div className="space-y-6">
                <p className="text-lg">
                  {t("hero.content.paragraph1")}
                </p>
                <p className="text-lg">
                  {t("hero.content.paragraph2")}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <RainbowButton>
                    <Link href="/token">
                      {t("hero.content.buttons.explore")}
                    </Link>
                  </RainbowButton>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/roadmap">
                      {t("hero.content.buttons.roadmap")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
                <div className="relative h-full p-6">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/eL1SXUbfjC8?si=OymbVAIgHQKMZdjM" 
                    title="AZ Coin Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("mission.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t("mission.description")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t("mission.mission.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p>{t("mission.mission.content")}</p>
                  <ul className="space-y-2">
                    {[1, 2, 3].map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                          <Zap className="h-3 w-3 text-primary" />
                        </div>
                        <span>{t(`mission.mission.points.${point}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    {t("mission.vision.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p>{t("mission.vision.content")}</p>
                  <ul className="space-y-2">
                    {[1, 2, 3].map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                          <Zap className="h-3 w-3 text-primary" />
                        </div>
                        <span>{t(`mission.vision.points.${point}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AZC Ecosystem */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {t("ecosystem.badge")}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">{t("ecosystem.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("ecosystem.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {ecosystemComponents.map((component, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${component.color}`} />
                    <CardContent className="p-6 relative">
                      <component.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">{t(`ecosystem.components.${component.title}.title`)}</h3>
                      <p className="text-muted-foreground">{t(`ecosystem.components.${component.title}.description`)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("ecosystem.growth.title")}</CardTitle>
                    <CardDescription>{t("ecosystem.growth.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`${value.toLocaleString()}`, t("ecosystem.growth.activeUsers")]}
                            contentStyle={{ borderRadius: "8px" }}
                          />
                          <Bar dataKey="users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name={t("ecosystem.growth.activeUsers")} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("ecosystem.distribution.title")}</CardTitle>
                    <CardDescription>{t("ecosystem.distribution.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ecosystemDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {ecosystemDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, t("ecosystem.distribution.activity")]}
                            contentStyle={{ borderRadius: "8px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {ecosystemDistribution.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">
                            {item.name} ({item.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* AI Technology */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {t("aiTechnology.badge")}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">{t("aiTechnology.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("aiTechnology.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <feature.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">{t(`aiTechnology.features.${feature.title}.title`)}</h3>
                      <p className="text-muted-foreground">{t(`aiTechnology.features.${feature.title}.description`)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Card className="max-w-4xl mx-auto bg-primary/5 border-none">
                <CardContent className="p-8">
                  <Brain className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{t("aiTechnology.power.title")}</h3>
                  <p className="text-lg mb-6">
                    {t("aiTechnology.power.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {t("team.badge")}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">{t("team.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("team.description")}
              </p>
            </div>

            <AnimatedTestimonialsDemo />
          </div>
        </section>

        {/* Partners & Exchanges */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <PartnerLogos />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t("cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/staking">
                    {t("cta.buttons.staking")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/token">
                    {t("cta.buttons.token")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

