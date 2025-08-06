"use client"

import { useDAppDetection } from '@/hooks/useDAppDetection'
import SmartWalletConnect from '@/components/SmartWalletConnect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useActiveAccount } from 'thirdweb/react'

export default function WalletTestPage() {
  const dappInfo = useDAppDetection()
  const account = useActiveAccount()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Wallet Connect Test</h1>
        <p className="text-muted-foreground">Test the smart wallet connection system</p>
      </div>

      {/* Environment Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Environment Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Environment:</span>
            <Badge variant={dappInfo.isDApp ? "destructive" : "default"}>
              {dappInfo.isDApp ? "Mobile DApp" : "Desktop Browser"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Detected App:</span>
            <span className="text-sm">{dappInfo.dappName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Has Provider:</span>
            <Badge variant={dappInfo.hasProvider ? "default" : "secondary"}>
              {dappInfo.hasProvider ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Is Desktop:</span>
            <Badge variant={dappInfo.isDesktopBrowser ? "outline" : "secondary"}>
              {dappInfo.isDesktopBrowser ? "Yes" : "No"}
            </Badge>
          </div>
          
          {account && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Connected Account:</span>
              <span className="text-sm font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Wallet Connect Test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smart Wallet Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {dappInfo.isDesktopBrowser && (
                <p>🖥️ Desktop Browser: Will show wallet selection modal</p>
              )}
              {dappInfo.isDApp && dappInfo.hasProvider && (
                <p>📱 Mobile DApp with Provider: Will connect directly to {dappInfo.dappName}</p>
              )}
              {dappInfo.isDApp && !dappInfo.hasProvider && (
                <p>📱 Mobile DApp without Provider: Will try injected wallet</p>
              )}
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/20">
              <SmartWalletConnect 
                onConnected={() => {
                  console.log('✅ Wallet connected successfully!')
                }}
              />
            </div>
            
            <div className="text-xs text-center text-muted-foreground">
              {!account ? (
                <p>☝️ Click the button above to test wallet connection</p>
              ) : (
                <p>✅ Wallet connected! Click the address button to view details</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-medium mb-2">Expected Behavior:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Desktop Browser:</strong> Shows wallet selection modal</p>
          <p><strong>SafePal Mobile:</strong> Connects directly to SafePal</p>
          <p><strong>Trust Wallet Mobile:</strong> Connects directly to Trust Wallet</p>
          <p><strong>After Connection:</strong> Shows address button with dropdown</p>
        </div>
      </div>
    </div>
  )
}
