// components/ReferralHandler.tsx
"use client"

import { useEffect, useCallback, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { useActiveAccount } from "thirdweb/react"
import useWalletStore from '@/store/userWalletStore'
import { useWalletDetection } from '@/hooks/useWalletDetection'
import { isPossibleEVMAddress } from "@/ultis/address"

export default function ReferralHandler() {
  const searchParams = useSearchParams()
  const account = useActiveAccount()
  const walletInfo = useWalletDetection()
  const { 
    setAccount, 
    setReferrerWithExpiration,
    getReferrer,
    clearExpiredReferrer,
    isReferrerSaved, 
    setIsReferrerSaved,
    testLocalStorage
  } = useWalletStore()
  const [shouldSaveReferrer, setShouldSaveReferrer] = useState(false)

  // Cập nhật account vào store
  useEffect(() => {
    if (account) {
      setAccount(account)
    }
  }, [account, setAccount])

  // Tự động clear expired referrer khi component mount
  useEffect(() => {
    clearExpiredReferrer()
    
    // Log environment info
    const isDApp = walletInfo.isDAppWallet
    const hasLocalStorage = testLocalStorage()
    
    // console.log('🔍 Environment Check:', {
    //   isDAppWallet: isDApp,
    //   hasLocalStorage: hasLocalStorage,
    //   walletType: walletInfo.walletType,
    //   walletName: walletInfo.walletName,
    //   userAgent: navigator.userAgent
    // })
    
    if (isDApp && !hasLocalStorage) {
      console.warn('⚠️ DApp wallet detected with localStorage issues - using memory fallback')
    }
  }, [clearExpiredReferrer, walletInfo, testLocalStorage])

  // Xử lý referral với fallback mechanism
  useEffect(() => {
    const refParam = searchParams.get('ref')
    
    if (refParam) {
      // Có referrer từ URL - ưu tiên cao nhất
      const refAddress = refParam.split('&')[0]
      if (refAddress && isPossibleEVMAddress(refAddress)) {
        const isDApp = walletInfo.isDAppWallet
        const hasLocalStorage = testLocalStorage()
        
        console.log('🔗 Referrer from URL:', refAddress)
        console.log('📱 DApp wallet:', isDApp, '| localStorage:', hasLocalStorage)
        
        // Lưu referrer với expiration 7 ngày
        setReferrerWithExpiration(refAddress, 7)
        
        // Lưu vào DB nếu có account
        if (account?.address) {
          setShouldSaveReferrer(true)
        }
      }
    } else {
      // Không có referrer từ URL - kiểm tra localStorage hoặc memory
      const existingReferrer = getReferrer()
      if (existingReferrer) {
        const isDApp = walletInfo.isDAppWallet
        const hasLocalStorage = testLocalStorage()
        
        console.log('💾 Referrer from storage:', existingReferrer)
        console.log('📱 DApp wallet:', isDApp, '| localStorage:', hasLocalStorage)
        
        // Lưu vào DB nếu có account và chưa được lưu
        if (account?.address && !isReferrerSaved) {
          setShouldSaveReferrer(true)
        }
      }
    }
  }, [searchParams, setReferrerWithExpiration, getReferrer, account, isReferrerSaved, walletInfo, testLocalStorage])

  // Lưu referrer vào DB - sử dụng lazy loading
  const saveReferrer = useCallback(async () => {
    if (!account?.address || !shouldSaveReferrer) return

    const currentReferrer = getReferrer()
    if (!currentReferrer || isReferrerSaved) return

    // Đặt lại trạng thái để tránh gọi nhiều lần
    setShouldSaveReferrer(false)

    try {
      const isDApp = walletInfo.isDAppWallet
      const hasLocalStorage = testLocalStorage()
      
      // console.log('💾 Saving referrer to DB:', currentReferrer)
      // console.log('📱 Environment:', { isDApp, hasLocalStorage, walletType: walletInfo.walletType })
      
      const response = await fetch('/api/ref', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account.address,
          referrer: currentReferrer,
          // Thêm thông tin environment cho debugging
          metadata: {
            isDAppWallet: isDApp,
            hasLocalStorage: hasLocalStorage,
            walletType: walletInfo.walletType,
            walletId: walletInfo.walletId,
            walletName: walletInfo.walletName,
            userAgent: navigator.userAgent.slice(0, 100) // Limit length
          }
        }),
        signal: AbortSignal.timeout(15000) // Tăng timeout lên 15s cho dApp wallet
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log('✅ Referral saved successfully')
        setIsReferrerSaved(true) // Đánh dấu đã lưu thành công
      } else {
        console.error('❌ Failed to save referral:', data.message)
        // Retry mechanism cho dApp wallet
        if (isDApp) {
          setTimeout(() => setShouldSaveReferrer(true), 5000) // Retry sau 5s
        }
      }
    } catch (error) {
      console.error('❌ Error saving referral:', error)
      
      // Enhanced retry mechanism cho dApp wallet
      const isDApp = walletInfo.isDAppWallet
      if (isDApp) {
        console.log('🔄 Retrying in 5 seconds for dApp wallet...')
        setTimeout(() => setShouldSaveReferrer(true), 5000)
      }
    }
  }, [account, getReferrer, isReferrerSaved, shouldSaveReferrer, setIsReferrerSaved, walletInfo, testLocalStorage])

  // Effect để gọi saveReferrer khi cần thiết
  useEffect(() => {
    // Sử dụng requestIdleCallback để thực hiện trong thời gian rảnh của trình duyệt
    if (shouldSaveReferrer && account?.address) {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      const id = idleCallback(() => {
        saveReferrer();
      });
      
      return () => {
        const cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
        cancelIdleCallback(id);
      };
    }
  }, [shouldSaveReferrer, account, saveReferrer])

  return null
}