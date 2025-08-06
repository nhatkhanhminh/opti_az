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

// Member Contract Interface
interface IMemberContract {
    function getUplines(address user, uint256 levels) external view returns (address[] memory);
    function updateTeamVolume(address user, uint256 usdtAmount) external;
    function updateF1Volume(address user, uint256 usdtAmount) external;
    function getHighestUpline(address user) external view returns (address);
}

// Data Contract Interface
interface IDataContract {
    function addStake(address user, address token, uint256 amount, uint256 usdtValue, uint256 planId) external;
}

// Leader Share Contract Interface
interface ILeaderShareContract {
    function getShares(address leader) external view returns (address[] memory recipients, uint256[] memory percentages, uint256[] memory branchIds);
}

/**
 * @title AZCStaking
 * @dev Contract allows staking AZC token with fixed price that can be adjusted
 */
contract AZCStaking is Ownable, ReentrancyGuard {
    
    struct StakingPlan {
        uint256 id;
        uint256 minAmount;  // Minimum amount in USDT
        uint256 maxAmount;  // Maximum amount in USDT
        uint256 monthlyROI; // Monthly ROI percentage
        bool active;
    }

    struct BranchMatch {
        uint256 matchCount;
        uint256 deepestLevel;
        bool hasDirectF1;
    }

    // AZC Token address (will be set when deploy)
    address public immutable AZC_TOKEN;
    
    // Fixed AZC price (18 decimals) - default 1.5 USDT
    uint256 public azcPriceInUSDT = 1500000000000000000; // 1.5 * 10^18
    
    // Wallet addresses
    address public devWallet = 0x04442e27179b0a950542e572eE85da27F93DDB96;
    address public marketingWallet = 0x95C9f6edE067a4e1EFffEb7D766bEd6ed95eb3E7;
    address public multiWallet = 0xCeceC77B08ffc53aFDA7fE3AA00415d34CF9a8C7;
    address public poolWallet = 0x41a9C31A00d63A72E807624765E0b65B6E61BD1d;
    
    // Contract interfaces
    IMemberContract public memberContract = IMemberContract(0xBbaA0fB84386d80465994FaEA9d4e954CB45bC8d);
    IDataContract public dataContract = IDataContract(0xC2482a36E3d219E6358D2397D67310059f024cfC);
    ILeaderShareContract public leaderShareContract = ILeaderShareContract(0x7d9951A385263249f2014a66D40649229C41A2ca);

    // Staking plans
    mapping(uint256 => StakingPlan) public stakingPlans;
    uint256 public planIdCounter;

    // Fee percentages
    uint256 public devFeePercent = 2;
    uint256 public marketingFeePercent = 15;
    uint256 public leaderFeePercent = 33;
    uint256 public multiWalletFeePercent = 37;
    uint256 public referralLevelOnePercent = 6;
    uint256 public referralLevelTwoPercent = 1;
    uint256 public referralLevelThreePercent = 1;

    uint256 public uplineLevels = 15;

    // Events
    event StakingPlanCreated(uint256 indexed planId, uint256 minAmount, uint256 maxAmount, uint256 monthlyROI);
    event StakingPlanUpdated(uint256 indexed planId, uint256 minAmount, uint256 maxAmount, uint256 monthlyROI, bool active);
    event AZCPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event AZCStaked(address indexed user, uint256 amount, uint256 usdtValue, uint256 planId);
    event FeeDistributed(address indexed user, address indexed recipient, uint256 amount, string feeType);

    /**
     * @dev Constructor
     * @param _azcToken AZC token address
     */
    constructor(address _azcToken) Ownable(msg.sender) {
        require(_azcToken != address(0), "Invalid AZC token address");
        AZC_TOKEN = _azcToken;
        
        // start with 0 plans - admin will create plans after deploy
        planIdCounter = 0;
    }

    /**
     * @dev set AZC price (only owner)
     * @param _newPrice new price in USDT (18 decimals)
     */
    function setAZCPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        uint256 oldPrice = azcPriceInUSDT;
        azcPriceInUSDT = _newPrice;
        emit AZCPriceUpdated(oldPrice, _newPrice);
    }

    /**
     * @dev get current AZC price
     * @return AZC price in USDT (18 decimals)
     */
    function getAZCPrice() external view returns (uint256) {
        return azcPriceInUSDT;
    }

    /**
     * @dev convert AZC amount to USDT value
     * @param azcAmount amount of AZC (18 decimals)
     * @return USDT value (18 decimals)
     */
    function getAZCToUSDTValue(uint256 azcAmount) public view returns (uint256) {
        return (azcAmount * azcPriceInUSDT) / 10**18;
    }

    /**
     * @dev Stake AZC tokens
     * @param amount amount of AZC to stake
     * @param planId ID of staking plan
     */
    function stakeAZC(uint256 amount, uint256 planId) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(planId < planIdCounter, "Plan does not exist");
        require(stakingPlans[planId].active, "Plan is not active");
        
        // transfer AZC from user to contract
        IERC20(AZC_TOKEN).transferFrom(msg.sender, address(this), amount);
        
        // calculate USDT value
        uint256 usdtValue = getAZCToUSDTValue(amount);
        require(usdtValue >= stakingPlans[planId].minAmount, "Amount below plan minimum");
        require(usdtValue <= stakingPlans[planId].maxAmount, "Amount above plan maximum");
        
        // distribute fees
        distributeFees(amount);
        
        // save stake info
        dataContract.addStake(msg.sender, AZC_TOKEN, amount, usdtValue, planId);
        
        // update volume
        memberContract.updateTeamVolume(msg.sender, usdtValue);
        memberContract.updateF1Volume(msg.sender, usdtValue);
        
        emit AZCStaked(msg.sender, amount, usdtValue, planId);
    }

    /**
     * @dev distribute fees to wallets
     */
    function distributeFees(uint256 amount) private {
        uint256 remainingAmount = amount;

        // Dev fee
        uint256 devFee = (amount * devFeePercent) / 100;
        if (devFee > 0) {
            IERC20(AZC_TOKEN).transfer(devWallet, devFee);
            remainingAmount -= devFee;
            emit FeeDistributed(msg.sender, devWallet, devFee, "Dev");
        }

        // Marketing fee
        uint256 marketingFee = (amount * marketingFeePercent) / 100;
        if (marketingFee > 0) {
            IERC20(AZC_TOKEN).transfer(marketingWallet, marketingFee);
            remainingAmount -= marketingFee;
            emit FeeDistributed(msg.sender, marketingWallet, marketingFee, "Marketing");
        }

        // Multi wallet fee
        uint256 multiWalletFee = (amount * multiWalletFeePercent) / 100;
        if (multiWalletFee > 0) {
            IERC20(AZC_TOKEN).transfer(multiWallet, multiWalletFee);
            remainingAmount -= multiWalletFee;
            emit FeeDistributed(msg.sender, multiWallet, multiWalletFee, "MultiWallet");
        }

        // Leader fee
        uint256 leaderFee = (amount * leaderFeePercent) / 100;
        if (leaderFee > 0) {
            remainingAmount -= distributeLeaderFee(leaderFee);
        }

        // Referral fees
        address[] memory referralUplines = memberContract.getUplines(msg.sender, 3);
        
        // Level 1
        if (referralUplines.length > 0 && referralUplines[0] != address(0)) {
            uint256 level1Fee = (amount * referralLevelOnePercent) / 100;
            if (level1Fee > 0) {
                IERC20(AZC_TOKEN).transfer(referralUplines[0], level1Fee);
                remainingAmount -= level1Fee;
                emit FeeDistributed(msg.sender, referralUplines[0], level1Fee, "Referral-L1");
            }
        }
        
        // Level 2
        if (referralUplines.length > 1 && referralUplines[1] != address(0)) {
            uint256 level2Fee = (amount * referralLevelTwoPercent) / 100;
            if (level2Fee > 0) {
                IERC20(AZC_TOKEN).transfer(referralUplines[1], level2Fee);
                remainingAmount -= level2Fee;
                emit FeeDistributed(msg.sender, referralUplines[1], level2Fee, "Referral-L2");
            }
        }
        
        // Level 3
        if (referralUplines.length > 2 && referralUplines[2] != address(0)) {
            uint256 level3Fee = (amount * referralLevelThreePercent) / 100;
            if (level3Fee > 0) {
                IERC20(AZC_TOKEN).transfer(referralUplines[2], level3Fee);
                remainingAmount -= level3Fee;
                emit FeeDistributed(msg.sender, referralUplines[2], level3Fee, "Referral-L3");
            }
        }

        // Gửi phần còn lại vào pool wallet
        if (remainingAmount > 0) {
            IERC20(AZC_TOKEN).transfer(poolWallet, remainingAmount);
            emit FeeDistributed(msg.sender, poolWallet, remainingAmount, "Pool");
        }
    }

    /**
     * @dev distribute leader fee
     */
    function distributeLeaderFee(uint256 leaderFee) private returns (uint256) {
        address leader = memberContract.getHighestUpline(msg.sender);
        if (leader == address(0)) {
            IERC20(AZC_TOKEN).transfer(poolWallet, leaderFee);
            emit FeeDistributed(msg.sender, poolWallet, leaderFee, "Pool(Leader)");
            return leaderFee;
        }

        (address[] memory recipients, uint256[] memory percentages, uint256[] memory branchIds) = leaderShareContract.getShares(leader);
        if (recipients.length == 0) {
            IERC20(AZC_TOKEN).transfer(leader, leaderFee);
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        address[] memory uplines = memberContract.getUplines(msg.sender, uplineLevels);
        if (uplines.length == 0 || (uplines.length == 1 && uplines[0] == address(0))) {
            IERC20(AZC_TOKEN).transfer(leader, leaderFee);
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        uint256 branchIdToDistribute = findOptimalBranch(uplines, recipients, branchIds);
        if (branchIdToDistribute == 0) {
            IERC20(AZC_TOKEN).transfer(leader, leaderFee);
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        uint256 distributed = 0;
        uint256 leaderShare = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            if (branchIds[i] == branchIdToDistribute && isUplineOfUser(recipients[i], uplines)) {
                uint256 shareAmount = (leaderFee * percentages[i]) / 100;
                if (recipients[i] == leader) {
                    leaderShare = shareAmount;
                } else {
                    IERC20(AZC_TOKEN).transfer(recipients[i], shareAmount);
                    distributed += shareAmount;
                    emit FeeDistributed(msg.sender, recipients[i], shareAmount, "LeaderShare");
                }
            }
        }

        if (leaderShare > 0) {
            IERC20(AZC_TOKEN).transfer(leader, leaderShare);
            distributed += leaderShare;
            emit FeeDistributed(msg.sender, leader, leaderShare, "LeaderShare");
        }

        if (distributed < leaderFee) {
            uint256 remainingLeaderFee = leaderFee - distributed;
            IERC20(AZC_TOKEN).transfer(poolWallet, remainingLeaderFee);
            emit FeeDistributed(msg.sender, poolWallet, remainingLeaderFee, "Pool(LeaderRemainder)");
            distributed += remainingLeaderFee;
        }

        return distributed;
    }

    /**
     * @dev find optimal branch for fee distribution
     */
    function findOptimalBranch(
        address[] memory uplines,
        address[] memory recipients,
        uint256[] memory branchIds
    ) private pure returns (uint256) {
        if (recipients.length == 0 || uplines.length == 0) return 0;

        uint256 uniqueBranchCount = 0;
        BranchMatch[50] memory branchMatches;
        uint256[] memory uniqueBranchIds = new uint256[](recipients.length);
        
        // Step 1: Identify unique branch IDs
        for (uint256 i = 0; i < recipients.length; i++) {
            bool exists = false;
            for (uint256 j = 0; j < uniqueBranchCount; j++) {
                if (uniqueBranchIds[j] == branchIds[i]) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                uniqueBranchIds[uniqueBranchCount] = branchIds[i];
                branchMatches[uniqueBranchCount] = BranchMatch(0, 0, false);
                uniqueBranchCount++;
            }
        }
        
        // Step 2: Analyze each branch
        for (uint256 branchIdx = 0; branchIdx < uniqueBranchCount; branchIdx++) {
            uint256 branchId = uniqueBranchIds[branchIdx];
            
            for (uint256 uplineIdx = 0; uplineIdx < uplines.length; uplineIdx++) {
                address upline = uplines[uplineIdx];
                
                for (uint256 recipIdx = 0; recipIdx < recipients.length; recipIdx++) {
                    if (recipients[recipIdx] == upline && branchIds[recipIdx] == branchId) {
                        branchMatches[branchIdx].matchCount++;
                        
                        if (uplineIdx < branchMatches[branchIdx].deepestLevel || branchMatches[branchIdx].deepestLevel == 0) {
                            branchMatches[branchIdx].deepestLevel = uplineIdx;
                        }
                        
                        if (uplineIdx == 0) {
                            branchMatches[branchIdx].hasDirectF1 = true;
                        }
                    }
                }
            }
        }
        
        // Step 3: Select optimal branch
        uint256 bestBranchIndex = 0;
        bool foundValidBranch = false;
        uint256 bestDepth = 999;
        uint256 bestMatchCount = 0;
        
        for (uint256 i = 0; i < uniqueBranchCount; i++) {
            if (branchMatches[i].matchCount == 0) continue;
            
            if (!foundValidBranch) {
                bestBranchIndex = i;
                bestDepth = branchMatches[i].deepestLevel;
                bestMatchCount = branchMatches[i].matchCount;
                foundValidBranch = true;
            } else {
                if (branchMatches[i].deepestLevel < bestDepth) {
                    bestBranchIndex = i;
                    bestDepth = branchMatches[i].deepestLevel;
                    bestMatchCount = branchMatches[i].matchCount;
                }
                else if (branchMatches[i].deepestLevel == bestDepth && 
                        branchMatches[i].matchCount > bestMatchCount) {
                    bestBranchIndex = i;
                    bestMatchCount = branchMatches[i].matchCount;
                }
            }
        }
        
        return uniqueBranchIds[bestBranchIndex];
    }

    /**
     * @dev check if address is upline of user
     */
    function isUplineOfUser(address recipient, address[] memory uplines) private pure returns (bool) {
        for (uint256 i = 0; i < uplines.length; i++) {
            if (uplines[i] == recipient) {
                return true;
            }
        }
        return false;
    }

    // ========================= VIEW FUNCTIONS =========================

    /**
     * @dev get all staking plans
     * @return plans array of staking plans
     */
    function getAllStakingPlans() external view returns (StakingPlan[] memory plans) {
        plans = new StakingPlan[](planIdCounter);
        for (uint256 i = 0; i < planIdCounter; i++) {
            plans[i] = stakingPlans[i];
        }
        return plans;
    }

    /**
     * @dev get number of staking plans
     * @return number of plans
     */
    function getStakingPlansCount() external view returns (uint256) {
        return planIdCounter;
    }

    /**
     * @dev check if plan is active
     * @param planId ID of plan
     * @return True if plan is active
     */
    function isPlanActive(uint256 planId) external view returns (bool) {
        require(planId < planIdCounter, "Plan does not exist");
        return stakingPlans[planId].active;
    }

    // ========================= ADMIN FUNCTIONS =========================

    /**
     * @dev create staking plan
     */
    function createStakingPlan(uint256 minAmount, uint256 maxAmount, uint256 monthlyROI) external onlyOwner {
        require(minAmount > 0, "Min amount must be greater than 0");
        require(maxAmount >= minAmount, "Max amount must be greater than or equal to min amount");
        require(monthlyROI > 0, "ROI must be greater than 0");
        
        uint256 planId = planIdCounter++;
        stakingPlans[planId] = StakingPlan({
            id: planId, 
            minAmount: minAmount, 
            maxAmount: maxAmount, 
            monthlyROI: monthlyROI, 
            active: true
        });
        emit StakingPlanCreated(planId, minAmount, maxAmount, monthlyROI);
    }

    /**
     * @dev create multiple staking plans at once
     * @param minAmounts array of minimum amounts
     * @param maxAmounts array of maximum amounts  
     * @param monthlyROIs array of monthly ROI
     */
    function createMultipleStakingPlans(
        uint256[] calldata minAmounts,
        uint256[] calldata maxAmounts,
        uint256[] calldata monthlyROIs
    ) external onlyOwner {
        require(minAmounts.length == maxAmounts.length && 
                maxAmounts.length == monthlyROIs.length, 
                "Arrays length mismatch");
        require(minAmounts.length > 0, "At least one plan required");
        
        for (uint256 i = 0; i < minAmounts.length; i++) {
            require(minAmounts[i] > 0, "Min amount must be greater than 0");
            require(maxAmounts[i] >= minAmounts[i], "Max amount must be greater than or equal to min amount");
            require(monthlyROIs[i] > 0, "ROI must be greater than 0");
            
            uint256 planId = planIdCounter++;
            stakingPlans[planId] = StakingPlan({
                id: planId,
                minAmount: minAmounts[i],
                maxAmount: maxAmounts[i],
                monthlyROI: monthlyROIs[i],
                active: true
            });
            emit StakingPlanCreated(planId, minAmounts[i], maxAmounts[i], monthlyROIs[i]);
        }
    }

    /**
     * @dev update staking plan
     */
    function updateStakingPlan(uint256 planId, uint256 minAmount, uint256 maxAmount, uint256 monthlyROI, bool active) external onlyOwner {
        require(planId < planIdCounter, "Plan does not exist");
        require(minAmount > 0, "Min amount must be greater than 0");
        require(maxAmount >= minAmount, "Max amount must be greater than or equal to min amount");
        require(monthlyROI > 0, "ROI must be greater than 0");
        
        StakingPlan storage plan = stakingPlans[planId];
        plan.minAmount = minAmount;
        plan.maxAmount = maxAmount;
        plan.monthlyROI = monthlyROI;
        plan.active = active;
        emit StakingPlanUpdated(planId, minAmount, maxAmount, monthlyROI, active);
    }

    /**
     * @dev update minimum amount for all plans
     * @param _newMinAmount new minimum amount (USDT, 18 decimals)
     */
    function updateAllPlansMinAmount(uint256 _newMinAmount) external onlyOwner {
        require(_newMinAmount > 0, "Min amount must be greater than 0");
        
        for (uint256 i = 0; i < planIdCounter; i++) {
            if (stakingPlans[i].active) {
                stakingPlans[i].minAmount = _newMinAmount;
                emit StakingPlanUpdated(
                    i, 
                    stakingPlans[i].minAmount, 
                    stakingPlans[i].maxAmount, 
                    stakingPlans[i].monthlyROI, 
                    stakingPlans[i].active
                );
            }
        }
    }

    /**
     * @dev activate/deactivate staking plan
     * @param planId ID of plan
     * @param active True to activate, false to deactivate
     */
    function toggleStakingPlan(uint256 planId, bool active) external onlyOwner {
        require(planId < planIdCounter, "Plan does not exist");
        
        stakingPlans[planId].active = active;
        emit StakingPlanUpdated(
            planId, 
            stakingPlans[planId].minAmount, 
            stakingPlans[planId].maxAmount, 
            stakingPlans[planId].monthlyROI, 
            active
        );
    }

    /**
     * @dev update ROI of a specific plan
     * @param planId ID of plan
     * @param newROI new ROI (example: 120 = 12%)
     */
    function updatePlanROI(uint256 planId, uint256 newROI) external onlyOwner {
        require(planId < planIdCounter, "Plan does not exist");
        require(newROI > 0, "ROI must be greater than 0");
        
        stakingPlans[planId].monthlyROI = newROI;
        emit StakingPlanUpdated(
            planId, 
            stakingPlans[planId].minAmount, 
            stakingPlans[planId].maxAmount, 
            newROI, 
            stakingPlans[planId].active
        );
    }

    /**
     * @dev update minimum amount of a specific plan
     * @param planId ID of plan
     * @param newMinAmount new minimum amount (USDT, 18 decimals)
     */
    function updatePlanMinAmount(uint256 planId, uint256 newMinAmount) external onlyOwner {
        require(planId < planIdCounter, "Plan does not exist");
        require(newMinAmount > 0, "Min amount must be greater than 0");
        
        stakingPlans[planId].minAmount = newMinAmount;
        emit StakingPlanUpdated(
            planId, 
            newMinAmount, 
            stakingPlans[planId].maxAmount, 
            stakingPlans[planId].monthlyROI, 
            stakingPlans[planId].active
        );
    }

    /**
     * @dev update fee percentages
     */
    function updateFeePercentages(
        uint256 _devFeePercent,
        uint256 _marketingFeePercent,
        uint256 _multiWalletFeePercent,
        uint256 _leaderFeePercent,
        uint256 _referralLevelOnePercent,
        uint256 _referralLevelTwoPercent,
        uint256 _referralLevelThreePercent
    ) external onlyOwner {
        require(_devFeePercent + _marketingFeePercent + _leaderFeePercent +
                _referralLevelOnePercent + _referralLevelTwoPercent + _referralLevelThreePercent <= 100,
                "Total fees cannot exceed 100%");
        
        devFeePercent = _devFeePercent;
        marketingFeePercent = _marketingFeePercent;
        multiWalletFeePercent = _multiWalletFeePercent;
        leaderFeePercent = _leaderFeePercent;
        referralLevelOnePercent = _referralLevelOnePercent;
        referralLevelTwoPercent = _referralLevelTwoPercent;
        referralLevelThreePercent = _referralLevelThreePercent;
    }

    /**
     * @dev upadte contract addresses
     */
    function setMemberContract(address _memberContract) external onlyOwner {
        require(_memberContract != address(0), "Invalid address");
        memberContract = IMemberContract(_memberContract);
    }

    function setDataContract(address _dataContract) external onlyOwner {
        require(_dataContract != address(0), "Invalid address");
        dataContract = IDataContract(_dataContract);
    }

    function setLeaderShareContract(address _leaderShareContract) external onlyOwner {
        require(_leaderShareContract != address(0), "Invalid address");
        leaderShareContract = ILeaderShareContract(_leaderShareContract);
    }

    /**
     * @dev update wallet addresses
     */
    function setWallets(
        address _devWallet,
        address _marketingWallet,
        address _multiWallet,
        address _poolWallet
    ) external onlyOwner {
        require(_devWallet != address(0), "Invalid dev wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_multiWallet != address(0), "Invalid multi wallet");
        require(_poolWallet != address(0), "Invalid pool wallet");
        
        devWallet = _devWallet;
        marketingWallet = _marketingWallet;
        multiWallet = _multiWallet;
        poolWallet = _poolWallet;
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Use emergencyWithdrawETH for ETH");
        IERC20(token).transfer(owner(), amount);
    }

    function emergencyWithdrawETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    // Receive ETH
    receive() external payable {}
} 