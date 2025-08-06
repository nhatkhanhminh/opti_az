# AZC Claim Contract

Contract cho phép claim lãi và gốc từ AZC staking với tỉ lệ 50% AZC + 50% USDT, loại bỏ maxout và có hệ thống claim gốc theo timeline.

## 🌟 Tính năng chính

### 🔄 Claim Lãi (Interest)
- **Tỉ lệ trả lãi**: 50% AZC + 50% USDT
- **Claim hàng ngày**: Có thể claim bất kỳ lúc nào (tối thiểu 24h giữa các lần claim)
- **Thời gian trả lãi**: Chỉ trong suốt thời gian plan (3/6/12 tháng)
- **Không có maxout**: Loại bỏ giới hạn 400% maxout

### 🏦 Claim Gốc (Principal)
- **Timeline cố định**: Claim gốc sau khi hết thời gian plan
- **3 phases**: 30% - 30% - 40%
- **Khoảng cách**: Mỗi phase cách nhau 1 tháng
- **Token gốc**: Trả lại 100% AZC token

### 💰 Hệ thống Referral
- **10 cấp upline**: Từ 20% đến 1%
- **Level rewards**: 5 level với % khác nhau
- **Phân phối**: 50% AZC + 50% USDT cho tất cả rewards

## 📋 Cấu trúc Contract

### Contract chính
- `AZCClaimContract.sol` - Contract chính cho claim
- Kế thừa từ `Ownable` và `ReentrancyGuard`
- Chỉ hỗ trợ AZC token

### Interfaces
- `IAZCDataContract` - Interface cho data contract
- `IMemberContract` - Interface cho member contract  
- `IAZCStakingContract` - Interface cho staking contract

## 🚀 Deployment

### 1. Chuẩn bị
```bash
# Cài đặt dependencies
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Cập nhật addresses trong deploy script
# Edit: contract/deploy_azc_claim.js
```

### 2. Deploy Contract
```bash
# Deploy trên BSC Testnet
npx hardhat run contract/deploy_azc_claim.js --network bscTestnet

# Deploy trên BSC Mainnet  
npx hardhat run contract/deploy_azc_claim.js --network bscMainnet
```

### 3. Cấu hình sau deploy
```bash
# Sử dụng admin panel
npx hardhat run contract/azc_claim_admin.js --network bscMainnet
```

## ⚙️ Cấu hình Contract

### Addresses cần thiết
```javascript
const CONTRACT_ADDRESSES = {
    DATA_CONTRACT: "0xC2482a36E3d219E6358D2397D67310059f024cfC",
    MEMBER_CONTRACT: "0xBbaA0fB84386d80465994FaEA9d4e954CB45bC8d",
    AZC_STAKING_CONTRACT: "0x...", // Địa chỉ AZC Staking contract
    AZC_TOKEN: "0x...", // Địa chỉ AZC token
    USDT_TOKEN: "0x55d398326f99059fF775485246999027B3197955"
}
```

### Thiết lập giá AZC
```solidity
// Mặc định: 2.0 USDT
function setAZCPrice(uint256 _newPrice) external onlyOwner
```

### Cấu hình token distribution
```solidity
// Mặc định: 50% AZC + 50% USDT
function updateTokenDistribution(uint256 _azcTokenPercent, uint256 _usdtTokenPercent) external onlyOwner
```

## 📊 Cách hoạt động

### Timeline ví dụ - Plan 3 tháng:

```
Tháng 1-3: Claim lãi hàng ngày (50% AZC + 50% USDT)
Tháng 4: Claim 30% gốc (AZC)
Tháng 5: Claim 30% gốc (AZC)  
Tháng 6: Claim 40% gốc (AZC)
```

### Timeline ví dụ - Plan 6 tháng:

```
Tháng 1-6: Claim lãi hàng ngày (50% AZC + 50% USDT)
Tháng 7: Claim 30% gốc (AZC)
Tháng 8: Claim 30% gốc (AZC)
Tháng 9: Claim 40% gốc (AZC)
```

### Timeline ví dụ - Plan 12 tháng:

```
Tháng 1-12: Claim lãi hàng ngày (50% AZC + 50% USDT)
Tháng 13: Claim 30% gốc (AZC)
Tháng 14: Claim 30% gốc (AZC)
Tháng 15: Claim 40% gốc (AZC)
```

## 🎯 Functions chính

### User Functions

#### Claim lãi
```solidity
function claimInterest(uint256 stakeId) external nonReentrant
```
- Claim lãi hàng ngày
- Kiểm tra thời gian (>=24h)
- Phân phối 50% AZC + 50% USDT
- Tự động dừng sau khi hết plan duration

#### Claim gốc
```solidity
function claimPrincipal(uint256 stakeId) external nonReentrant
```
- Claim gốc theo phases
- Chỉ có thể claim khi đúng thời gian
- Trả lại AZC token theo tỉ lệ

### View Functions

#### Kiểm tra lãi có thể claim
```solidity
function getClaimableInterest(uint256 stakeId) external view returns (
    uint256 azcAmount, 
    uint256 usdtAmount, 
    bool canClaim
)
```

#### Kiểm tra gốc có thể claim
```solidity
function getClaimablePrincipal(uint256 stakeId) external view returns (
    uint256 azcAmount,
    uint256 phase,
    bool canClaim,
    uint256 timeUntilClaim
)
```

#### Xem timeline stake
```solidity
function getStakeTimeline(uint256 stakeId) external view returns (
    uint256 startTime,
    uint256 interestEndTime,
    uint256 principalPhase1Time,
    uint256 principalPhase2Time,
    uint256 principalPhase3Time,
    uint256 planDuration
)
```

### Admin Functions

#### Quản lý giá
```solidity
function setAZCPrice(uint256 _newPrice) external onlyOwner
```

#### Cập nhật plan durations
```solidity
function updatePlanDuration(uint256 planId, uint256 durationInMonths) external onlyOwner
```

#### Cập nhật tỉ lệ claim gốc
```solidity
function updatePrincipalClaimPercents(uint256[3] calldata _percents) external onlyOwner
```

## 🛠️ Admin Panel

### Chạy admin panel
```bash
# Cập nhật contract address trong file
# Edit: AZC_CLAIM_CONTRACT_ADDRESS trong azc_claim_admin.js

# Chạy admin panel
npx hardhat run contract/azc_claim_admin.js --network bscMainnet
```

### Menu options:
1. **📊 View Contract Status** - Xem trạng thái contract
2. **💰 Set AZC Price** - Thiết lập giá AZC
3. **📈 Update Token Distribution** - Cập nhật tỉ lệ token
4. **📅 Update Plan Durations** - Cập nhật thời gian plans
5. **📊 Update Principal Claim Percentages** - Cập nhật tỉ lệ claim gốc
6. **🎯 Update Upline Reward Percentages** - Cập nhật % upline rewards
7. **🏆 Update Level Requirements** - Cập nhật yêu cầu levels
8. **🔧 Update Contract Addresses** - Cập nhật địa chỉ contracts
9. **📊 View Claim Information** - Xem thông tin claim
10. **💳 Fund Contract with Tokens** - Nạp token vào contract
11. **🚨 Emergency Withdraw** - Rút token khẩn cấp
12. **📋 View Timeline for Stake** - Xem timeline stake

## 💰 Funding Contract

Contract cần được nạp đủ AZC và USDT tokens để trả rewards:

```javascript
// Ví dụ funding
const fundingRequirement = {
    AZC: "1000000", // 1M AZC tokens
    USDT: "500000"  // 500K USDT
}
```

### Cách fund:
1. Sử dụng admin panel (option 10)
2. Transfer tokens trực tiếp vào contract address
3. Sử dụng helper function trong deploy script

## ⚠️ Lưu ý quan trọng

### Security
- Contract sử dụng `ReentrancyGuard` để tránh reentrancy attacks
- Chỉ owner có thể thay đổi cài đặt
- Emergency withdraw cho trường hợp khẩn cấp

### Gas Optimization
- Sử dụng `immutable` cho AZC token address
- Cấu trúc dữ liệu tối ưu
- Batch operations khi có thể

### Compatibility
- Tương thích với existing data contract
- Interface với member và staking contracts
- Support multiple plans

## 🔍 Testing

### Test cases cần kiểm tra:
1. **Interest claiming**
   - Claim lãi đúng thời gian
   - Claim lãi đúng amount
   - Phân phối đúng tỉ lệ 50/50

2. **Principal claiming**
   - Claim gốc đúng timeline
   - Claim đúng phases (30%, 30%, 40%)
   - Không thể claim trước thời gian

3. **Referral rewards**
   - Phân phối đúng cho uplines
   - Level rewards hoạt động đúng
   - Tỉ lệ 50% AZC + 50% USDT

4. **Admin functions**
   - Cập nhật giá AZC
   - Thay đổi plan durations
   - Emergency withdraw

## 📞 Support

### Các vấn đề thường gặp:

1. **"Interest period ended"**
   - Đã hết thời gian claim lãi
   - Chỉ có thể claim gốc

2. **"Principal claim not available yet"**
   - Chưa đến thời gian claim gốc
   - Kiểm tra timeline

3. **"Only AZC stakes supported"**
   - Contract chỉ hỗ trợ AZC token
   - Kiểm tra token address

### Liên hệ:
- **Email**: support@azcoin.io
- **Telegram**: @azcoin_support
- **Discord**: https://discord.gg/azcoin

---

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🔄 Updates

- **v1.0.0**: Initial release với đầy đủ tính năng
- Cập nhật theo yêu cầu và feedback từ community 