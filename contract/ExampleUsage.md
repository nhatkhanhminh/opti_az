# Hướng dẫn sử dụng hệ thống Reward Token

## Tổng quan

Hệ thống mới cho phép admin tự định nghĩa token thưởng và giá của chúng thay vì sử dụng Chainlink price feed. Khi user claim, họ sẽ nhận được:
- 70% reward bằng token mà admin đã set
- 30% reward bằng AZC token

## Các function chính

### 1. Thiết lập reward token cho staking token

```solidity
// Ví dụ: User stake FIL token nhưng nhận thưởng bằng USDT
function setRewardToken(
    address stakingToken,  // 0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153 (FIL)
    address rewardToken,   // 0x55d398326f99059fF775485246999027B3197955 (USDT)
    uint256 price         // 1000000000000000000 (1 USDT = 1 USD with 18 decimals)
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

### 2. Cập nhật giá reward token

```solidity
function updateRewardTokenPrice(
    address stakingToken, // FIL token address
    uint256 price        // Giá mới (ví dụ: 1.5 USD = 1500000000000000000)
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

### 3. Kích hoạt/vô hiệu hóa reward token

```solidity
function setRewardTokenActive(
    address stakingToken, // FIL token address  
    bool active          // true để kích hoạt, false để vô hiệu hóa
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

### 4. Kiểm tra thông tin reward token

```solidity
function getRewardTokenInfo(address stakingToken) external view returns (
    address rewardToken,
    uint256 price,
    bool active
)

// Ví dụ gọi:
// getRewardTokenInfo(0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153)
// Returns: (0x55d398326f99059fF775485246999027B3197955, 1000000000000000000, true)
```

### 5. Tính toán số lượng reward

```solidity
function calculateRewardAmounts(
    address stakingToken, 
    uint256 usdtAmount
) external view returns (
    address rewardTokenAddress,
    uint256 rewardTokenAmount,
    uint256 azcAmount,
    uint256 rewardTokenUsdValue,
    uint256 azcUsdValue
)
```

## Ví dụ thực tế

### Thiết lập ban đầu

```javascript
// Thiết lập FIL token để trả thưởng bằng USDT
await claimContract.setRewardToken(
    "0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153", // FIL address
    "0x55d398326f99059fF775485246999027B3197955", // USDT address  
    "1000000000000000000" // 1 USDT = 1 USD
);

// Thiết lập BTC token để trả thưởng bằng custom token
await claimContract.setRewardToken(
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTC address
    "0x1234567890123456789012345678901234567890", // Custom token address
    "500000000000000000" // 0.5 USD per custom token
);
```

### Khi user claim

```javascript
// User đã stake 100 USD worth của FIL
// Khi claim, user sẽ nhận được:
// - 70% reward (ví dụ 7 USD) = 7 USDT
// - 30% reward (ví dụ 3 USD) = 150 AZC (nếu 1 AZC = 0.02 USD)

await claimContract.claimStake(stakeId);
```

### Cập nhật giá

```javascript
// Cập nhật giá custom token lên 0.6 USD
await claimContract.updateRewardTokenPrice(
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    "600000000000000000" // 0.6 USD
);
```

## Lưu ý quan trọng

1. **Deposit token trước**: Contract cần có đủ reward token và AZC để trả thưởng
2. **Kiểm tra balance**: Luôn kiểm tra balance của contract trước khi user claim
3. **Gas refund**: Hệ thống gas refund vẫn sử dụng BNB price feed từ Chainlink
4. **Backup plan**: Nên có emergency withdrawal function cho admin

## Events được emit

```solidity
event RewardTokenSet(address indexed stakingToken, address indexed rewardToken, uint256 price);
event TokensDistributed(address indexed user, address indexed token, uint256 amount, string tokenType);
``` 