import { useActiveWallet } from "thirdweb/react"
import { useEffect } from "react"
import useWalletStore, { WalletInfo } from "@/store/userWalletStore"

export const useWalletDetection = () => {
  const wallet = useActiveWallet()
  const { updateWalletInfo, getWalletInfo } = useWalletStore()

  // Tạo wallet info từ thirdweb
  const createWalletInfo = (): WalletInfo => {
    if (!wallet) {
      return {
        isConnected: false,
        walletType: 'unknown',
        walletId: 'unknown',
        walletName: 'unknown',
        isDAppWallet: false
      }
    }

    const walletId = wallet.id
    let walletName = 'unknown'
    
    // Safely get wallet name
    try {
      const config = wallet.getConfig()
      walletName = (config as any)?.metadata?.name || walletId
    } catch (error) {
      walletName = walletId
    }
    
    // Determine wallet type và isDAppWallet
    let walletType: 'dapp' | 'browser' | 'unknown' = 'unknown'
    let isDAppWallet = false

    // Check for browser extension wallets
    if (walletId.includes('metamask') || walletId.includes('browser') || walletId === 'io.metamask') {
      walletType = 'browser'
      isDAppWallet = false
    } else {
      // Most other wallets are mobile dApp wallets
      walletType = 'dapp'
      isDAppWallet = true
    }

    return {
      isConnected: true,
      walletType,
      walletId,
      walletName,
      isDAppWallet
    }
  }

  // Update wallet info khi wallet thay đổi
  useEffect(() => {
    const walletInfo = createWalletInfo()
    updateWalletInfo(walletInfo)
  }, [wallet, updateWalletInfo])

  // Return current wallet info
  const currentWalletInfo = getWalletInfo() || createWalletInfo()
  
  return currentWalletInfo
} 