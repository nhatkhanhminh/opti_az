# Lucky Wheel Smart Contract 🎰

## Tổng quan

Lucky Wheel là một game quay thưởng on-chain với các tính năng:
- 8 segments với tỷ lệ thắng khác nhau (x0 đến x10)
- Hệ thống referral tự động (F1: 5%, F2: 1%, F3: 1%)
- Token burn mechanism (3% mỗi lần cược)
- Pool reward system
- Admin controls

## Wheel Segments

| Multiplier | Probability | Color | Reward |
|------------|-------------|-------|---------|
| x10        | 0.5%        | Gold  | Jackpot |
| x5         | 2%          | Purple| Big Win |
| x3         | 5%          | Blue  | Good Win|
| x2         | 10%         | Green | Win     |
| x1.5       | 15%         | Orange| Small Win|
| x1         | 20%         | Gray  | Return  |
| x0.5       | 25%         | Light Red| Loss |
| x0         | 22.5%       | Red   | Total Loss|

## Contract Architecture

### Core Functions

```solidity
// Main game functions
function spin(uint256 betAmount, string memory txHash) external returns (uint256 spinId)
function claimReward(uint256 spinId, string memory claimTxHash) external

// View functions
function getGameStats() external view returns (uint256, uint256, uint256, uint256, uint256)
function getWheelSegments() external view returns (WheelSegment[8] memory)
function getUserSpins(address user) external view returns (uint256[] memory)
```

### Dependencies

- **MemberContract**: Để lấy uplines cho referral system
- **AZC Token**: Token chính của game (ERC20 với burn function)

## Deployment

### 1. Prerequisites

```bash
npm install --save-dev hardhat @openzeppelin/contracts
```

### 2. Deploy Contract

```bash
# Deploy to testnet
npx hardhat run contract/deploy_luckywheel.js --network bsc_testnet

# Deploy to mainnet
npx hardhat run contract/deploy_luckywheel.js --network bsc_mainnet
```

### 3. Update Frontend

Sau khi deploy, cập nhật địa chỉ contract:

```typescript
// Context/listaddress.ts
export const LUCKY_WHEEL = "0x..."; // Địa chỉ contract vừa deploy
```

### 4. Fund Pool

```bash
# Fund 10,000 AZC vào pool
node -e "
const { fundPool } = require('./contract/deploy_luckywheel.js');
fundPool('0x...', '10000');
"
```

## Configuration

### Game Settings

```solidity
GameConfig {
    minBet: 1 AZC
    maxBet: 10,000 AZC  
    burnRate: 3% (300 basis points)
    gameActive: true
}
```

### Referral Rates

- F1 (Direct): 5%
- F2 (Level 2): 1% 
- F3 (Level 3): 1%

## Admin Functions

### Game Management

```solidity
// Pause/Resume game
function pauseGame() external onlyRole(OPERATOR_ROLE)
function resumeGame() external onlyRole(DEFAULT_ADMIN_ROLE)

// Update game config
function updateGameConfig(uint256 minBet, uint256 maxBet, uint256 burnRate, bool gameActive)

// Update wheel segments
function updateWheelSegment(uint256 index, uint256 multiplier, uint256 probability, bool active)
```

### Pool Management

```solidity
// Add funds to pool
function fundPool(uint256 amount) external onlyRole(EDITOR_ROLE)

// Withdraw from pool
function withdrawPool(uint256 amount, address to) external onlyRole(DEFAULT_ADMIN_ROLE)
```

## Security Features

1. **ReentrancyGuard**: Bảo vệ khỏi re-entrancy attacks
2. **AccessControl**: Role-based permissions
3. **Input Validation**: Kiểm tra các tham số đầu vào
4. **Safe Math**: Sử dụng Solidity 0.8+ built-in overflow protection

## Events

```solidity
event SpinCompleted(uint256 indexed spinId, address indexed user, uint256 betAmount, 
                   uint256 segmentIndex, uint256 multiplier, uint256 rewardAmount, uint256 timestamp)

event RewardClaimed(uint256 indexed spinId, address indexed user, uint256 amount, string txHash)

event ReferralReward(address indexed user, address indexed referrer, uint256 amount, uint256 level)

event TokensBurned(uint256 amount, uint256 totalBurned)
```

## Testing

### Test Spin

```bash
node -e "
const { testSpin } = require('./contract/deploy_luckywheel.js');
testSpin('0x...', '10'); // Test với 10 AZC
"
```

### Frontend Integration

1. Kết nối wallet
2. Approve AZC tokens 
3. Call spin function
4. Parse events để lấy kết quả
5. Call claimReward nếu thắng

## Gas Optimization

- Sử dụng events thay vì storage cho lịch sử
- Batch operations khi có thể
- Optimize struct packing
- Lazy loading cho user data

## Troubleshooting

### Common Issues

1. **"Transfer failed"**: Kiểm tra AZC balance và allowance
2. **"Game is not active"**: Admin đã pause game
3. **"Insufficient pool balance"**: Pool cần được fund thêm
4. **"Segment not active"**: Admin đã disable segment đó

### Debug Commands

```bash
# Check game config
npx hardhat console --network bsc_mainnet
> const lw = await ethers.getContractAt("LuckyWheel", "0x...")
> await lw.gameConfig()

# Check pool balance  
> await lw.getGameStats()

# Check user spins
> await lw.getUserSpins("0x...")
```

## Upgrade Path

Contract hiện tại không upgradeable. Để upgrade:

1. Deploy contract mới
2. Pause contract cũ
3. Migrate data nếu cần
4. Update frontend addresses
5. Announce migration cho users

## License

MIT License

## Support

Để được hỗ trợ:
1. Check events và logs trên BSCScan
2. Verify contract configuration
3. Test trên testnet trước
4. Contact dev team nếu cần thiết 