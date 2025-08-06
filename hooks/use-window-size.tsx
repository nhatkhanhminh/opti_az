"use client"

import { useState, useEffect } from "react"

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      handleResize()
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return windowSize
}

// Custom hook để get current domain dynamically (có thể dùng cho mục đích khác)
export const useCurrentDomain = (fallbackDomain: string = 'optifund.app') => {
  const [currentDomain, setCurrentDomain] = useState(fallbackDomain)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.host)
    }
  }, [])
  
  return currentDomain
}

// Helper function để tạo referral link - Force sử dụng optifund.app domain
export const useReferralLink = (address?: string) => {
  // Luôn sử dụng optifund.app domain để tránh phân tán links và chuẩn bị cho migration
  const targetDomain = 'optifund.app'
  
  return address ? `https://${targetDomain}/?ref=${address}` : null
}

