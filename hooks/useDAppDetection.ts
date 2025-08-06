import { useEffect, useState } from 'react'

interface DAppInfo {
  isDApp: boolean
  dappName: string
  dappId: string
  provider: any
  hasProvider: boolean
  recommendedWalletId?: string // ID wallet nên dùng với thirdweb
  isDesktopBrowser: boolean // Thêm flag để phân biệt desktop browser
}

interface WalletProvider {
  name: string
  id: string
  provider: string // key trong window object
  thirdwebId?: string // ID để connect với thirdweb
  downloadUrl?: string
}

// Danh sách các dApp wallet phổ biến
const KNOWN_DAPP_WALLETS: WalletProvider[] = [
  {
    name: 'SafePal',
    id: 'safepal',
    provider: 'safepalProvider',
    thirdwebId: 'com.safepal',
    downloadUrl: 'https://www.safepal.com/download?product=2'
  },
  {
    name: 'Trust Wallet',
    id: 'trust',
    provider: 'trustwallet',
    thirdwebId: 'com.trustwallet.app',
    downloadUrl: 'https://trustwallet.com/'
  },
  {
    name: 'Binance Wallet',
    id: 'binance',
    provider: 'BinanceChain',
    thirdwebId: 'com.binance.wallet',
    downloadUrl: 'https://www.binance.com/en/wallet'
  },
  {
    name: 'OKX Wallet',
    id: 'okx',
    provider: 'okexchain',
    thirdwebId: 'com.okex.wallet',
    downloadUrl: 'https://www.okx.com/wallet'
  },
  {
    name: 'TokenPocket',
    id: 'tokenpocket',
    provider: 'tokenpocket',
    thirdwebId: 'pro.tokenpocket',
    downloadUrl: 'https://www.tokenpocket.pro/'
  },
  {
    name: 'Coin98 Wallet',
    id: 'coin98',
    provider: 'coin98',
    thirdwebId: 'coin98.com',
    downloadUrl: 'https://coin98.com/'
  },
  {
    name: 'MetaMask',
    id: 'metamask',
    provider: 'ethereum',
    thirdwebId: 'io.metamask',
    downloadUrl: 'https://metamask.io/'
  }
]

// Helper function để detect desktop browser vs mobile
const isDesktopBrowser = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()
  
  // Check for desktop platforms
  const isDesktopPlatform = platform.includes('win') || 
                           platform.includes('mac') || 
                           platform.includes('linux')
  
  // Check if not mobile user agent
  const isMobileUA = userAgent.includes('mobile') ||
                     userAgent.includes('android') ||
                     userAgent.includes('iphone') ||
                     userAgent.includes('ipad') ||
                     userAgent.includes('wv') // WebView
  
  // Desktop if: desktop platform AND not mobile UA AND not in iframe
  return isDesktopPlatform && !isMobileUA && window.location === window.parent.location
}

export const useDAppDetection = (): DAppInfo => {
  const [dappInfo, setDappInfo] = useState<DAppInfo>({
    isDApp: false,
    dappName: 'Unknown',
    dappId: 'unknown',
    provider: null,
    hasProvider: false,
    isDesktopBrowser: false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const detectDApp = () => {
      const isDesktop = isDesktopBrowser()
      
      // Priority 1: If desktop browser, treat as browser even if has providers
      if (isDesktop) {
        console.log('🖥️ Desktop browser detected - using browser mode')
        
        // Check if has wallet extensions for info
        let detectedExtension = null
        for (const wallet of KNOWN_DAPP_WALLETS) {
          const provider = (window as any)[wallet.provider]
          if (provider) {
            detectedExtension = wallet
            break
          }
        }
        
        setDappInfo({
          isDApp: false,
          dappName: detectedExtension ? `Browser (${detectedExtension.name} Extension)` : 'Browser',
          dappId: 'browser',
          provider: detectedExtension?.provider || null,
          hasProvider: !!detectedExtension,
          isDesktopBrowser: true
        })
        return
      }

      // Priority 2: Check for mobile dApp wallet providers
      for (const wallet of KNOWN_DAPP_WALLETS) {
        const provider = (window as any)[wallet.provider]
        if (provider) {
          console.log(`📱 Detected ${wallet.name} mobile app provider:`, provider)
          
          setDappInfo({
            isDApp: true,
            dappName: wallet.name,
            dappId: wallet.id,
            provider: provider,
            hasProvider: true,
            recommendedWalletId: wallet.thirdwebId,
            isDesktopBrowser: false
          })
          return
        }
      }

      // Priority 3: Fallback detection by user agent (mobile only)
      const userAgent = navigator.userAgent.toLowerCase()
      const isDAppUA = userAgent.includes('wv') || // WebView
                      userAgent.includes('metamask') ||
                      userAgent.includes('trust') ||
                      userAgent.includes('coinbase') ||
                      userAgent.includes('binance') ||
                      userAgent.includes('okx') ||
                      userAgent.includes('safepal') ||
                      userAgent.includes('tokenpocket') ||
                      window.location !== window.parent.location // In iframe

      if (isDAppUA && !isDesktop) {
        // Try to guess from user agent
        let detectedName = 'Unknown DApp'
        let detectedId = 'unknown'
        
        if (userAgent.includes('safepal')) {
          detectedName = 'SafePal'
          detectedId = 'safepal'
        } else if (userAgent.includes('trust')) {
          detectedName = 'Trust Wallet'
          detectedId = 'trust'
        } else if (userAgent.includes('binance')) {
          detectedName = 'Binance Wallet'
          detectedId = 'binance'
        } else if (userAgent.includes('okx')) {
          detectedName = 'OKX Wallet'
          detectedId = 'okx'
        } else if (userAgent.includes('metamask')) {
          detectedName = 'MetaMask'
          detectedId = 'metamask'
        }

        setDappInfo({
          isDApp: true,
          dappName: detectedName,
          dappId: detectedId,
          provider: null,
          hasProvider: false,
          isDesktopBrowser: false
        })
      } else {
        // Final fallback: regular browser
        setDappInfo({
          isDApp: false,
          dappName: 'Browser',
          dappId: 'browser',
          provider: null,
          hasProvider: false,
          isDesktopBrowser: isDesktop
        })
      }
    }

    // Initial detection
    detectDApp()

    // Re-check when window loads (some providers inject later)
    const handleLoad = () => {
      setTimeout(detectDApp, 1000) // Delay to allow providers to inject
    }

    if (document.readyState === 'loading') {
      window.addEventListener('load', handleLoad)
    } else {
      handleLoad()
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return dappInfo
}

// Utility function để get provider cho wallet cụ thể
export const getWalletProvider = (walletId: string) => {
  if (typeof window === 'undefined') return null
  
  const wallet = KNOWN_DAPP_WALLETS.find(w => w.id === walletId)
  if (!wallet) return null
  
  const provider = (window as any)[wallet.provider]
  if (!provider) {
    console.warn(`${wallet.name} provider not found. Opening download page...`)
    if (wallet.downloadUrl) {
      window.open(wallet.downloadUrl, '_blank')
    }
    throw new Error(`Please install ${wallet.name} first!`)
  }
  
  return provider
}

// Export danh sách wallets để sử dụng
export { KNOWN_DAPP_WALLETS }
export type { DAppInfo, WalletProvider } 