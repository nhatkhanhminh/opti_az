// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @dev External interface of AccessControl declared to support ERC-165 detection.
 */
interface IAccessControl {
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
    error AccessControlBadConfirmation();
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    function hasRole(bytes32 role, address account) external view returns (bool);
    function getRoleAdmin(bytes32 role) external view returns (bytes32);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
    function renounceRole(bytes32 role, address callerConfirmation) external;
}

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

/**
 * @dev Interface of the ERC-165 standard, as defined in the ERC.
 */
interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

/**
 * @dev Implementation of the {IERC165} interface.
 */
abstract contract ERC165 is IERC165 {
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

/**
 * @dev Contract module that allows children to implement role-based access control mechanisms.
 */
abstract contract AccessControl is Context, IAccessControl, ERC165 {
    struct RoleData {
        mapping(address account => bool) hasRole;
        bytes32 adminRole;
    }

    mapping(bytes32 role => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        return _roles[role].hasRole[account];
    }

    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roles[role].adminRole;
    }

    function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address callerConfirmation) public virtual {
        if (callerConfirmation != _msgSender()) {
            revert AccessControlBadConfirmation();
        }
        _revokeRole(role, callerConfirmation);
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    function _grantRole(bytes32 role, address account) internal virtual returns (bool) {
        if (!hasRole(role, account)) {
            _roles[role].hasRole[account] = true;
            emit RoleGranted(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
    }

    function _revokeRole(bytes32 role, address account) internal virtual returns (bool) {
        if (hasRole(role, account)) {
            _roles[role].hasRole[account] = false;
            emit RoleRevoked(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
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
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        _status = _NOT_ENTERED;
    }

    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

interface IDataContract {
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

interface IMemberContract {
    function getUplines(address member, uint256 levels) external view returns (address[] memory);
    function isLeader(address member) external view returns (bool);
    function getDirectDownlinesCount(address member) external view returns (uint256);
    function getTeamVolume(address member) external view returns (uint256);
    function getDirectDownlines(address member) external view returns (address[] memory);
    function getLevel(address member) external view returns (uint256);
}

interface IStakingContract {
    function stakingPlans(uint256 planId) external view returns (
        uint256 id,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 monthlyROI,
        bool active
    );
}

contract ClaimContract is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR");
    
    // Interfaces
    IDataContract public dataContract;
    IMemberContract public memberContract;
    IStakingContract public stakingContract;
    
    // Addresses
    address public azc;  // AZC token address
    address public constant USDT = 0x55d398326f99059fF775485246999027B3197955; // USDT on BSC
    
    // Reward Token Configuration
    struct RewardTokenInfo {
        address rewardToken;    // Token sẽ được trả thưởng (70%)
        uint256 price;         // Giá của reward token trong USDT (18 decimals)
        bool active;           // Có active không
    }
    
    mapping(address => RewardTokenInfo) public rewardTokens; // Staking Token => Reward Token Info
    
    // Constants
    uint256 public constant MAX_PAYOUT_PERCENT = 400;  // 400% max payout
    
    // Fee percentages for upline rewards (in basis points, 100 = 1%)
    uint256[10] public uplineRewardPercents = [2000, 1000, 500, 500, 500, 100, 100, 100, 100, 100];
    uint256 public DeepLevel = 10;

    // Level requirements and rewards
    struct LevelInfo {
        uint256 directVolume;      // Required direct downline volume in USD
        uint256 teamVolume;        // Required team volume in USD
        uint256 rewardPercent;     // Reward percent of system-wide interest (basis points)
    }
    
    LevelInfo[5] public levelRequirements;
    
    // Token distribution percentages
    uint256 public originalTokenPercent = 70;  // 70% of reward in reward token
    uint256 public azcTokenPercent = 30;       // 30% of reward in AZC token
    
    // AZC price in USDT (1 AZC = 0.01 USDT)
    uint256 public azcPrice = 10**16; // 0.01 USDT with 18 decimals

    // Gas management (simplified - no USD conversion)
    uint256 public gasRefundPercent = 50; // Refund 50% of gas
    uint256 public constant GAS_REFUND_CAP = 0.01 ether; // Max refund cap (0.01 BNB)
    uint256 public constant MAX_GAS_FOR_REFUND = 500000; // Max gas eligible for refund (500k gas)
    bool public gasRefundPaused = false; // Pause gas refund if needed
    
    // Events
    event Claimed(address indexed user, uint256 indexed stakeId, address token, uint256 usdtAmount, uint256 timestamp);
    event ReferralReward(address indexed user, address indexed referrer, uint256 amount, uint256 level);
    event LevelReward(address indexed user, uint256 amount, uint256 level);
    event TokensDistributed(address indexed user, address indexed token, uint256 amount, string tokenType);
    event GasRefunded(address indexed user, uint256 amount);
    event RewardTokenSet(address indexed stakingToken, address indexed rewardToken, uint256 price);
    
    constructor(
        address _dataContract,
        address _memberContract,
        address _stakingContract,
        address _azcToken
    ) {
        dataContract = IDataContract(_dataContract);
        memberContract = IMemberContract(_memberContract);
        stakingContract = IStakingContract(_stakingContract);
        azc = _azcToken;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EDITOR_ROLE, msg.sender);

        // Initialize level requirements
        levelRequirements[0] = LevelInfo(3000, 30000, 300);    // Level 1: 3% reward
        levelRequirements[1] = LevelInfo(5000, 100000, 500);   // Level 2: 5% reward
        levelRequirements[2] = LevelInfo(10000, 200000, 700);  // Level 3: 7% reward
        levelRequirements[3] = LevelInfo(15000, 350000, 900);  // Level 4: 9% reward
        levelRequirements[4] = LevelInfo(20000, 500000, 1100); // Level 5: 11% reward
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

    // Claim interest for a stake with gas refund
    function claimStake(uint256 stakeId) external nonReentrant {
        uint256 gasStart = gasleft(); // Measure initial gas
        
        Stake memory stake = getStakeInfo(stakeId);
        require(stake.user != address(0), "Invalid stake");
        require(stake.user == msg.sender, "Not your stake");
        require(stake.active, "Stake not active");
        
        uint256 timeElapsed = block.timestamp - stake.lastClaimTime;
        require(timeElapsed >= 24 hours, "Cannot claim yet");
        
        (,,, uint256 monthlyROI,) = stakingContract.stakingPlans(stake.planId);
        uint256 claimUsdtAmount = calculateClaimAmount(stake, monthlyROI, timeElapsed);
        
        distributeTokensToUser(stake.user, stake.token, claimUsdtAmount);
        
        uint256 newLastClaimTime = stake.lastClaimTime + ((timeElapsed / (24 hours)) * 24 hours);
        dataContract.recordClaim(stakeId, claimUsdtAmount, newLastClaimTime);
        
        distributeReferralRewards(stake.user, stake.token, claimUsdtAmount);
        distributeLevelRewards(stake.user, stake.token, claimUsdtAmount);
        
        emit Claimed(stake.user, stakeId, stake.token, claimUsdtAmount, block.timestamp);

        // Refund gas
        refundGas(gasStart);
    }

    // Get stake information from data contract
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

    // Calculate claimable amount based on stake and time elapsed
    function calculateClaimAmount(Stake memory stake, uint256 monthlyROI, uint256 timeElapsed) internal pure returns (uint256) {
        uint256 dailyROI = monthlyROI * 10000 / 30;  // Scaled by 10000 for precision
        uint256 claimableDays = timeElapsed / (24 hours);
        if (claimableDays > 30) claimableDays = 30;  // Cap at 30 days to prevent abuse
        
        uint256 dailyUsdtAmount = stake.usdtAmount * dailyROI / 1000000;  // Daily USDT reward
        uint256 claimUsdtAmount = dailyUsdtAmount * claimableDays;
        
        uint256 maxPayout = stake.usdtAmount * MAX_PAYOUT_PERCENT / 100;
        if (stake.totalClaimed + claimUsdtAmount > maxPayout) {
            claimUsdtAmount = maxPayout - stake.totalClaimed;
        }
        
        require(claimUsdtAmount > 0, "No rewards to claim");
        return claimUsdtAmount;
    }

    // Wrapper for distributing tokens to user
    function distributeTokensToUser(address user, address token, uint256 usdtAmount) private {
        distributeRewardTokens(user, token, usdtAmount);
    }

    // Convert USDT amount to token amount using custom price
    function convertUsdtToTokenAmount(address stakingToken, uint256 usdtAmount) public view returns (uint256) {
        if (stakingToken == USDT) {
            return usdtAmount; // USDT is 1:1
        }
        
        if (stakingToken == azc) {
            // 1 AZC = 0.01 USDT -> azcPrice = 0.01 * 10^18
            return (usdtAmount * 10**18) / azcPrice; // usdtAmount / (0.01 * 10^18) = 100 AZC per 1 USDT
        }

        if (stakingToken == address(0)) {
            // For BNB staking, you need to set a fixed price or use external price source
            // For now, assume 1 BNB = 600 USD (you can make this configurable)
            uint256 bnbPrice = 600 * 10**18; // 600 USD per BNB (18 decimals)
            return (usdtAmount * 10**18) / bnbPrice;
        }
        
        // Get reward token info for this staking token
        RewardTokenInfo memory rewardInfo = rewardTokens[stakingToken];
        require(rewardInfo.active, "Reward token not configured for this staking token");
        require(rewardInfo.price > 0, "Invalid reward token price");

        uint256 tokenAmount = (usdtAmount * 10**18) / rewardInfo.price; // Convert USDT to reward token amount
        return tokenAmount;
    }

    // Get reward token address for a staking token
    function getRewardToken(address stakingToken) public view returns (address) {
        if (stakingToken == USDT) {
            return USDT;
        }
        
        RewardTokenInfo memory rewardInfo = rewardTokens[stakingToken];
        require(rewardInfo.active, "Reward token not configured for this staking token");
        return rewardInfo.rewardToken;
    }

    // Distribute reward tokens (reward token and AZC)
    function distributeRewardTokens(address user, address stakingToken, uint256 usdtAmount) private {
        uint256 rewardTokenUsdtAmount = usdtAmount * originalTokenPercent / 100;
        uint256 azcTokenUsdtAmount = usdtAmount * azcTokenPercent / 100;
        
        if (stakingToken == address(0)) {
            // For BNB staking, still pay in BNB
            uint256 bnbAmount = convertUsdtToTokenAmount(address(0), rewardTokenUsdtAmount);
            payable(user).transfer(bnbAmount);
            emit TokensDistributed(user, stakingToken, bnbAmount, "BNB");
        } else {
            // Get the configured reward token for this staking token
            address rewardToken = getRewardToken(stakingToken);
            uint256 tokenAmount = convertUsdtToTokenAmount(stakingToken, rewardTokenUsdtAmount);
            require(IERC20(rewardToken).transfer(user, tokenAmount), "Reward token transfer failed");
            emit TokensDistributed(user, rewardToken, tokenAmount, "Reward");
        }
        
        uint256 azcAmount = convertUsdtToTokenAmount(azc, azcTokenUsdtAmount);
        require(IERC20(azc).transfer(user, azcAmount), "AZC transfer failed");
        emit TokensDistributed(user, azc, azcAmount, "AZC");
    }
    
    // Distribute referral rewards to uplines (10 levels)
    function distributeReferralRewards(address user, address token, uint256 claimAmount) private {
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
            
            distributeRewardTokens(upline, token, rewardAmount);
            dataContract.updateTotalEarned(upline, rewardAmount);
            emit ReferralReward(user, upline, rewardAmount, i + 1);
        }
    }
    
    // Distribute level-based rewards
    function distributeLevelRewards(address user, address token, uint256 claimAmount) private {
        address[] memory uplines = memberContract.getUplines(user, DeepLevel); 
        
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
                    distributeRewardTokens(upline, token, rewardAmount); 
                    dataContract.updateTotalEarned(upline, rewardAmount);
                    emit LevelReward(upline, rewardAmount, level);
                }
            }
        }
    }
    
    // Calculate direct downline volume for a user
    function calculateDirectVolume(address user) private view returns (uint256) {
        address[] memory directDownlines = memberContract.getDirectDownlines(user);
        uint256 totalVolume = 0;
        for (uint256 i = 0; i < directDownlines.length; i++) {
            totalVolume += memberContract.getTeamVolume(directDownlines[i]);
        }
        return totalVolume;
    }
    
    // Simplified gas refund (no USD conversion needed)
    function refundGas(uint256 gasStart) private {
        if (gasRefundPaused || gasRefundPercent == 0) return; // Skip if paused or no refund percentage

        uint256 gasUsed = gasStart - gasleft();
        if (gasUsed > MAX_GAS_FOR_REFUND) return; // Skip if gas exceeds limit

        uint256 gasCost = gasUsed * tx.gasprice; // Gas cost in wei (BNB)
        uint256 refundAmount = (gasCost * gasRefundPercent) / 100; // Calculate refund amount
        if (refundAmount > GAS_REFUND_CAP) refundAmount = GAS_REFUND_CAP; // Cap refund amount
        
        uint256 contractBalance = address(this).balance;
        if (refundAmount > 0 && contractBalance >= refundAmount) {
            (bool success, ) = msg.sender.call{value: refundAmount}(""); // Send refund
            if (success) {
                emit GasRefunded(msg.sender, refundAmount);
            }
        }
    }

    // Admin function to set reward token for a staking token
    function setRewardToken(
        address stakingToken, 
        address rewardToken, 
        uint256 price
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(stakingToken != address(0), "Invalid staking token");
        require(rewardToken != address(0), "Invalid reward token");
        require(price > 0, "Price must be greater than 0");
        
        rewardTokens[stakingToken] = RewardTokenInfo({
            rewardToken: rewardToken,
            price: price,
            active: true
        });
        
        emit RewardTokenSet(stakingToken, rewardToken, price);
    }

    // Admin function to update reward token price
    function updateRewardTokenPrice(address stakingToken, uint256 price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(rewardTokens[stakingToken].active, "Reward token not configured");
        require(price > 0, "Price must be greater than 0");
        
        rewardTokens[stakingToken].price = price;
        emit RewardTokenSet(stakingToken, rewardTokens[stakingToken].rewardToken, price);
    }

    // Admin function to activate/deactivate reward token
    function setRewardTokenActive(address stakingToken, bool active) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(rewardTokens[stakingToken].rewardToken != address(0), "Reward token not configured");
        rewardTokens[stakingToken].active = active;
    }

    // Admin function to update AZC price
    function updateAzcPrice(uint256 _azcPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_azcPrice > 0, "Price must be greater than 0");
        azcPrice = _azcPrice;
    }

    // Admin function to update token distribution percentages
    function updateTokenDistribution(uint256 _originalTokenPercent, uint256 _azcTokenPercent) 
        external onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_originalTokenPercent + _azcTokenPercent == 100, "Percentages must add up to 100");
        originalTokenPercent = _originalTokenPercent;
        azcTokenPercent = _azcTokenPercent;
    }
    
    // Admin function to update upline reward percentages
    function updateUplineRewardPercents(uint256[10] calldata _percents) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uplineRewardPercents = _percents;
    }
    
    // Admin function to update level requirements
    function updateLevelRequirement(
        uint256 level,
        uint256 directVolume,
        uint256 teamVolume,
        uint256 rewardPercent
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(level < 5, "Invalid level");
        levelRequirements[level] = LevelInfo(directVolume, teamVolume, rewardPercent);
    }
    
    // Admin function to update AZC token address
    function updateAzcToken(address _azc) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_azc != address(0), "Invalid address");
        azc = _azc;
    }

    // Admin function to update gas refund percentage
    function setGasRefundPercent(uint256 _percent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_percent <= 100, "Percent must be <= 100");
        gasRefundPercent = _percent;
    }

    // Admin function to pause/unpause gas refund
    function setGasRefundPaused(bool _paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        gasRefundPaused = _paused;
    }

    // Anyone can fund the gas refund pool
    function fundGasRefund() external payable {}

    // Admin function to withdraw excess gas funds
    function withdrawGasFund(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }
    
    // View function to check claimable amount for a stake
    function getClaimableAmount(uint256 stakeId) external view returns (uint256 usdtAmount, bool canClaim) {
        (
            ,
            ,
            ,
            uint256 usdtStakeAmount,
            uint256 planId,
            ,
            bool active,
            uint256 totalClaimed,
            uint256 lastClaimTime
        ) = dataContract.getStakeInfo(stakeId);
        
        if (!active) return (0, false);
        
        uint256 timeElapsed = block.timestamp - lastClaimTime;
        canClaim = timeElapsed >= 24 hours;
        
        if (!canClaim) return (0, false);
        
        (,,, uint256 monthlyROI,) = stakingContract.stakingPlans(planId);
        uint256 dailyROI = monthlyROI * 10000 / 30;  
        uint256 claimableDays = timeElapsed / (24 hours);
        if (claimableDays > 30) claimableDays = 30;  
        
        uint256 dailyUsdtAmount = usdtStakeAmount * dailyROI / 1000000;  
        usdtAmount = dailyUsdtAmount * claimableDays;
        
        uint256 maxPayout = usdtStakeAmount * MAX_PAYOUT_PERCENT / 100;
        if (totalClaimed + usdtAmount > maxPayout) {
            usdtAmount = maxPayout - totalClaimed;
        }
        
        return (usdtAmount, canClaim);
    }
    
    // Emergency withdraw function for BNB
    function emergencyBNB(address to) external onlyRole(EDITOR_ROLE) nonReentrant {
        require(to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No BNB to withdraw");
        payable(to).transfer(balance);
    }

    // Emergency withdraw function for tokens
    function emergencyToken(address token, address to) external onlyRole(EDITOR_ROLE) nonReentrant {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid address");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        IERC20(token).transfer(to, balance);
    }

    // Admin function to update DeepLevel
    function updateDeepLevel(uint256 _deepLevel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_deepLevel > 0, "DeepLevel must be greater than 0");
        require(_deepLevel <= 50, "DeepLevel too high, risk of gas limit");
        DeepLevel = _deepLevel;
    }

    // View function to get reward token info
    function getRewardTokenInfo(address stakingToken) external view returns (
        address rewardToken,
        uint256 price,
        bool active
    ) {
        RewardTokenInfo memory info = rewardTokens[stakingToken];
        return (info.rewardToken, info.price, info.active);
    }

    // View function to calculate reward amounts for different tokens
    function calculateRewardAmounts(address stakingToken, uint256 usdtAmount) external view returns (
        address rewardTokenAddress,
        uint256 rewardTokenAmount,
        uint256 azcAmount,
        uint256 rewardTokenUsdValue,
        uint256 azcUsdValue
    ) {
        uint256 rewardTokenUsdtAmount = usdtAmount * originalTokenPercent / 100;
        uint256 azcTokenUsdtAmount = usdtAmount * azcTokenPercent / 100;
        
        if (stakingToken == address(0)) {
            // BNB staking
            return (
                address(0),
                convertUsdtToTokenAmount(address(0), rewardTokenUsdtAmount),
                convertUsdtToTokenAmount(azc, azcTokenUsdtAmount),
                rewardTokenUsdtAmount,
                azcTokenUsdtAmount
            );
        } else {
            address rewardToken = getRewardToken(stakingToken);
            return (
                rewardToken,
                convertUsdtToTokenAmount(stakingToken, rewardTokenUsdtAmount),
                convertUsdtToTokenAmount(azc, azcTokenUsdtAmount),
                rewardTokenUsdtAmount,
                azcTokenUsdtAmount
            );
        }
    }

    // Fallback function to receive BNB
    receive() external payable {}
} 