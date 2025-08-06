// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev Provides information about the current execution context.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism.
 */
abstract contract Ownable is Context {
    address private _owner;

    error OwnableInvalidOwner(address owner);
    error OwnableUnauthorizedAccount(address account);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// Data Contract Interface for AZC Staking
interface IAZCDataContract {
    function getStakeInfo(uint256 stakeId) external view returns (
        address user,
        address token,
        uint256 amount,
        uint256 usdtAmount,
        uint256 planId,
        uint256 startTime,
        bool active,
        uint256 totalClaimed,
        uint256 lastClaimTime
    );
    function recordClaim(uint256 stakeId, uint256 claimAmount, uint256 timestamp) external;
    function updateTotalEarned(address user, uint256 amount) external;
    function hasReachedMaxOut(address user) external view returns (bool);
    function getRemainingMaxOut(address user) external view returns (uint256);
    function canClaimStake(uint256 stakeId) external view returns (bool);
    function timeUntilNextClaim(uint256 stakeId) external view returns (uint256);
}

// Member Contract Interface
interface IMemberContract {
    function getUplines(address member, uint256 levels) external view returns (address[] memory);
    function isLeader(address member) external view returns (bool);
    function getDirectDownlinesCount(address member) external view returns (uint256);
    function getTeamVolume(address member) external view returns (uint256);
    function getDirectDownlines(address member) external view returns (address[] memory);
    function getLevel(address member) external view returns (uint256);
}

// AZC Staking Contract Interface
interface IAZCStakingContract {
    function stakingPlans(uint256 planId) external view returns (
        uint256 id,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 monthlyROI,
        bool active
    );
    function getAZCPrice() external view returns (uint256);
}

/**
 * @title AZCClaimContract
 * @dev Contract cho phép claim lãi và gốc từ AZC staking với tỉ lệ 50% AZC + 50% USDT
 */
contract AZCClaimContract is Ownable, ReentrancyGuard {
    
    // Interfaces
    IAZCDataContract public dataContract;
    IMemberContract public memberContract;
    IAZCStakingContract public stakingContract;
    
    // Token addresses
    address public immutable AZC_TOKEN;
    address public constant USDT = 0x55d398326f99059fF775485246999027B3197955; // USDT on BSC
    
    // AZC price in USDT (18 decimals) - Mặc định 2.0 USDT
    uint256 public azcPriceInUSDT = 2000000000000000000; // 2.0 * 10^18
    
    // Token distribution percentages for interest claims
    uint256 public azcTokenPercent = 50;        // 50% of reward in AZC token
    uint256 public usdtTokenPercent = 50;       // 50% of reward in USDT
    
    // Fee percentages for upline rewards (in basis points, 100 = 1%)
    uint256[10] public uplineRewardPercents = [2000, 1000, 500, 500, 500, 100, 100, 100, 100, 100];
    uint256 public deepLevel = 20;

    // Level requirements and rewards
    struct LevelInfo {
        uint256 directVolume;      // Required direct downline volume in USD
        uint256 teamVolume;        // Required team volume in USD
        uint256 rewardPercent;     // Reward percent of system-wide interest (basis points)
    }
    
    LevelInfo[5] public levelRequirements;
    
    // Principal claim phases
    uint256[3] public principalClaimPercents = [30, 30, 40]; // 30%, 30%, 40%
    
    // Plan durations in months
    mapping(uint256 => uint256) public planDurations; // planId => duration in months
    
    // Principal claim tracking
    struct PrincipalClaimInfo {
        uint256 totalPrincipalClaimed;
        uint256 lastPrincipalClaimTime;
        uint256 principalClaimPhase; // 0, 1, 2 (phases 1, 2, 3)
    }
    
    mapping(uint256 => PrincipalClaimInfo) public principalClaims; // stakeId => PrincipalClaimInfo
    
    // Events
    event InterestClaimed(address indexed user, uint256 indexed stakeId, uint256 azcAmount, uint256 usdtAmount, uint256 timestamp);
    event PrincipalClaimed(address indexed user, uint256 indexed stakeId, uint256 azcAmount, uint256 phase, uint256 timestamp);
    event ReferralReward(address indexed user, address indexed referrer, uint256 azcAmount, uint256 usdtAmount, uint256 level);
    event LevelReward(address indexed user, uint256 azcAmount, uint256 usdtAmount, uint256 level);
    event AZCPriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    /**
     * @dev Constructor
     */
    constructor(
        address _dataContract,
        address _memberContract,
        address _stakingContract,
        address _azcToken
    ) Ownable(msg.sender) {
        require(_dataContract != address(0), "Invalid data contract");
        require(_memberContract != address(0), "Invalid member contract");
        require(_stakingContract != address(0), "Invalid staking contract");
        require(_azcToken != address(0), "Invalid AZC token");
        
        dataContract = IAZCDataContract(_dataContract);
        memberContract = IMemberContract(_memberContract);
        stakingContract = IAZCStakingContract(_stakingContract);
        AZC_TOKEN = _azcToken;

        // Initialize level requirements
        levelRequirements[0] = LevelInfo(3000 * 10**18, 30000 * 10**18, 300);    // Level 1: 3% reward
        levelRequirements[1] = LevelInfo(5000 * 10**18, 100000 * 10**18, 500);   // Level 2: 5% reward
        levelRequirements[2] = LevelInfo(10000 * 10**18, 200000 * 10**18, 700);  // Level 3: 7% reward
        levelRequirements[3] = LevelInfo(15000 * 10**18, 350000 * 10**18, 900);  // Level 4: 9% reward
        levelRequirements[4] = LevelInfo(20000 * 10**18, 500000 * 10**18, 1100); // Level 5: 11% reward
        
        // Initialize plan durations (có thể được cập nhật bởi admin)
        planDurations[0] = 3;  // Plan 0: 3 months
        planDurations[1] = 6;  // Plan 1: 6 months  
        planDurations[2] = 12; // Plan 2: 12 months
    }

    struct Stake {
        address user;
        address token;
        uint256 amount;
        uint256 usdtAmount;
        uint256 planId;
        uint256 startTime;
        bool active;
        uint256 totalClaimed;
        uint256 lastClaimTime;
    }

    /**
     * @dev Claim interest cho stake
     */
    function claimInterest(uint256 stakeId) external nonReentrant {
        Stake memory stake = getStakeInfo(stakeId);
        require(stake.user != address(0), "Invalid stake");
        require(stake.user == msg.sender, "Not your stake");
        require(stake.active, "Stake not active");
        require(stake.token == AZC_TOKEN, "Only AZC stakes supported");
        
        // Kiểm tra plan duration
        uint256 planDuration = planDurations[stake.planId];
        require(planDuration > 0, "Invalid plan duration");
        
        uint256 planEndTime = stake.startTime + (planDuration * 30 days);
        require(block.timestamp <= planEndTime, "Interest period ended");
        
        uint256 timeElapsed = block.timestamp - stake.lastClaimTime;
        require(timeElapsed >= 24 hours, "Cannot claim yet");
        
        (,,, uint256 monthlyROI,) = stakingContract.stakingPlans(stake.planId);
        uint256 claimUsdtAmount = calculateInterestAmount(stake, monthlyROI, timeElapsed, planEndTime);
        
        // Phân phối token cho user (50% AZC + 50% USDT)
        distributeInterestToUser(stake.user, claimUsdtAmount);
        
        // Cập nhật thời gian claim
        uint256 newLastClaimTime = stake.lastClaimTime + ((timeElapsed / (24 hours)) * 24 hours);
        dataContract.recordClaim(stakeId, claimUsdtAmount, newLastClaimTime);
        
        // Phân phối referral và level rewards
        distributeReferralRewards(stake.user, claimUsdtAmount);
        distributeLevelRewards(stake.user, claimUsdtAmount);
        
        uint256 azcAmount = convertUSDTToAZC(claimUsdtAmount * azcTokenPercent / 100);
        uint256 usdtAmount = claimUsdtAmount * usdtTokenPercent / 100;
        
        emit InterestClaimed(stake.user, stakeId, azcAmount, usdtAmount, block.timestamp);
    }

    /**
     * @dev Claim principal cho stake theo phases
     */
    function claimPrincipal(uint256 stakeId) external nonReentrant {
        Stake memory stake = getStakeInfo(stakeId);
        require(stake.user != address(0), "Invalid stake");
        require(stake.user == msg.sender, "Not your stake");
        require(stake.active, "Stake not active");
        require(stake.token == AZC_TOKEN, "Only AZC stakes supported");
        
        // Lấy thông tin principal claim
        PrincipalClaimInfo storage principalInfo = principalClaims[stakeId];
        
        require(principalInfo.principalClaimPhase < 3, "All principal already claimed");
        
        // Kiểm tra thời gian claim principal
        uint256 planDuration = planDurations[stake.planId];
        require(planDuration > 0, "Invalid plan duration");
        
        uint256 principalStartTime = stake.startTime + (planDuration * 30 days);
        uint256 phaseStartTime = principalStartTime + (principalInfo.principalClaimPhase * 30 days);
        
        require(block.timestamp >= phaseStartTime, "Principal claim not available yet");
        
        // Tính amount claim cho phase này
        uint256 phasePercent = principalClaimPercents[principalInfo.principalClaimPhase];
        uint256 claimAzcAmount = (stake.amount * phasePercent) / 100;
        
        // Transfer AZC token
        require(IERC20(AZC_TOKEN).transfer(stake.user, claimAzcAmount), "AZC transfer failed");
        
        // Cập nhật principal claim info
        principalInfo.totalPrincipalClaimed += claimAzcAmount;
        principalInfo.lastPrincipalClaimTime = block.timestamp;
        principalInfo.principalClaimPhase += 1;
        
        emit PrincipalClaimed(stake.user, stakeId, claimAzcAmount, principalInfo.principalClaimPhase - 1, block.timestamp);
    }

    /**
     * @dev Lấy thông tin stake từ data contract
     */
    function getStakeInfo(uint256 stakeId) internal view returns (Stake memory) {
        (
            address user,
            address token,
            uint256 amount,
            uint256 usdtAmount,
            uint256 planId,
            uint256 startTime,
            bool active,
            uint256 totalClaimed,
            uint256 lastClaimTime
        ) = dataContract.getStakeInfo(stakeId);
        
        return Stake(user, token, amount, usdtAmount, planId, startTime, active, totalClaimed, lastClaimTime);
    }

    /**
     * @dev Tính toán amount interest có thể claim
     */
    function calculateInterestAmount(
        Stake memory stake, 
        uint256 monthlyROI, 
        uint256 timeElapsed,
        uint256 planEndTime
    ) internal view returns (uint256) {
        uint256 dailyROI = monthlyROI * 10000 / 30;  // Scaled by 10000 for precision
        uint256 claimableDays = timeElapsed / (24 hours);
        
        // Giới hạn claim không vượt quá plan end time
        uint256 maxClaimableTime = planEndTime - stake.lastClaimTime;
        if (timeElapsed > maxClaimableTime) {
            claimableDays = maxClaimableTime / (24 hours);
        }
        
        if (claimableDays > 30) claimableDays = 30;  // Cap at 30 days to prevent abuse
        
        // Sử dụng AZC price để tính USDT value từ staked AZC amount
        uint256 stakeUsdtValue = convertAZCToUSDT(stake.amount);
        uint256 dailyUsdtAmount = stakeUsdtValue * dailyROI / 1000000;  // Daily USDT reward
        uint256 claimUsdtAmount = dailyUsdtAmount * claimableDays;
        
        require(claimUsdtAmount > 0, "No rewards to claim");
        return claimUsdtAmount;
    }

    /**
     * @dev Convert AZC amount to USDT value
     */
    function convertAZCToUSDT(uint256 azcAmount) public view returns (uint256) {
        return (azcAmount * azcPriceInUSDT) / 10**18;
    }

    /**
     * @dev Convert USDT amount to AZC amount
     */
    function convertUSDTToAZC(uint256 usdtAmount) public view returns (uint256) {
        return (usdtAmount * 10**18) / azcPriceInUSDT;
    }

    /**
     * @dev Phân phối interest tokens cho user (50% AZC + 50% USDT)
     */
    function distributeInterestToUser(address user, uint256 usdtAmount) private {
        uint256 azcUsdtAmount = usdtAmount * azcTokenPercent / 100;
        uint256 usdtRewardAmount = usdtAmount * usdtTokenPercent / 100;
        
        // Transfer AZC
        uint256 azcAmount = convertUSDTToAZC(azcUsdtAmount);
        require(IERC20(AZC_TOKEN).transfer(user, azcAmount), "AZC transfer failed");
        
        // Transfer USDT
        require(IERC20(USDT).transfer(user, usdtRewardAmount), "USDT transfer failed");
    }

    /**
     * @dev Phân phối referral rewards (50% AZC + 50% USDT)
     */
    function distributeReferralRewards(address user, uint256 claimAmount) private {
        address[] memory uplines = memberContract.getUplines(user, 10);
        uint256 maxLevels = uplines.length < 10 ? uplines.length : 10;
        
        for (uint256 i = 0; i < maxLevels; i++) {
            address upline = uplines[i];
            if (upline == address(0)) break;
            
            bool isLeader = memberContract.isLeader(upline);
            bool hasMaxedOut = !isLeader && dataContract.hasReachedMaxOut(upline);
            if (hasMaxedOut) continue;
            
            uint256 rewardPercent = uplineRewardPercents[i];
            uint256 rewardAmount = claimAmount * rewardPercent / 10000;
            
            if (rewardAmount == 0) break;
            
            if (!isLeader) {
                uint256 remainingMaxOut = dataContract.getRemainingMaxOut(upline);
                if (rewardAmount > remainingMaxOut) {
                    rewardAmount = remainingMaxOut;
                }
                if (rewardAmount == 0) continue; 
            }
            
            // Phân phối 50% AZC + 50% USDT
            uint256 azcUsdtAmount = rewardAmount * azcTokenPercent / 100;
            uint256 usdtRewardAmount = rewardAmount * usdtTokenPercent / 100;
            
            uint256 azcAmount = convertUSDTToAZC(azcUsdtAmount);
            
            require(IERC20(AZC_TOKEN).transfer(upline, azcAmount), "AZC transfer failed");
            require(IERC20(USDT).transfer(upline, usdtRewardAmount), "USDT transfer failed");
            
            dataContract.updateTotalEarned(upline, rewardAmount);
            emit ReferralReward(user, upline, azcAmount, usdtRewardAmount, i + 1);
        }
    }
    
    /**
     * @dev Phân phối level-based rewards (50% AZC + 50% USDT)
     */
    function distributeLevelRewards(address user, uint256 claimAmount) private {
        address[] memory uplines = memberContract.getUplines(user, deepLevel); 
        
        for (uint256 i = 0; i < uplines.length; i++) {
            address upline = uplines[i];
            if (upline == address(0)) break; 
            
            uint256 level = memberContract.getLevel(upline);
            if (level > 0) {
                uint256 rewardPercent = levelRequirements[level - 1].rewardPercent;
                uint256 rewardAmount = claimAmount * rewardPercent / 10000; 
                
                bool isLeader = memberContract.isLeader(upline);
                if (!isLeader && dataContract.hasReachedMaxOut(upline)) {
                    continue; 
                }
                
                if (!isLeader) {
                    uint256 remainingMaxOut = dataContract.getRemainingMaxOut(upline);
                    if (rewardAmount > remainingMaxOut) {
                        rewardAmount = remainingMaxOut;
                    }
                }
                
                if (rewardAmount > 0) {
                    // Phân phối 50% AZC + 50% USDT
                    uint256 azcUsdtAmount = rewardAmount * azcTokenPercent / 100;
                    uint256 usdtRewardAmount = rewardAmount * usdtTokenPercent / 100;
                    
                    uint256 azcAmount = convertUSDTToAZC(azcUsdtAmount);
                    
                    require(IERC20(AZC_TOKEN).transfer(upline, azcAmount), "AZC transfer failed");
                    require(IERC20(USDT).transfer(upline, usdtRewardAmount), "USDT transfer failed");
                    
                    dataContract.updateTotalEarned(upline, rewardAmount);
                    emit LevelReward(upline, azcAmount, usdtRewardAmount, level);
                }
            }
        }
    }

    // ========================= VIEW FUNCTIONS =========================

    /**
     * @dev Lấy thông tin principal claim info
     */
    function getPrincipalClaimInfo(uint256 stakeId) external view returns (
        uint256 totalPrincipalClaimed,
        uint256 lastPrincipalClaimTime,
        uint256 principalClaimPhase
    ) {
        PrincipalClaimInfo storage principalInfo = principalClaims[stakeId];
        return (
            principalInfo.totalPrincipalClaimed,
            principalInfo.lastPrincipalClaimTime,
            principalInfo.principalClaimPhase
        );
    }

    /**
     * @dev Kiểm tra interest có thể claim cho stake
     */
    function getClaimableInterest(uint256 stakeId) external view returns (
        uint256 azcAmount, 
        uint256 usdtAmount, 
        bool canClaim
    ) {
        (
            ,
            address token,
            uint256 stakeAmount,
            ,
            uint256 planId,
            uint256 startTime,
            bool active,
            ,
            uint256 lastClaimTime
        ) = dataContract.getStakeInfo(stakeId);
        
        if (!active || token != AZC_TOKEN) return (0, 0, false);
        
        // Kiểm tra plan duration
        uint256 planDuration = planDurations[planId];
        if (planDuration == 0) return (0, 0, false);
        
        uint256 planEndTime = startTime + (planDuration * 30 days);
        if (block.timestamp > planEndTime) return (0, 0, false);
        
        uint256 timeElapsed = block.timestamp - lastClaimTime;
        canClaim = timeElapsed >= 24 hours;
        
        if (!canClaim) return (0, 0, false);
        
        (,,, uint256 monthlyROI,) = stakingContract.stakingPlans(planId);
        uint256 dailyROI = monthlyROI * 10000 / 30;  
        uint256 claimableDays = timeElapsed / (24 hours);
        
        // Giới hạn claim không vượt quá plan end time
        uint256 maxClaimableTime = planEndTime - lastClaimTime;
        if (timeElapsed > maxClaimableTime) {
            claimableDays = maxClaimableTime / (24 hours);
        }
        
        if (claimableDays > 30) claimableDays = 30;
        
        uint256 stakeUsdtValue = convertAZCToUSDT(stakeAmount);
        uint256 dailyUsdtAmount = stakeUsdtValue * dailyROI / 1000000;  
        uint256 totalUsdtAmount = dailyUsdtAmount * claimableDays;
        
        azcAmount = convertUSDTToAZC(totalUsdtAmount * azcTokenPercent / 100);
        usdtAmount = totalUsdtAmount * usdtTokenPercent / 100;
        
        return (azcAmount, usdtAmount, canClaim);
    }

    /**
     * @dev Kiểm tra principal có thể claim cho stake
     */
    function getClaimablePrincipal(uint256 stakeId) external view returns (
        uint256 azcAmount,
        uint256 phase,
        bool canClaim,
        uint256 timeUntilClaim
    ) {
        (
            ,
            address token,
            uint256 stakeAmount,
            ,
            uint256 planId,
            uint256 startTime,
            bool active,
            ,
        ) = dataContract.getStakeInfo(stakeId);
        
        if (!active || token != AZC_TOKEN) return (0, 0, false, 0);
        
        PrincipalClaimInfo storage principalInfo = principalClaims[stakeId];
        
        if (principalInfo.principalClaimPhase >= 3) return (0, 0, false, 0);
        
        uint256 planDuration = planDurations[planId];
        if (planDuration == 0) return (0, 0, false, 0);
        
        uint256 principalStartTime = startTime + (planDuration * 30 days);
        uint256 phaseStartTime = principalStartTime + (principalInfo.principalClaimPhase * 30 days);
        
        canClaim = block.timestamp >= phaseStartTime;
        timeUntilClaim = canClaim ? 0 : phaseStartTime - block.timestamp;
        
        if (canClaim) {
            uint256 phasePercent = principalClaimPercents[principalInfo.principalClaimPhase];
            azcAmount = (stakeAmount * phasePercent) / 100;
        }
        
        return (azcAmount, principalInfo.principalClaimPhase, canClaim, timeUntilClaim);
    }

    /**
     * @dev Lấy thông tin timeline cho stake
     */
    function getStakeTimeline(uint256 stakeId) external view returns (
        uint256 startTime,
        uint256 interestEndTime,
        uint256 principalPhase1Time,
        uint256 principalPhase2Time,
        uint256 principalPhase3Time,
        uint256 planDuration
    ) {
        (
            ,
            ,
            ,
            ,
            uint256 planId,
            uint256 stakeStartTime,
            ,
            ,
        ) = dataContract.getStakeInfo(stakeId);
        
        startTime = stakeStartTime;
        planDuration = planDurations[planId];
        
        if (planDuration > 0) {
            interestEndTime = startTime + (planDuration * 30 days);
            principalPhase1Time = interestEndTime;
            principalPhase2Time = principalPhase1Time + 30 days;
            principalPhase3Time = principalPhase2Time + 30 days;
        }
    }

    // ========================= ADMIN FUNCTIONS =========================

    /**
     * @dev Set giá AZC (chỉ owner)
     */
    function setAZCPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        uint256 oldPrice = azcPriceInUSDT;
        azcPriceInUSDT = _newPrice;
        emit AZCPriceUpdated(oldPrice, _newPrice);
    }

    /**
     * @dev Cập nhật token distribution percentages
     */
    function updateTokenDistribution(uint256 _azcTokenPercent, uint256 _usdtTokenPercent) 
        external onlyOwner 
    {
        require(_azcTokenPercent + _usdtTokenPercent == 100, "Percentages must add up to 100");
        azcTokenPercent = _azcTokenPercent;
        usdtTokenPercent = _usdtTokenPercent;
    }
    
    /**
     * @dev Cập nhật plan duration
     */
    function updatePlanDuration(uint256 planId, uint256 durationInMonths) external onlyOwner {
        require(durationInMonths > 0, "Duration must be greater than 0");
        planDurations[planId] = durationInMonths;
    }

    /**
     * @dev Cập nhật upline reward percentages
     */
    function updateUplineRewardPercents(uint256[10] calldata _percents) external onlyOwner {
        uplineRewardPercents = _percents;
    }
    
    /**
     * @dev Cập nhật level requirements
     */
    function updateLevelRequirement(
        uint256 level,
        uint256 directVolume,
        uint256 teamVolume,
        uint256 rewardPercent
    ) external onlyOwner {
        require(level < 5, "Invalid level");
        levelRequirements[level] = LevelInfo(directVolume, teamVolume, rewardPercent);
    }

    /**
     * @dev Cập nhật principal claim percentages
     */
    function updatePrincipalClaimPercents(uint256[3] calldata _percents) external onlyOwner {
        require(_percents[0] + _percents[1] + _percents[2] == 100, "Percentages must add up to 100");
        principalClaimPercents = _percents;
    }

    /**
     * @dev Cập nhật contract addresses
     */
    function setDataContract(address _dataContract) external onlyOwner {
        require(_dataContract != address(0), "Invalid address");
        dataContract = IAZCDataContract(_dataContract);
    }

    function setMemberContract(address _memberContract) external onlyOwner {
        require(_memberContract != address(0), "Invalid address");
        memberContract = IMemberContract(_memberContract);
    }

    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid address");
        stakingContract = IAZCStakingContract(_stakingContract);
    }

    /**
     * @dev Cập nhật deep level
     */
    function updateDeepLevel(uint256 _deepLevel) external onlyOwner {
        require(_deepLevel > 0, "DeepLevel must be greater than 0");
        require(_deepLevel <= 50, "DeepLevel too high, risk of gas limit");
        deepLevel = _deepLevel;
    }

    /**
     * @dev Emergency withdraw functions
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        IERC20(token).transfer(owner(), amount);
    }

    function emergencyWithdrawETH(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        payable(owner()).transfer(amount);
    }

    // Receive ETH
    receive() external payable {}
} 