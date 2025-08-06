"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useInView, useAnimation } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  Rocket,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Users,
  Smartphone,
  Award,
  Layers,
  Cpu,
  ArrowRight,
  ArrowDownUp,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProjectRoadmap() {
  const t = useTranslations("RoadmapPage")
  const [activeFilter, setActiveFilter] = useState("all")
  const controls = useAnimation()
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.2 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 dark:text-green-400"
      case "in-progress":
        return "text-amber-500 dark:text-amber-400"
      case "upcoming":
        return "text-blue-500 dark:text-blue-400"
      default:
        return "text-gray-500 dark:text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return t("status.completed")
      case "in-progress":
        return t("status.inProgress")
      case "upcoming":
        return t("status.upcoming")
      default:
        return t("status.comingSoon")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
      case "upcoming":
        return <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      default:
        return null
    }
  }

  const roadmapData = [
    {
      id: "phase1",
      phase: t("phases.phase1.phase"),
      title: t("phases.phase1.title"),
      date: t("phases.phase1.date"),
      status: "completed",
      description: t("phases.phase1.description"),
      icon: Rocket,
      color: "from-green-500 to-emerald-700",
      darkColor: "from-green-400 to-emerald-600",
      image: "/images/roadmap/phase1.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase1.achievements.staking"), icon: Award },
        { text: t("phases.phase1.achievements.team"), icon: ArrowDownUp },
        { text: t("phases.phase1.achievements.funding"), icon: Shield },
        { text: t("phases.phase1.achievements.community"), icon: Globe },
      ],
      details: t("phases.phase1.details"),
    },
    {
      id: "phase2",
      phase: t("phases.phase2.phase"),
      title: t("phases.phase2.title"),
      date: t("phases.phase2.date"),
      status: "completed",
      icon: Layers,
      color: "from-blue-500 to-indigo-700",
      darkColor: "from-blue-400 to-indigo-600",
      image: "/images/roadmap/phase2.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase2.achievements.swap"), icon: Shield },
        { text: t("phases.phase2.achievements.security"), icon: Shield },
        { text: t("phases.phase2.achievements.design"), icon: Smartphone },
        { text: t("phases.phase2.achievements.testing"), icon: Users },
      ],
      details: t("phases.phase2.details"),
    },
    {
      id: "phase3",
      phase: t("phases.phase3.phase"),
      title: t("phases.phase3.title"),
      date: t("phases.phase3.date"),
      status: "in-progress",
      icon: Zap,
      color: "from-amber-500 to-orange-700",
      darkColor: "from-amber-400 to-orange-600",
      image: "/images/roadmap/phase3.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase3.achievements.listings"), icon: Award },
        { text: t("phases.phase3.achievements.audit"), icon: Rocket },
        { text: t("phases.phase3.achievements.generation"), icon: Globe },
        { text: t("phases.phase3.achievements.marketing"), icon: Users },
      ],
      details: t("phases.phase3.details"),
    },
    {
      id: "phase4",
      phase: t("phases.phase4.phase"),
      title: t("phases.phase4.title"),
      date: t("phases.phase4.date"),
      status: "in-progress",
      icon: Globe,
      color: "from-purple-500 to-violet-700",
      darkColor: "from-purple-400 to-violet-600",
      image: "/images/roadmap/phase4.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase4.achievements.mobile"), icon: Smartphone },
        { text: t("phases.phase4.achievements.gamefi"), icon: Award },
        { text: t("phases.phase4.achievements.partnerships"), icon: Users },
        { text: t("phases.phase4.achievements.governance"), icon: Shield },
      ],
      details: t("phases.phase4.description"),
    },
    {
      id: "phase5",
      phase: t("phases.phase5.phase"),
      title: t("phases.phase5.title"),
      date: t("phases.phase5.date"),
      status: "upcoming",
      icon: Cpu,
      color: "from-pink-500 to-rose-700",
      darkColor: "from-pink-400 to-rose-600",
      image: "/images/roadmap/phase5.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase5.achievements.crossChain"), icon: Layers },
        { text: t("phases.phase5.achievements.trading"), icon: Zap },
        { text: t("phases.phase5.achievements.analytics"), icon: Cpu },
        { text: t("phases.phase5.achievements.institutional"), icon: Shield },
      ],
      details: t("phases.phase5.description"),
    },
    {
      id: "phase6",
      phase: t("phases.phase6.phase"),
      title: t("phases.phase6.title"),
      date: t("phases.phase6.date"),
      status: "upcoming",
      icon: Globe,
      color: "from-cyan-500 to-blue-700",
      darkColor: "from-cyan-400 to-blue-600",
      image: "/images/roadmap/phase6.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase6.achievements.marketing"), icon: Globe },
        { text: t("phases.phase6.achievements.compliance"), icon: Shield },
        { text: t("phases.phase6.achievements.enterprise"), icon: Users },
        { text: t("phases.phase6.achievements.grants"), icon: Award },
      ],
      details: t("phases.phase6.description"),
    },
    {
      id: "phase7",
      phase: t("phases.phase7.phase"),
      title: t("phases.phase7.title"),
      date: t("phases.phase7.date"),
      status: "upcoming",
      icon: Globe,
      color: "from-cyan-500 to-blue-700",
      darkColor: "from-cyan-400 to-blue-600",
      image: "/images/roadmap/phase7.jpg?height=200&width=300",
      achievements: [
        { text: t("phases.phase7.achievements.defi"), icon: Globe },
        { text: t("phases.phase7.achievements.cards"), icon: Shield },
      ],
      details: t("phases.phase7.description"),
    },
  ]

  const filteredData = activeFilter === "all" ? roadmapData : roadmapData.filter((item) => item.status === activeFilter)

  return (
    <section className="py-16 px-4 md:py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(#acbfe6_1px,transparent_1px)] dark:bg-[radial-gradient(#6e968f_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />

      {/* Floating elements */}
      <motion.div
        className="absolute top-20 right-[10%] h-24 w-24 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur-xl"
        animate={{
          y: [0, 15, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 left-[15%] h-32 w-32 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/10 blur-xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{t("hero.badge")}</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 Project bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">
            {t("hero.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("hero.description")}
          </p>
        </motion.div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className={cn("rounded-full transition-all duration-300", activeFilter === "all" ? "shadow-md" : "")}
          >
            {t("filters.all")}
          </Button>
          <Button
            variant={activeFilter === "completed" ? "default" : "outline"}
            onClick={() => setActiveFilter("completed")}
            className={cn(
              "rounded-full transition-all duration-300",
              activeFilter === "completed"
                ? "shadow-md bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800"
                : "",
            )}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {t("filters.completed")}
          </Button>
          <Button
            variant={activeFilter === "in-progress" ? "default" : "outline"}
            onClick={() => setActiveFilter("in-progress")}
            className={cn(
              "rounded-full transition-all duration-300",
              activeFilter === "in-progress"
                ? "shadow-md bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800"
                : "",
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {t("filters.inProgress")}
          </Button>
          <Button
            variant={activeFilter === "upcoming" ? "default" : "outline"}
            onClick={() => setActiveFilter("upcoming")}
            className={cn(
              "rounded-full transition-all duration-300",
              activeFilter === "upcoming"
                ? "shadow-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800"
                : "",
            )}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t("filters.upcoming")}
          </Button>
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          {/* Empty state when no items match filter */}
          {filteredData.length === 0 && (
            <motion.div
              className="text-center py-16 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">{t("emptyState.title")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("emptyState.description")}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveFilter("all")}>
                {t("emptyState.viewAll")}
              </Button>
            </motion.div>
          )}

          {/* Timeline center line - only show when there are items */}
          {filteredData.length > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/10 rounded-full hidden md:block" />
          )}

          {filteredData.map((phase, index) => {
            const isEven = index % 2 === 0
            const isLast = index === filteredData.length - 1

            return (
              <motion.div
                key={phase.id}
                className="mb-16 relative"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.2,
                      ease: "easeOut",
                    },
                  },
                }}
                layout
              >
                {/* Timeline node (visible on md and up) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-4 border-primary/50 z-10 hidden md:flex items-center justify-center shadow-lg">
                  <phase.icon className="h-5 w-5 text-primary" />
                </div>

                {/* Content card */}
                <div
                  className={cn(
                    "relative md:w-[calc(50%-2rem)] p-1 rounded-xl overflow-hidden transition-all duration-500 shadow-xl",
                    isEven ? "md:ml-auto" : "",
                  )}
                >
                  {/* Gradient border */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br dark:opacity-80 rounded-xl"
                    style={{
                      background: `linear-gradient(to bottom right, ${isEven ? "var(--primary)" : "var(--primary)"}, transparent)`,
                    }}
                  />

                  {/* Card content */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 h-full">
                    {/* Mobile timeline indicator */}
                    <div className="flex items-center md:hidden mb-4">
                      <div
                        className="w-10 h-10 rounded-full bg-card dark:opacity-90 flex items-center justify-center shadow-md"
                        style={{
                          background: `linear-gradient(to bottom right, ${phase.color})`,
                          backgroundImage: `linear-gradient(to bottom right, var(--${phase.color.split("-")[1]}-500), var(--${phase.color.split("-")[3]}-700))`,
                        }}
                      >
                        <phase.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <Badge variant="outline" className={cn("font-medium", getStatusColor(phase.status))}>
                          {getStatusText(phase.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">{phase.phase}</div>
                        <h3 className="text-xl md:text-2xl font-bold">{phase.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1">{phase.date}</div>
                      </div>

                      {/* Status badge (desktop) */}
                      <Badge
                        variant="outline"
                        className={cn("hidden md:flex items-center gap-1.5 font-medium", getStatusColor(phase.status))}
                      >
                        {getStatusIcon(phase.status)}
                        {getStatusText(phase.status)}
                      </Badge>
                    </div>

                    <p className="mt-3 text-muted-foreground">{phase.description}</p>

                    {/* Achievements */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {phase.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <achievement.icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{achievement.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Always visible expanded content */}
                    <div className="mt-6 space-y-4">
                      <div className="relative h-48 rounded-lg overflow-hidden">
                        <Image
                          src={phase.image || "/placeholder.svg"}
                          alt={phase.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <h4 className="font-medium">{phase.title}</h4>
                            <p className="text-sm text-white/80">{phase.date}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm">{phase.details}</p>

                      {phase.status === "in-progress" && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                          <h4 className="font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t("status.inProgress")}
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            {t("status.inProgress")}
                          </p>
                        </div>
                      )}

                      {phase.status === "upcoming" && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 dark:text-blue-400 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            {t("status.comingSoon")}
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            {t("status.comingSoon")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline connector (visible on md and up) */}
                {!isLast && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full  items-center justify-center hidden md:block">
                    <motion.div
                      className="h-full w-0.5 bg-primary/20"
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 1, delay: index * 0.2 + 0.3 }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Call to action */}
        <motion.div
          className="mt-16 text-center max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-3">{t("cta.title")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("cta.description")}
          </p>
          <Link href="https://t.me/azcoin_app">
            <Button className="rounded-full">
              <Send className="mr-2 h-4 w-4" />
              {t("cta.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

