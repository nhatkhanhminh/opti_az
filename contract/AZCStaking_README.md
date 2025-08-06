# AZC Staking Contract

## Mô tả
Contract AZCStaking được thiết kế đặc biệt cho việc staking AZC token với giá cố định có thể điều chỉnh bởi owner. Đây là contract độc lập dành riêng cho AZC token, khác với contract staking chính hỗ trợ nhiều loại token.

## Tính năng chính

### 🎯 Core Features
- **Staking AZC Token**: Chỉ hỗ trợ staking AZC token
- **Giá cố định**: Giá AZC được set thủ công, mặc định 1.5 USDT
- **5 Staking Plans**: Từ $99 đến $50,000+ với ROI khác nhau
- **Fee Distribution**: Phân phối fee cho các wallet và referral system
- **Leader Share**: Hỗ trợ phân phối leader fee theo branch

### 💰 Staking Plans
**Không có plans mặc định** - Admin sẽ tạo plans sau khi deploy contract.

**Ví dụ plans thường dùng:**
| Plan | Minimum | Maximum | Monthly ROI |
|------|---------|---------|-------------|
| 0    | $99     | ∞       | 10%         |
| 1    | $99     | ∞       | 12%         |
| 2    | $99     | ∞       | 16%         |

**Ghi chú**: 
- Minimum amount và % lãi có thể được admin điều chỉnh bất kỳ lúc nào
- Maximum amount mặc định là không giới hạn
- Admin có thể tạo bao nhiêu plans tùy ý

### 💸 Fee Structure (%)
- **Dev Fee**: 2%
- **Marketing Fee**: 15%
- **Multi Wallet Fee**: 37%
- **Leader Fee**: 33%
- **Referral L1**: 6%
- **Referral L2**: 1%
- **Referral L3**: 1%

## Deployment

### 1. Chuẩn bị
```bash
# Cài đặt dependencies
npm install

# Copy file và cập nhật địa chỉ AZC token
cp contract/deploy_azc_staking.js .
```

### 2. Cập nhật địa chỉ AZC Token
Sửa file `deploy_azc_staking.js`:
```javascript
const AZC_TOKEN_ADDRESS = "0xYOUR_AZC_TOKEN_ADDRESS_HERE";
```

### 3. Deploy Contract
```bash
# Deploy trên BSC Testnet
npx hardhat run deploy_azc_staking.js --network bsc-testnet

# Deploy trên BSC Mainnet
npx hardhat run deploy_azc_staking.js --network bsc
```

### 4. Verify Contract
```bash
npx hardhat verify --network bsc CONTRACT_ADDRESS AZC_TOKEN_ADDRESS
```

## Sử dụng Contract

### Staking AZC
```solidity
// Approve AZC token trước
IERC20(AZC_TOKEN).approve(AZC_STAKING_CONTRACT, amount);

// Stake với plan ID
AZCStaking.stakeAZC(amount, planId);
```

### Set giá AZC (Owner only)
```solidity
// Set giá 2.0 USDT
uint256 newPrice = 2 * 10**18; // 2.0 USDT
azcStaking.setAZCPrice(newPrice);
```

### Lấy giá AZC hiện tại
```solidity
uint256 currentPrice = azcStaking.getAZCPrice();
// Result: 1500000000000000000 (1.5 USDT)
```

### Tính giá trị USDT của AZC
```solidity
uint256 azcAmount = 100 * 10**18; // 100 AZC
uint256 usdtValue = azcStaking.getAZCToUSDTValue(azcAmount);
// Result: 150 * 10**18 (150 USDT nếu giá 1.5 USDT/AZC)
```

## Admin Functions

### Quản lý Staking Plans
```solidity
// Tạo plan mới đơn lẻ
azcStaking.createStakingPlan(
    100 * 10**18,   // Min: $100
    type(uint256).max, // Max: Không giới hạn
    120             // ROI: 12% monthly
);

// Tạo nhiều plans cùng lúc
uint256[] memory minAmounts = [99*10**18, 99*10**18, 99*10**18];
uint256[] memory maxAmounts = [type(uint256).max, type(uint256).max, type(uint256).max];
uint256[] memory monthlyROIs = [100, 120, 160]; // 10%, 12%, 16%
azcStaking.createMultipleStakingPlans(minAmounts, maxAmounts, monthlyROIs);

// Cập nhật plan hoàn chỉnh
azcStaking.updateStakingPlan(0, 99 * 10**18, type(uint256).max, 100, true);

// Cập nhật chỉ % lãi của plan
azcStaking.updatePlanROI(0, 150); // Đổi plan 0 thành 15%

// Cập nhật chỉ min amount của plan
azcStaking.updatePlanMinAmount(0, 50 * 10**18); // Set min $50 cho plan 0

// Cập nhật minimum amount cho tất cả plans cùng lúc
azcStaking.updateAllPlansMinAmount(50 * 10**18); // Set min $50 cho tất cả

// Kích hoạt/vô hiệu hóa plan
azcStaking.toggleStakingPlan(1, false); // Tắt plan 1
azcStaking.toggleStakingPlan(1, true);  // Bật plan 1
```

### View Functions
```solidity
// Xem tất cả staking plans
StakingPlan[] memory plans = azcStaking.getAllStakingPlans();

// Đếm số lượng plans
uint256 count = azcStaking.getStakingPlansCount();

// Kiểm tra plan có active không
bool isActive = azcStaking.isPlanActive(0);
```

### Cập nhật Fees
```solidity
azcStaking.updateFeePercentages(
    2,  // dev
    15, // marketing
    37, // multiWallet
    33, // leader
    6,  // referral L1
    1,  // referral L2
    1   // referral L3
);
```

### Cập nhật Wallets
```solidity
azcStaking.setWallets(
    devWallet,
    marketingWallet,
    multiWallet,
    poolWallet
);
```

### Cập nhật Contract Addresses
```solidity
azcStaking.setMemberContract(newMemberContract);
azcStaking.setDataContract(newDataContract);
azcStaking.setLeaderShareContract(newLeaderShareContract);
```

## Events

### Staking Events
```solidity
event AZCStaked(
    address indexed user,
    uint256 amount,
    uint256 usdtValue,
    uint256 planId
);

event AZCPriceUpdated(
    uint256 oldPrice,
    uint256 newPrice
);
```

### Admin Events
```solidity
event StakingPlanCreated(
    uint256 indexed planId,
    uint256 minAmount,
    uint256 maxAmount,
    uint256 monthlyROI
);

event StakingPlanUpdated(
    uint256 indexed planId,
    uint256 minAmount,
    uint256 maxAmount,
    uint256 monthlyROI,
    bool active
);
```

## Integration với Frontend

### 1. Cập nhật Context
Thêm vào `Context/listaddress.ts`:
```typescript
export const AZC_STAKING = "0xYOUR_AZC_STAKING_CONTRACT_ADDRESS";
export const AZC_TOKEN = "0xYOUR_AZC_TOKEN_ADDRESS";
```

### 2. Cập nhật Token Context
Sửa `Context/token.ts`:
```typescript
{
  id: "azc",
  name: "AZ Coin",
  symbol: "AZC",
  icon: "/images/tokens/azc.svg",
  tokenAddress: AZC_TOKEN,
  comingSoon: false, // Bỏ comingSoon
}
```

### 3. Contract Hook
Tạo hook mới:
```typescript
// hooks/useAZCStaking.ts
export const useAZCStakingContract = () => {
  return getContract({
    client,
    chain: bsc,
    address: AZC_STAKING,
  });
};
```

### 4. Cập nhật Staking Page
Sửa `app/[locale]/staking/page.tsx` để support AZC:
```typescript
// Thêm logic cho AZC staking
const isAZC = useMemo(() => token?.symbol === "AZC", [token]);

if (isAZC) {
  // Sử dụng AZC staking contract thay vì contract chính
  const azcStakingContract = useAZCStakingContract();
  
  // Get AZC staking plans riêng
  const getAZCStakingPlans = async () => {
    return await azcStakingContract.getAllStakingPlans();
  };
  
  // Check AZC price
  const getAZCPrice = async () => {
    return await azcStakingContract.getAZCPrice();
  };
  
  // Stake AZC
  const stakeAZC = prepareContractCall({
    contract: azcStakingContract,
    method: "function stakeAZC(uint256 amount, uint256 planId)",
    params: [amountInWei, BigInt(planIndex)],
  });
}
```

## Ví dụ Sử dụng

### Script Helper để set giá
```javascript
const { setAZCPrice } = require('./deploy_azc_staking');

// Set giá AZC thành 2.5 USDT
await setAZCPrice("0xCONTRACT_ADDRESS", 2.5);
```

### Script Helper để quản lý plans
```javascript
const { 
  setupDefaultPlans,      // Tạo nhanh 3 plans: 10%, 12%, 16%
  createStakingPlan,      // Tạo plan đơn lẻ
  createMultipleStakingPlans, // Tạo nhiều plans cùng lúc
  updatePlanROI,          // Cập nhật % lãi riêng lẻ
  updatePlanMinAmount,    // Cập nhật min amount riêng lẻ
  updateAllPlansMinAmount, // Cập nhật min amount tất cả
  toggleStakingPlan,      // Bật/tắt plan
  viewAllPlans            // Xem tất cả plans
} = require('./deploy_azc_staking');

// CÁCH 1: Setup nhanh 3 plans mặc định (KHUYẾN NGHỊ)
await setupDefaultPlans("0xCONTRACT_ADDRESS", 99); // 3 plans với min $99

// CÁCH 2: Tạo plans thủ công
// Tạo plan đơn lẻ
await createStakingPlan("0xCONTRACT_ADDRESS", 50, Infinity, 8.0);

// Tạo nhiều plans cùng lúc
const plansData = [
  { minAmount: 100, maxAmount: Infinity, monthlyROI: 15 },
  { minAmount: 500, maxAmount: Infinity, monthlyROI: 18 },
  { minAmount: 1000, maxAmount: Infinity, monthlyROI: 20 }
];
await createMultipleStakingPlans("0xCONTRACT_ADDRESS", plansData);

// QUẢN LÝ PLANS
// Cập nhật chỉ % lãi
await updatePlanROI("0xCONTRACT_ADDRESS", 0, 12); // Plan 0 -> 12%

// Cập nhật chỉ min amount một plan
await updatePlanMinAmount("0xCONTRACT_ADDRESS", 1, 200); // Plan 1 -> $200

// Cập nhật min amount tất cả plans
await updateAllPlansMinAmount("0xCONTRACT_ADDRESS", 50); // Tất cả -> $50

// Tắt/bật plan
await toggleStakingPlan("0xCONTRACT_ADDRESS", 2, false); // Tắt plan 2

// Xem tất cả plans
await viewAllPlans("0xCONTRACT_ADDRESS");
```

### Workflow từ A-Z:
```bash
# 1. Deploy contract (chưa có plans nào)
npx hardhat run deploy_azc_staking.js --network bsc

# 2. Set giá AZC nếu khác 1.5 USDT
node -e "
const { setAZCPrice } = require('./deploy_azc_staking');
setAZCPrice('CONTRACT_ADDRESS', 2.0);
"

# 3. TẠO PLANS (chọn 1 trong 2 cách):

# CÁCH A: Setup nhanh 3 plans (10%, 12%, 16%) - KHUYẾN NGHỊ
node -e "
const { setupDefaultPlans } = require('./deploy_azc_staking');
setupDefaultPlans('CONTRACT_ADDRESS', 99);
"

# CÁCH B: Tạo plans tùy chỉnh
node -e "
const { createStakingPlan } = require('./deploy_azc_staking');
createStakingPlan('CONTRACT_ADDRESS', 50, Infinity, 8.0);
createStakingPlan('CONTRACT_ADDRESS', 100, Infinity, 15.0);
"

# 4. Xem và quản lý plans
node -e "
const { viewAllPlans, updatePlanROI } = require('./deploy_azc_staking');
viewAllPlans('CONTRACT_ADDRESS');
updatePlanROI('CONTRACT_ADDRESS', 0, 11); // Đổi plan 0 thành 11%
"

# 5. Dùng Admin Panel cho việc quản lý dễ dàng hơn
# (Cập nhật CONTRACT_ADDRESS trong azc_staking_admin.js trước)
node azc_staking_admin.js
```

### Admin Panel Interface:
```bash
🚀 AZC Staking Admin Panel
📍 Contract: 0x...
👑 Owner: 0x...
🪙 AZC Token: 0x...
💵 AZC Price: 1.5 USDT

==================================================
📋 MENU ADMIN:
1. 👀 Xem tất cả Staking Plans
2. 💰 Set giá AZC
3. 📊 Tạo Staking Plan mới
4. ✏️  Cập nhật Staking Plan hoàn chỉnh
5. 🔄 Toggle Plan Active/Inactive
6. 📈 Cập nhật % lãi (ROI) của Plan
7. 💵 Cập nhật Min Amount của Plan
8. 💵 Cập nhật Min Amount cho tất cả Plans
9. ⚡ Setup Plans mặc định nhanh (10%, 12%, 16%)
10. 🏦 Cập nhật Wallet Addresses
11. 💸 Cập nhật Fee Percentages
12. 🆘 Emergency Withdraw
0. 🚪 Thoát
==================================================
```

## Security Features

### ✅ Implemented
- **ReentrancyGuard**: Chống tấn công reentrancy
- **Ownable**: Kiểm soát quyền admin
- **Input Validation**: Validate tất cả input parameters
- **Emergency Withdraw**: Rút token trong trường hợp khẩn cấp

### ⚠️ Recommendations
- Thực hiện audit code trước khi deploy mainnet
- Test kỹ trên testnet
- Setup multisig wallet cho owner
- Monitor contract activities

## Lưu ý quan trọng

1. **Giá AZC**: Cần được cập nhật thường xuyên vì không có oracle
2. **Dependency**: Contract phụ thuộc vào Member, Data và LeaderShare contracts
3. **Permissions**: Chỉ owner mới có thể thay đổi giá và cấu hình
4. **Gas Optimization**: Contract đã được tối ưu gas cho các thao tác thường xuyên

## Support & Troubleshooting

### Common Issues
1. **"Plan does not exist"**: Kiểm tra planId có hợp lệ
2. **"Amount below plan minimum"**: Tăng amount hoặc chọn plan khác
3. **"Token not approved"**: Approve AZC token trước khi stake

### Contact
- GitHub Issues: [Repository URL]
- Documentation: [Docs URL] 