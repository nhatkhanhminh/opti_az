// store/useWalletStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isPossibleEVMAddress } from '@/ultis/address'

// Định nghĩa kiểu dữ liệu cụ thể cho account
interface WalletAccount {
  address: string
  chainId?: number
  // Thêm các thuộc tính khác tùy vào thirdweb's account structure
}

// Thêm interface cho referrer data với expiration
interface ReferrerData {
  address: string
  timestamp: number
  expiresAt: number
}

// Interface cho thông tin wallet từ thirdweb
interface WalletInfo {
  isConnected: boolean
  walletType: 'dapp' | 'browser' | 'unknown'
  walletId: string
  walletName: string
  isDAppWallet: boolean
}

interface WalletState {
  account: WalletAccount | null
  referrer: string | null
  referrerData: ReferrerData | null
  // Thêm memory fallback cho dApp wallet
  memoryReferrer: string | null
  isReferrerSaved: boolean
  // Thêm wallet info từ thirdweb
  walletInfo: WalletInfo | null
  setAccount: (account: WalletAccount | null) => void
  setReferrer: (referrer: string | null) => void
  setReferrerWithExpiration: (referrer: string, expirationDays?: number) => void
  getReferrer: () => string | null
  clearExpiredReferrer: () => void
  setIsReferrerSaved: (value: boolean) => void
  clearReferrerData: () => void
  // Thêm methods cho wallet info
  updateWalletInfo: (walletInfo: WalletInfo) => void
  getWalletInfo: () => WalletInfo | null
  // Utility functions
  isDAppWallet: () => boolean
  testLocalStorage: () => boolean
}

// Utility function để detect dApp wallet - giữ làm fallback
const detectDAppWallet = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check for common dApp wallet indicators
  const userAgent = navigator.userAgent.toLowerCase()
  const isInApp = userAgent.includes('wv') || // WebView
                  userAgent.includes('metamask') ||
                  userAgent.includes('trust') ||
                  userAgent.includes('coinbase') ||
                  userAgent.includes('binance') ||
                  userAgent.includes('okx') ||
                  userAgent.includes('tokenpocket') ||
                  window.location !== window.parent.location // In iframe
  
  return isInApp
}

// Test localStorage availability
const testLocalStorageAvailability = (): boolean => {
  try {
    const testKey = '__localStorage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      account: null,
      referrer: null,
      referrerData: null,
      memoryReferrer: null,
      isReferrerSaved: false,
      walletInfo: null,
      
      setAccount: (account) => set({ account }),
      
      setReferrer: (referrer) => set({ 
        referrer: referrer && isPossibleEVMAddress(referrer) ? referrer : null,
        memoryReferrer: referrer && isPossibleEVMAddress(referrer) ? referrer : null,
        // Reset isReferrerSaved khi thay đổi referrer
        isReferrerSaved: referrer === null
      }),

      // Lưu referrer với expiration time (mặc định 7 ngày)
      setReferrerWithExpiration: (referrer, expirationDays = 7) => {
        if (!referrer || !isPossibleEVMAddress(referrer)) return
        
        const now = Date.now()
        const expiresAt = now + (expirationDays * 24 * 60 * 60 * 1000) // 7 ngày
        
        const referrerData = {
          address: referrer,
          timestamp: now,
          expiresAt
        }
        
        try {
          // Thử lưu vào localStorage trước
          set({
            referrer,
            referrerData,
            memoryReferrer: referrer,
            isReferrerSaved: false
          })
        } catch (error) {
          console.warn('⚠️ localStorage not available, using memory fallback')
          // Fallback: chỉ lưu vào memory
          set({
            referrer,
            referrerData: null, // Không lưu vào localStorage
            memoryReferrer: referrer,
            isReferrerSaved: false
          })
        }
      },

      // Lấy referrer, tự động xóa nếu expired
      getReferrer: () => {
        const state = get()
        
        // Priority 1: Check localStorage data
        if (state.referrerData) {
          const now = Date.now()
          if (now > state.referrerData.expiresAt) {
            // Referrer đã expired, xóa nó
            set({ 
              referrer: null, 
              referrerData: null,
              memoryReferrer: null,
              isReferrerSaved: false 
            })
            return null
          }
          return state.referrerData.address
        }
        
        // Priority 2: Check memory fallback (for dApp wallets)
        if (state.memoryReferrer) {
          return state.memoryReferrer
        }
        
        // Priority 3: Check basic referrer
        return state.referrer
      },

      // Xóa referrer expired
      clearExpiredReferrer: () => {
        const state = get()
        if (!state.referrerData) return
        
        const now = Date.now()
        if (now > state.referrerData.expiresAt) {
          set({ 
            referrer: null, 
            referrerData: null,
            memoryReferrer: null,
            isReferrerSaved: false 
          })
        }
      },
      
      setIsReferrerSaved: (value) => set({ isReferrerSaved: value }),
      
      clearReferrerData: () => set({ 
        referrer: null, 
        referrerData: null,
        memoryReferrer: null,
        isReferrerSaved: false 
      }),

      // Methods cho wallet info từ thirdweb
      updateWalletInfo: (walletInfo) => set({ walletInfo }),
      
      getWalletInfo: () => {
        const state = get()
        return state.walletInfo
      },

      // Utility functions
      isDAppWallet: () => {
        const state = get()
        // Priority 1: Use thirdweb wallet info if available
        if (state.walletInfo) {
          return state.walletInfo.isDAppWallet
        }
        // Priority 2: Fallback to old detection method
        return detectDAppWallet()
      },
      
      testLocalStorage: testLocalStorageAvailability,
    }),
    {
      name: 'wallet-storage',
      version: 4, // Tăng version để migration
      partialize: (state) => ({ 
        referrer: state.referrer, 
        referrerData: state.referrerData,
        isReferrerSaved: state.isReferrerSaved,
        // Không lưu walletInfo và memoryReferrer vào localStorage
      }),
      // Migration từ version cũ
      migrate: (persistedState: any, version) => {
        if (version === 0 || version === 1 || version === 2 || version === 3) {
          // Migration từ version cũ sang version 4
          return {
            ...persistedState,
            referrerData: persistedState.referrerData || null,
            memoryReferrer: null,
            isReferrerSaved: persistedState.isReferrerSaved || false,
            walletInfo: null
          }
        }
        return persistedState as any
      },
    }
  )
)

export default useWalletStore

// Export types để sử dụng ở nơi khác
export type { WalletInfo, WalletAccount, ReferrerData }