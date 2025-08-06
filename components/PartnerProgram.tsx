"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Award, TrendingUp, Network, ArrowRight, Star, Crown, Shield, Medal, Trophy } from "lucide-react"
import { useTranslations } from "next-intl"

const directCommission = [
  { level: "F1", rate: "6%", color: "from-violet-500/20 to-violet-500/5" },
  { level: "F2", rate: "1%", color: "from-blue-500/20 to-blue-500/5" },
  { level: "F3", rate: "1%", color: "from-sky-500/20 to-sky-500/5" },
]

const profitSharing = [
  { level: 1, rate: "20%", requirement: "3 Direct" },
  { level: 2, rate: "10%", requirement: "5 Direct" },
  { level: 3, rate: "5%", requirement: "7 Direct" },
  { level: 4, rate: "5%", requirement: "9 Direct" },
  { level: 5, rate: "5%", requirement: "11 Direct" },
  { level: 6, rate: "1%", requirement: "13 Direct" },
  { level: 7, rate: "1%", requirement: "15 Direct" },
  { level: 8, rate: "1%", requirement: "17 Direct" },
  { level: 9, rate: "1%", requirement: "19 Direct" },
  { level: 10, rate: "1%", requirement: "21 Direct" },
]

const leaderRanks = [
  {
    name: "silver",
    icon: Shield,
    f1: "$3K",
    requirement: "$30K",
    bonus: "3%",
    color: "from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/30", 
    border: "border-gray-300 dark:border-gray-600",
    iconBg: "bg-gray-400/30",
    iconColor: "text-gray-700 dark:text-gray-300",
  },
  {
    name: "gold",
    icon: Medal,
    f1: "$5K",
    requirement: "$100K",
    bonus: "5%",
    color: "from-yellow-100 to-amber-200 dark:from-yellow-900/50 dark:to-amber-800/40", 
    border: "border-yellow-300 dark:border-yellow-700",
    iconBg: "bg-yellow-400/30",
    iconColor: "text-yellow-700 dark:text-yellow-300",
  },
  {
    name: "platinum",
    icon: Star,
    f1: "$10K",
    requirement: "$200K",
    bonus: "7%",
    color: "from-sky-50 to-sky-100 dark:from-sky-950/40 dark:to-sky-900/20",
    border: "border-sky-200 dark:border-sky-800",
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    name: "diamond",
    icon: Crown,
    f1: "$15K",
    requirement: "$350k",
    bonus: "9%",
    color: "from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20", 
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "royal",
    icon: Trophy,
    f1: "$20K",
    requirement: "$500k",
    bonus: "11%",
    color: "from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

export default function PartnerProgram() {
  const t = useTranslations("PartnerProgramSection")

  return (
    <section className="py-20 relative overflow-hidden" id="partner-program">
      {/* Header */}
      <motion.div
        className="container mx-auto px-4 text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          {t("badge")}
        </Badge>
        <h2 className="text-4xl font-bold mb-4">{t("title")}</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t("description")}
        </p>
      </motion.div>

      {/* Direct Commission */}
      <div className="container mx-auto px-4 mb-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t("directCommission.title")}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("directCommission.description")}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {directCommission.map((level) => (
            <motion.div key={level.level} variants={itemVariants}>
              <Card className="relative overflow-hidden h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${level.color}`} />
                <CardContent className="p-6 relative text-center">
                  <div className="text-4xl font-bold text-primary mb-4">{level.rate}</div>
                  <h4 className="text-xl font-semibold mb-2">{t("directCommission.level", { level: level.level })}</h4>
                  <p className="text-muted-foreground">{t("directCommission.commission", { level: level.level })}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Profit Sharing */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {t("profitSharing.title")}
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("profitSharing.description")}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {profitSharing.map((level) => (
              <motion.div key={level.level} variants={itemVariants}>
                <Card className="relative overflow-hidden dark:hover:border-zinc-700  transition-colors duration-300">
                  <div className="absolute inset-0 bg-card " />
                  <CardContent className="p-4 relative text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{level.rate}</div>
                    <h4 className="font-medium mb-2">{t("profitSharing.level")} {level.level}</h4>
                    {/* <p className="text-sm text-muted-foreground">{t("profitSharing.requirement")}</p> */}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">
              {t("profitSharing.requirement")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Leader Ranks */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            {t("leaderBonus.title")}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("leaderBonus.description")}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {leaderRanks.map((rank) => (
            <motion.div
              key={rank.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className={`bg-gradient-to-br ${rank.color} ${rank.border} overflow-hidden h-full`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${rank.iconBg} flex items-center justify-center`}>
                      <rank.icon className={`h-6 w-6 ${rank.iconColor}`} />
                    </div>
                    <div className="text-center space-y-3">
                      <h4 className="text-lg font-bold">{t(`leaderBonus.ranks.${rank.name}`)}</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{rank.requirement} {t("leaderBonus.teamVolume")}</p>
                        <p>{rank.f1} {t("leaderBonus.f1Volume")}</p>
                        <p className="font-medium text-primary">{rank.bonus} {t("leaderBonus.extraCommission")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Network Visualization */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-xl" />
            <Card className="relative bg-background/50 backdrop-blur">
              <CardContent className="p-8">
                <Network className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h4 className="text-xl font-bold mb-4">{t("network.title")}</h4>
                <p className="text-muted-foreground mb-6">
                  {t("network.description")}
                </p>
                <Button size="lg" asChild>
                  <Link href="/staking">
                    {t("network.button")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

