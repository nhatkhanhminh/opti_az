// app/api/referral/save.ts
import { connectDB } from '@/lib/db/connect';
import {User} from '@/lib/db/models/User';
import { NextResponse } from 'next/server'
// import { isAddress } from "thirdweb"

export async function POST(req: Request) {
  try {
    await connectDB()
    
    const { walletAddress, referrer, metadata } = await req.json()

    // Log metadata để debug dApp wallet issues với thông tin mở rộng
    if (metadata) {
      console.log('📱 Referral request metadata:', {
        walletAddress: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        referrer: referrer.slice(0, 6) + '...' + referrer.slice(-4),
        isDAppWallet: metadata.isDAppWallet,
        hasLocalStorage: metadata.hasLocalStorage,
        walletType: metadata.walletType || 'unknown',
        walletId: metadata.walletId || 'unknown',
        walletName: metadata.walletName || 'unknown',
        userAgent: metadata.userAgent
      })
    }

    // Kiểm tra nếu walletAddress bằng referrer thì không lưu referrer
    if (walletAddress.toLowerCase() === referrer.toLowerCase()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet address cannot be the same as referrer' 
      }, { status: 422 });
    }

    // Kiểm tra địa chỉ ví có hợp lệ (chỉ chấp nhận địa chỉ thường, không chấp nhận ENS)
    // if (!isAddress(walletAddress) || !isAddress(referrer)) {
    //   return NextResponse.json({ 
    //     success: false, 
    //     error: 'Invalid address' 
    //   }, { status: 422 })
    // }

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ address: walletAddress.toLowerCase() })
    
    // Nếu user đã có referrer thì không cập nhật nữa
    if (existingUser?.referrer && 
        existingUser.referrer !== '0x0000000000000000000000000000000000000000') {
      console.log('ℹ️ User already has referrer:', {
        user: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        existingReferrer: existingUser.referrer.slice(0, 6) + '...' + existingUser.referrer.slice(-4),
        isDAppWallet: metadata?.isDAppWallet || false,
        walletType: metadata?.walletType || 'unknown'
      })
      return NextResponse.json({ 
        success: true, 
        user: existingUser 
      })
    }

    // Tạo mới hoặc cập nhật user
    const updatedUser = await User.findOneAndUpdate(
      { address: walletAddress.toLowerCase() },
      { 
        $set: { 
          referrer,
          // Thêm metadata cho debugging (optional)
          ...(metadata && {
            lastReferralSource: metadata.isDAppWallet ? 'dapp' : 'web',
            lastReferralTime: new Date(),
            lastWalletType: metadata.walletType || 'unknown',
            lastWalletId: metadata.walletId || 'unknown'
          })
        },
        $setOnInsert: { 
          createdAt: new Date(),
          totalStaked: 0,
          totalEarned: 0,
          isActive: true
        }
      },
      { 
        new: true,
        upsert: true 
      }
    )

    console.log('✅ Referral saved successfully:', {
      user: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      referrer: referrer.slice(0, 6) + '...' + referrer.slice(-4),
      isDAppWallet: metadata?.isDAppWallet || false,
      walletType: metadata?.walletType || 'unknown',
      walletName: metadata?.walletName || 'unknown',
      isNewUser: !existingUser
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })

  } catch (error) {
    console.error('❌ Error saving referral:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error' 
    }, { status: 422 })
  }
}