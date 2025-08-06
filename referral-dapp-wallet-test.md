# 🧪 Test DApp Wallet Referral System

## 📋 Preparation

### 1. Deploy Code
```bash
# Deploy updated code với:
# - 7 ngày expiration
# - DApp wallet detection
# - Memory fallback
# - Enhanced logging
```

### 2. Test Setup
```bash
# Console logs để theo dõi:
# - Environment detection
# - Storage mechanisms
# - Save/retry attempts
# - Error handling
```

## 🔧 Test Instructions

### Test 1: Normal Browser (Baseline)
```bash
# 1. Truy cập trong Chrome: https://optifund.app/?ref=0x123...
# 2. Mở Developer Tools → Console
# 3. Xem logs:
#    🔍 Environment Check: {isDAppWallet: false, hasLocalStorage: true}
#    🔗 Referrer from URL: 0x123...
#    📱 DApp wallet: false | localStorage: true
# 4. Connect wallet
# 5. Xem logs:
#    📱 Referral request metadata: {isDAppWallet: false, hasLocalStorage: true}
#    ✅ Referral saved successfully
```

### Test 2: MetaMask Mobile (DApp Wallet)
```bash
# 1. Mở MetaMask Mobile
# 2. Browse to: https://optifund.app/?ref=0x123...
# 3. Mở Browser Console (if available)
# 4. Xem logs:
#    🔍 Environment Check: {isDAppWallet: true, hasLocalStorage: ?}
#    🔗 Referrer from URL: 0x123...
#    📱 DApp wallet: true | localStorage: ?
# 5. Connect wallet
# 6. Xem logs:
#    📱 Referral request metadata: {isDAppWallet: true, ...}
#    ✅ Referral saved successfully
```

### Test 3: Trust Wallet (DApp Wallet)
```bash
# 1. Mở Trust Wallet
# 2. Browse to: https://optifund.app/?ref=0x123...
# 3. Kiểm tra referrer hoạt động
# 4. Connect wallet
# 5. Verify referral saved
```

### Test 4: Cross-Domain trong DApp Wallet
```bash
# 1. Mở DApp wallet
# 2. Browse to: https://optifund.app/?ref=0x123...
# 3. Xem logs storage mechanism
# 4. Navigate to: https://optifund.app (không có ?ref)
# 5. Xem logs:
#    💾 Referrer from storage: 0x123...
#    📱 DApp wallet: true | localStorage: ?
# 6. Connect wallet
# 7. Verify referral vẫn hoạt động
```

### Test 5: localStorage Blocked
```bash
# 1. Simulate localStorage blocked (DevTools → Application → Storage)
# 2. Clear localStorage
# 3. Disable localStorage
# 4. Truy cập: https://optifund.app/?ref=0x123...
# 5. Xem logs:
#    ⚠️ localStorage not available, using memory fallback
#    🔗 Referrer from URL: 0x123...
# 6. Connect wallet
# 7. Verify memory fallback hoạt động
```

### Test 6: Retry Mechanism
```bash
# 1. Simulate network issues (DevTools → Network → Offline)
# 2. Truy cập: https://optifund.app/?ref=0x123...
# 3. Connect wallet
# 4. Xem logs:
#    ❌ Error saving referral: NetworkError
#    🔄 Retrying in 5 seconds for dApp wallet...
# 5. Enable network
# 6. Verify retry thành công
```

### Test 7: Expiration (7 ngày)
```bash
# 1. Manually set expired referrer trong localStorage:
localStorage.setItem('wallet-storage', JSON.stringify({
  referrerData: {
    address: '0x123...',
    timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 ngày trước
    expiresAt: Date.now() - (24 * 60 * 60 * 1000) // 1 ngày trước
  }
}))

# 2. Reload page
# 3. Xem logs:
#    🔍 Environment Check: ...
#    (No referrer from storage - đã expired)
# 4. Connect wallet
# 5. Verify không có referrer
```

## 📊 Expected Logs

### Normal Browser
```
🔍 Environment Check: {isDAppWallet: false, hasLocalStorage: true}
🔗 Referrer from URL: 0x123...
📱 DApp wallet: false | localStorage: true
💾 Saving referrer to DB: 0x123...
📱 Environment: {isDApp: false, hasLocalStorage: true}
📱 Referral request metadata: {isDAppWallet: false, hasLocalStorage: true}
✅ Referral saved successfully
```

### DApp Wallet (localStorage OK)
```
🔍 Environment Check: {isDAppWallet: true, hasLocalStorage: true}
🔗 Referrer from URL: 0x123...
📱 DApp wallet: true | localStorage: true
💾 Saving referrer to DB: 0x123...
📱 Environment: {isDApp: true, hasLocalStorage: true}
📱 Referral request metadata: {isDAppWallet: true, hasLocalStorage: true}
✅ Referral saved successfully
```

### DApp Wallet (localStorage Blocked)
```
🔍 Environment Check: {isDAppWallet: true, hasLocalStorage: false}
⚠️ DApp wallet detected with localStorage issues - using memory fallback
⚠️ localStorage not available, using memory fallback
🔗 Referrer from URL: 0x123...
📱 DApp wallet: true | localStorage: false
💾 Saving referrer to DB: 0x123...
📱 Environment: {isDApp: true, hasLocalStorage: false}
📱 Referral request metadata: {isDAppWallet: true, hasLocalStorage: false}
✅ Referral saved successfully
```

### Cross-Domain
```
🔍 Environment Check: {isDAppWallet: true, hasLocalStorage: true}
💾 Referrer from storage: 0x123...
📱 DApp wallet: true | localStorage: true
💾 Saving referrer to DB: 0x123...
✅ Referral saved successfully
```

### With Retry
```
💾 Saving referrer to DB: 0x123...
❌ Error saving referral: NetworkError
🔄 Retrying in 5 seconds for dApp wallet...
💾 Saving referrer to DB: 0x123...
✅ Referral saved successfully
```

## 🎯 Success Criteria

1. **✅ Normal Browser**: Referral hoạt động bình thường
2. **✅ DApp Wallet**: Referral hoạt động trong mọi dApp wallet
3. **✅ localStorage Blocked**: Memory fallback hoạt động
4. **✅ Cross-Domain**: Referral persist giữa domain
5. **✅ Retry Mechanism**: Tự động retry khi lỗi network
6. **✅ Expiration**: Referrer tự động xóa sau 7 ngày
7. **✅ Logging**: Detailed logs cho debugging

## 🚀 Production Deployment

### Checklist
- [ ] Code deployed
- [ ] Test trên 3+ dApp wallet
- [ ] Test cross-domain
- [ ] Test expiration
- [ ] Monitor logs
- [ ] Verify database saves

### Monitoring
```bash
# Monitor server logs cho:
# - 📱 Referral request metadata
# - ✅ Referral saved successfully
# - ❌ Error saving referral
# - 🔄 Retrying attempts
```

---

*Test này đảm bảo referral system hoạt động với mọi dApp wallet!* 