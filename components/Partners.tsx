"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useTranslations } from "next-intl"
// Sample partner logos - replace with your actual partners
const partners = [
  {
    name: "Binance",
    logo: "/images/partners/binance.svg",
  },
  {
    name: "Coinbase",
    logo: "/images/partners/coinbase.svg",
  },
  {
    name: "Kraken",
    logo: "/images/partners/kraken.svg",
  },
  {
    name: "OKX",
    logo: "/images/partners/okx.svg",
  },
  {
    name: "Bybit",
    logo: "/images/partners/bybit.svg",
  },
  {
    name: "KuCoin",
    logo: "/images/partners/kucoin.svg",
  },
  {
    name: "Gate.io",
    logo: "/images/partners/gateio.svg",
  },
  {
    name: "Huobi",
    logo: "/images/partners/huobi.svg",
  },
  {
    name: "CertiK",
    logo: "/images/partners/certik.svg",
  },
]

// Double the array for seamless loop
const extendedPartners = [...partners, ...partners]

export default function PartnerLogos() {
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()
  const t = useTranslations("PartnersSection")

  useEffect(() => {
    const animate = async () => {
      // Reset to starting position
      await controls.set({ x: "0%" })

      // Animate to end position (negative half of the total width)
      await controls.start({
        x: "-50%",
        transition: {
          duration: 30,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      })
    }

    animate()
  }, [controls])

  // Pause animation on hover
  const handleMouseEnter = () => {
    controls.stop()
  }

  const handleMouseLeave = () => {
    controls.start({
      x: "-50%",
      transition: {
        duration: 30,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    })
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {t("badge")}
          </Badge>
          <h2 className="text-3xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div
          className="relative max-w-full mx-auto overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={containerRef}
        >
          <motion.div className="flex" animate={controls} style={{ width: "fit-content" }}>
            {extendedPartners.map((partner, index) => (
              <div key={index} className="px-8 flex-shrink-0" style={{ width: "200px" }}>
                <div className="flex items-center justify-center p-6 h-32">
                  <Image
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    width={100}
                    height={50}
                    className="max-h-16 max-w-full object-contain filter grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Gradient masks for smooth fade effect */}
          {/* <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/20 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/30 to-transparent z-10" /> */}
        </div>
      </div>
    </section>
  )
}