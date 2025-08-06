"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, Sparkles, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { useTranslations } from "next-intl"

interface StakeSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  tokenAmount: number
  tokenSymbol: string
  usdValue: number
  mpy: number
}

export function StakeSuccessModal({ isOpen, onClose, tokenAmount, tokenSymbol, usdValue, mpy }: StakeSuccessModalProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)
  const t = useTranslations("SuccessModal")

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen && !showConfetti) {
      setShowConfetti(true)

      // Fire confetti
      const duration = 4000
      const end = Date.now() + duration

      const runConfetti = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#5E5AFF", "#67E8F9", "#818CF8","#1ED8A0","#d362c4"],
        })

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#5E5AFF", "#67E8F9", "#818CF8","#1ED8A0","#d362c4"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(runConfetti)
        }
      }

      runConfetti()
    }

    if (!isOpen) {
      setShowConfetti(false)
    }
  }, [isOpen, showConfetti])

  const handleViewStakes = () => {
    router.push("/mystake")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-xl overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 -z-10" />

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <AnimatePresence>
            {isOpen && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-primary/60"
                    initial={{
                      x: Math.random() * 100 - 50 + "%",
                      y: Math.random() * 100 + "%",
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      y: [null, "-50%"],
                      opacity: [0, 0.8, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      delay: Math.random() * 2,
                    }}
                  />
                ))}

                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute text-primary/80"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                      opacity: 0,
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      delay: Math.random() * 3,
                    }}
                  >
                    <Star className="w-3 h-3 fill-primary" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center text-center pt-4">
          {/* Success animation */}
          <div className="relative mb-6">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                >
                  <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Sparkles around the success icon */}
            <AnimatePresence>
              {isOpen && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`sparkle-${i}`}
                      className="absolute"
                      initial={{
                        x: "50%",
                        y: "50%",
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        x: `${50 + Math.cos((i * Math.PI) / 2) * 130}%`,
                        y: `${50 + Math.sin((i * Math.PI) / 2) * 130}%`,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.3 + i * 0.1,
                        ease: "easeOut",
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          <DialogHeader className="space-y-2 mb-4">
            <DialogTitle className="text-2xl font-bold text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                {t("title")}
              </motion.div>
            </DialogTitle>

            <motion.p
              className="text-muted-foreground text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t("description")}
            </motion.p>
          </DialogHeader>

          <motion.div
            className="bg-gradient-to-br from-background to-muted/50 rounded-xl p-6 mb-6 w-full border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("details.amountStaked")}</span>
                <span className="font-medium">
                  {tokenAmount} {tokenSymbol}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("details.value")}</span>
                <span className="font-medium">${usdValue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-muted-foreground">{t("details.estimatedMPY")}</span>
                <span className="font-medium text-primary">{mpy}% / {t("details.month")}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button variant="outline" className="w-full cursor-pointer" onClick={onClose}>
              {t("buttons.close")}
            </Button>
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button className="w-full cursor-pointer" onClick={handleViewStakes}>
              {t("buttons.viewStakes")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

