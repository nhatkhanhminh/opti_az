// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMemberContract {
    function getUplines(address member, uint256 levels) external view returns (address[] memory);
    function updateTeamVolume(address member, uint256 amount) external;
    function updateF1Volume(address member, uint256 amount) external;
}

interface IERC20Burnable {
    function burn(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LuckyWheel is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR");
    
    // Interfaces
    IMemberContract public memberContract;
    IERC20Burnable public azcToken;
    
    // Wheel configuration
    struct WheelSegment {
        uint256 multiplier;      // Multiplier * 100 (1.5x = 150)
        uint256 probability;     // Probability * 100 (22.5% = 2250)
        bool active;
    }
    
    // Spin result structure
    struct SpinResult {
        address user;
        uint256 betAmount;
        uint256 segmentIndex;
        uint256 multiplier;
        uint256 rewardAmount;
        uint256 timestamp;
        bool claimed;
        string txHash;
    }
    
    // Game configuration
    struct GameConfig {
        uint256 minBet;          // Minimum bet amount
        uint256 maxBet;          // Maximum bet amount
        uint256 burnRate;        // Burn rate * 100 (3% = 300)
        bool gameActive;         // Game status
        uint256 poolBalance;     // Pool balance for rewards
    }
    
    // Referral rates (basis points: 500 = 5%)
    uint256 public constant F1_RATE = 500;  // 5%
    uint256 public constant F2_RATE = 100;  // 1%
    uint256 public constant F3_RATE = 100;  // 1%
    
    // State variables
    WheelSegment[8] public wheelSegments;
    GameConfig public gameConfig;
    
    // Mappings
    mapping(uint256 => SpinResult) public spins;
    mapping(address => uint256[]) public userSpins;
    mapping(address => uint256) public userTotalBet;
    mapping(address => uint256) public userTotalWon;
    
    // Counters
    uint256 public spinCounter;
    uint256 public totalSpins;
    uint256 public totalBetAmount;
    uint256 public totalRewards;
    uint256 public totalBurned;
    
    // Events
    event SpinCompleted(
        uint256 indexed spinId,
        address indexed user,
        uint256 betAmount,
        uint256 segmentIndex,
        uint256 multiplier,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event RewardClaimed(
        uint256 indexed spinId,
        address indexed user,
        uint256 amount,
        string txHash
    );
    
    event ReferralReward(
        address indexed user,
        address indexed referrer,
        uint256 amount,
        uint256 level
    );
    
    event TokensBurned(
        uint256 amount,
        uint256 totalBurned
    );
    
    event PoolFunded(
        address indexed funder,
        uint256 amount,
        uint256 newBalance
    );
    
    constructor(
        address _memberContract,
        address _azcToken
    ) {
        memberContract = IMemberContract(_memberContract);
        azcToken = IERC20Burnable(_azcToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);
        
        // Initialize wheel segments
        wheelSegments[0] = WheelSegment(1000, 50, true);    // x10 - 0.5%
        wheelSegments[1] = WheelSegment(0, 2250, true);     // x0 - 22.5%
        wheelSegments[2] = WheelSegment(150, 1500, true);   // x1.5 - 15%
        wheelSegments[3] = WheelSegment(50, 2500, true);    // x0.5 - 25%
        wheelSegments[4] = WheelSegment(200, 1000, true);   // x2 - 10%
        wheelSegments[5] = WheelSegment(100, 2000, true);   // x1 - 20%
        wheelSegments[6] = WheelSegment(300, 500, true);    // x3 - 5%
        wheelSegments[7] = WheelSegment(500, 200, true);    // x5 - 2%
        
        // Initialize game config
        gameConfig = GameConfig({
            minBet: 1 * 10**18,      // 1 AZC
            maxBet: 10000 * 10**18,  // 10,000 AZC
            burnRate: 300,           // 3%
            gameActive: true,
            poolBalance: 0
        });
    }
    
    // Main spin function
    function spin(uint256 betAmount, string memory txHash) external nonReentrant returns (uint256) {
        require(gameConfig.gameActive, "Game is not active");
        require(betAmount >= gameConfig.minBet, "Bet amount too low");
        require(betAmount <= gameConfig.maxBet, "Bet amount too high");
        require(bytes(txHash).length > 0, "Transaction hash required");
        
        // Transfer bet amount from user
        require(azcToken.transferFrom(msg.sender, address(this), betAmount), "Transfer failed");
        
        // Generate random segment index
        uint256 segmentIndex = getRandomSegment(betAmount, block.timestamp);
        WheelSegment memory segment = wheelSegments[segmentIndex];
        require(segment.active, "Segment not active");
        
        // Calculate reward
        uint256 rewardAmount = betAmount * segment.multiplier / 100;
        
        // Create spin record
        uint256 spinId = spinCounter++;
        spins[spinId] = SpinResult({
            user: msg.sender,
            betAmount: betAmount,
            segmentIndex: segmentIndex,
            multiplier: segment.multiplier,
            rewardAmount: rewardAmount,
            timestamp: block.timestamp,
            claimed: false,
            txHash: txHash
        });
        
        userSpins[msg.sender].push(spinId);
        userTotalBet[msg.sender] += betAmount;
        
        // Process burn
        uint256 burnAmount = betAmount * gameConfig.burnRate / 10000;
        if (burnAmount > 0) {
            azcToken.burn(burnAmount);
            totalBurned += burnAmount;
            emit TokensBurned(burnAmount, totalBurned);
        }
        
        // Distribute referral rewards
        _distributeReferralRewards(msg.sender, betAmount);
        
        // Update member contract
        memberContract.updateTeamVolume(msg.sender, betAmount);
        memberContract.updateF1Volume(msg.sender, betAmount);
        
        // Update statistics
        totalSpins++;
        totalBetAmount += betAmount;
        if (rewardAmount > 0) {
            totalRewards += rewardAmount;
        }
        
        emit SpinCompleted(
            spinId,
            msg.sender,
            betAmount,
            segmentIndex,
            segment.multiplier,
            rewardAmount,
            block.timestamp
        );
        
        return spinId;
    }
    
    // Claim reward function
    function claimReward(uint256 spinId, string memory claimTxHash) external nonReentrant {
        SpinResult storage spinResult = spins[spinId];
        require(spinResult.user == msg.sender, "Not your spin");
        require(!spinResult.claimed, "Already claimed");
        require(spinResult.rewardAmount > 0, "No reward to claim");
        require(bytes(claimTxHash).length > 0, "Claim transaction hash required");
        
        uint256 rewardAmount = spinResult.rewardAmount;
        require(azcToken.balanceOf(address(this)) >= rewardAmount, "Insufficient pool balance");
        
        // Mark as claimed
        spinResult.claimed = true;
        userTotalWon[msg.sender] += rewardAmount;
        
        // Transfer reward
        require(azcToken.transfer(msg.sender, rewardAmount), "Reward transfer failed");
        
        emit RewardClaimed(spinId, msg.sender, rewardAmount, claimTxHash);
    }
    
    // Internal function to distribute referral rewards
    function _distributeReferralRewards(address user, uint256 betAmount) internal {
        address[] memory uplines = memberContract.getUplines(user, 3);
        
        uint256[3] memory rates = [F1_RATE, F2_RATE, F3_RATE];
        
        for (uint256 i = 0; i < uplines.length && i < 3; i++) {
            if (uplines[i] != address(0)) {
                uint256 rewardAmount = betAmount * rates[i] / 10000;
                if (rewardAmount > 0 && azcToken.balanceOf(address(this)) >= rewardAmount) {
                    azcToken.transfer(uplines[i], rewardAmount);
                    emit ReferralReward(user, uplines[i], rewardAmount, i + 1);
                }
            }
        }
    }
    
    // Random number generation (simplified - use Chainlink VRF in production)
    function getRandomSegment(uint256 betAmount, uint256 timestamp) internal view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            betAmount,
            timestamp,
            spinCounter
        ))) % 10000;
        
        uint256 cumulative = 0;
        for (uint256 i = 0; i < wheelSegments.length; i++) {
            cumulative += wheelSegments[i].probability;
            if (random < cumulative) {
                return i;
            }
        }
        
        return wheelSegments.length - 1; // Fallback to last segment
    }
    
    // View functions
    function getSpinResult(uint256 spinId) external view returns (SpinResult memory) {
        return spins[spinId];
    }
    
    function getUserSpins(address user) external view returns (uint256[] memory) {
        return userSpins[user];
    }
    
    function getUserSpinsPaginated(address user, uint256 offset, uint256 limit) 
        external view returns (uint256[] memory, uint256) {
        uint256[] memory allSpins = userSpins[user];
        uint256 total = allSpins.length;
        
        if (offset >= total) {
            return (new uint256[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allSpins[total - 1 - i]; // Reverse order (newest first)
        }
        
        return (result, total);
    }
    
    function getGameStats() external view returns (
        uint256 _totalSpins,
        uint256 _totalBetAmount,
        uint256 _totalRewards,
        uint256 _totalBurned,
        uint256 _poolBalance
    ) {
        return (
            totalSpins,
            totalBetAmount,
            totalRewards,
            totalBurned,
            azcToken.balanceOf(address(this))
        );
    }
    
    function getWheelSegments() external view returns (WheelSegment[8] memory) {
        return wheelSegments;
    }
    
    // Admin functions
    function updateGameConfig(
        uint256 minBet,
        uint256 maxBet,
        uint256 burnRate,
        bool gameActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(burnRate <= 1000, "Burn rate too high"); // Max 10%
        
        gameConfig.minBet = minBet;
        gameConfig.maxBet = maxBet;
        gameConfig.burnRate = burnRate;
        gameConfig.gameActive = gameActive;
    }
    
    function updateWheelSegment(
        uint256 index,
        uint256 multiplier,
        uint256 probability,
        bool active
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(index < wheelSegments.length, "Invalid segment index");
        wheelSegments[index] = WheelSegment(multiplier, probability, active);
    }
    
    function fundPool(uint256 amount) external onlyRole(EDITOR_ROLE) {
        require(azcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        gameConfig.poolBalance += amount;
        emit PoolFunded(msg.sender, amount, gameConfig.poolBalance);
    }
    
    function withdrawPool(uint256 amount, address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= azcToken.balanceOf(address(this)), "Insufficient balance");
        require(azcToken.transfer(to, amount), "Transfer failed");
        if (gameConfig.poolBalance >= amount) {
            gameConfig.poolBalance -= amount;
        }
    }
    
    function emergencyWithdraw(address token, uint256 amount, address to) 
        external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "Invalid address");
        IERC20(token).transfer(to, amount);
    }
    
    function pauseGame() external onlyRole(OPERATOR_ROLE) {
        gameConfig.gameActive = false;
    }
    
    function resumeGame() external onlyRole(DEFAULT_ADMIN_ROLE) {
        gameConfig.gameActive = true;
    }
    
    // Update member contract
    function updateMemberContract(address newMemberContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMemberContract != address(0), "Invalid address");
        memberContract = IMemberContract(newMemberContract);
    }
} 