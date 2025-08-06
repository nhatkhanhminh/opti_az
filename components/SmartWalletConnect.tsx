"use client"

import { useDAppDetection, getWalletProvider } from '@/hooks/useDAppDetection'
import { useWalletConnect } from '@/hooks/useWalletConnect'
import { useConnect, useActiveAccount } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WalletConnect } from '@/components/ui/wallet-connect'
import { client } from '@/lib/client'
import { Loader2 } from 'lucide-react'

interface SmartWalletConnectProps {
  onConnected?: () => void
  className?: string
}

export default function SmartWalletConnect({ onConnected, className }: SmartWalletConnectProps) {
  const dappInfo = useDAppDetection()
  const account = useActiveAccount()
  const { handleConnect: handleBrowserConnect, isConnecting: isBrowserConnecting } = useWalletConnect()
  const { connect, isConnecting: isDirectConnecting } = useConnect()

  const isConnecting = isBrowserConnecting || isDirectConnecting

  // Nếu đã kết nối, hiển thị WalletConnect component giống Navbar
  if (account) {
    return (
      <div className={`flex justify-center ${className}`}>
        <WalletConnect />
      </div>
    )
  }

  const handleConnect = async () => {
    try {
      // Priority 1: Desktop browser - always use wallet connect modal
      if (dappInfo.isDesktopBrowser) {
        console.log('🖥️ Desktop browser - showing wallet selector modal...')
        await handleBrowserConnect()
        onConnected?.()
        return
      }

      // Priority 2: Mobile DApp with provider - connect directly
      if (dappInfo.isDApp && dappInfo.hasProvider && dappInfo.recommendedWalletId) {
        console.log(`📱 Mobile DApp - connecting to ${dappInfo.dappName} directly...`)
        
        const wallet = createWallet(dappInfo.recommendedWalletId as any)
        await connect(async () => {
          await wallet.connect({ client })
          return wallet
        })
      } 
      // Priority 3: Mobile DApp without provider - try injected wallet
      else if (dappInfo.isDApp) {
        console.log(`📱 Mobile DApp - trying injected wallet for ${dappInfo.dappName}...`)
        
        const wallet = createWallet('io.metamask') // Fallback to injected
        await connect(async () => {
          await wallet.connect({ client })
          return wallet
        })
      } 
      // Priority 4: Fallback - use wallet connect modal
      else {
        console.log('🔗 Fallback - showing wallet selector modal...')
        await handleBrowserConnect()
      }
      
      onConnected?.()
    } catch (error) {
      console.error('❌ Connection failed:', error)
      
      // Nếu fail và là mobile dApp, thử mở download page
      if (dappInfo.isDApp && !dappInfo.hasProvider && !dappInfo.isDesktopBrowser) {
        try {
          getWalletProvider(dappInfo.dappId)
        } catch (downloadError) {
          console.log('📱 Redirecting to download page...')
        }
      }
    }
  }

  const getButtonText = () => {
    if (isConnecting) return 'Connecting...'
    
    return 'Connect Wallet'
  }



  const getEnvironmentBadge = () => {
    if (dappInfo.isDesktopBrowser) {
      return <Badge variant="outline" className="text-xs">Desktop Browser</Badge>
    } else if (dappInfo.isDApp) {
      return <Badge variant="destructive" className="text-xs">Mobile DApp</Badge>
    } else {
      return <Badge variant="secondary" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Environment Detection Info */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
       
        <span>Detected: {dappInfo.dappName}</span>
        {getEnvironmentBadge()}
      </div>

      {/* Smart Connect Button - giống giao diện Navbar */}
      <Button 
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full rounded-full cursor-pointer"
        size="default"
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            {getButtonText()}
          </>
        )}
      </Button>

      {/* Additional Info */}
      <div className="text-xs text-center text-muted-foreground">
        {dappInfo.isDesktopBrowser && (
          <p>Desktop detected - will show wallet selection modal</p>
        )}
        {dappInfo.isDApp && !dappInfo.hasProvider && !dappInfo.isDesktopBrowser && (
          <p>No native provider detected. Will try injected wallet or redirect to download.</p>
        )}
        {dappInfo.isDApp && dappInfo.hasProvider && !dappInfo.isDesktopBrowser && (
          <p>Native provider detected - will connect directly</p>
        )}
      </div>
    </div>
  )
} 