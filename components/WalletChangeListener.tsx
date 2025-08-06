"use client"

import { useEffect, useRef } from "react"
import { useActiveAccount, useDisconnect, useActiveWallet, useConnect } from "thirdweb/react"
import useWalletStore from '@/store/userWalletStore'
import { toast } from "sonner"

export default function WalletChangeListener() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const { setAccount } = useWalletStore()
  
  // Ref để track transaction state và tránh xung đột
  const isTransactionActive = useRef(false)
  const lastAccountAddress = useRef<string | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (account) {
      setAccount(account)
      lastAccountAddress.current = account.address
    } else {
      setAccount(null)
      lastAccountAddress.current = null
    }
  }, [account, setAccount])

  // Detect khi có transaction đang pending (có thể thêm listener từ transaction state)
  useEffect(() => {
    // Listen for transaction events to set flag
    const handleBeforeUnload = () => {
      isTransactionActive.current = false
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Sử dụng phương thức subscribe của wallet thay vì window.ethereum
  useEffect(() => {
    if (!wallet) return

    // Clear any existing timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }

    // Xử lý khi tài khoản thay đổi với debounce
    const unsubscribeAccount = wallet.subscribe("accountChanged", async (newAccount) => {
      // Clear existing timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }

      // Delay processing để tránh xung đột với transaction
      reconnectTimeout.current = setTimeout(async () => {
        if (!newAccount) {
          // Ngắt kết nối nếu không có tài khoản
          disconnect(wallet)
          return
        }
        
        // Kiểm tra xem có phải là thay đổi account thực sự không
        const currentAddress = account?.address
        const newAddress = newAccount.address
        
        if (currentAddress && newAddress && newAddress !== currentAddress) {
          // Chỉ reconnect nếu không có transaction đang active
          if (!isTransactionActive.current) {
            try {
              await connect(wallet)
              toast.success("Wallet updated", {
                description: "Wallet updated"
              })
            } catch (error) {
              console.error("Error reconnecting wallet:", error)
              // Chỉ hiện toast lỗi nếu không phải do SafePal behavior
              const errorMessage = (error as Error)?.message || ""
              if (!errorMessage.includes("User rejected") && !errorMessage.includes("SafePal")) {
                toast.error("Connection error", {
                  description: "Failed to update wallet connection"
                })
              }
            }
          }
        }
        
        reconnectTimeout.current = null
      }, 1500) // Delay 1.5 giây để tránh xung đột
    })

    // Xử lý khi chain thay đổi với safeguard
    const unsubscribeChain = wallet.subscribe("chainChanged", async (newChain) => {
      // Clear existing timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }

      // Delay processing
      reconnectTimeout.current = setTimeout(async () => {
        // Chỉ xử lý nếu không có transaction đang active
        if (!isTransactionActive.current) {
          try {
            await connect(wallet)
            toast.success("Network changed", {
              description: "Please choose the BSC chain"
            })
          } catch (error) {
            console.error("Error handling chain change:", error)
            const errorMessage = (error as Error)?.message || ""
            if (!errorMessage.includes("User rejected") && !errorMessage.includes("SafePal")) {
              toast.error("Network change error", {
                description: "Failed to update network connection"
              })
            }
          }
        }
        
        reconnectTimeout.current = null
      }, 1500)
    })

    // Cleanup function
    return () => {
      unsubscribeAccount()
      unsubscribeChain()
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
        reconnectTimeout.current = null
      }
    }
  }, [wallet, account, disconnect, connect])

  // Public method để set transaction state (có thể được gọi từ component khác)
  useEffect(() => {
    // Expose method to set transaction active state
    (window as any).setTransactionActive = (active: boolean) => {
      isTransactionActive.current = active
    }
    
    return () => {
      delete (window as any).setTransactionActive
    }
  }, [])

  // Không render gì cả - đây chỉ là một component lắng nghe sự kiện
  return null
}