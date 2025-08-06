"use client"

import { useState } from 'react'
import { useWalletDetection } from '@/hooks/useWalletDetection'
import useWalletStore from '@/store/userWalletStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function WalletDebugInfo() {
  const [isVisible, setIsVisible] = useState(false)
  const walletInfo = useWalletDetection()
  const { testLocalStorage, getReferrer } = useWalletStore()

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          🔍 Debug
        </Button>
      </div>
    )
  }

  const hasLocalStorage = testLocalStorage()
  const currentReferrer = getReferrer()

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/90 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Wallet Debug Info</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Connected:</span>
            <Badge variant={walletInfo.isConnected ? "default" : "secondary"}>
              {walletInfo.isConnected ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Wallet Type:</span>
            <Badge variant="outline">{walletInfo.walletType}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Is DApp:</span>
            <Badge variant={walletInfo.isDAppWallet ? "destructive" : "default"}>
              {walletInfo.isDAppWallet ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Wallet ID:</span>
            <span className="text-right truncate max-w-32" title={walletInfo.walletId}>
              {walletInfo.walletId}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Wallet Name:</span>
            <span className="text-right truncate max-w-32" title={walletInfo.walletName}>
              {walletInfo.walletName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>LocalStorage:</span>
            <Badge variant={hasLocalStorage ? "default" : "destructive"}>
              {hasLocalStorage ? "Available" : "Blocked"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Referrer:</span>
            <span className="text-right truncate max-w-32" title={currentReferrer || 'None'}>
              {currentReferrer ? `${currentReferrer.slice(0, 6)}...${currentReferrer.slice(-4)}` : 'None'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 