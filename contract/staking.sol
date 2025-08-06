// SPDX-License-Identifier: MIT
// File: @openzeppelin/contracts/token/ERC20/IERC20.sol
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
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

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: @openzeppelin/contracts/security/ReentrancyGuard.sol


// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// File: @chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol


pragma solidity ^0.8.0;

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(
    uint80 _roundId
  ) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);

  function latestRoundData()
    external
    view
    returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

// File: staking/staking_23_3.sol


pragma solidity ^0.8.0;





interface IMemberContract {
    function getUpline(address member) external view returns (address);
    function getUplines(address member, uint256 levels) external view returns (address[] memory);
    function getHighestUpline(address member) external view returns (address);
    function isLeader(address member) external view returns (bool);
    function updateTeamVolume(address member, uint256 amount) external;
    function updateF1Volume(address member, uint256 amount) external;
    function getDirectDownlines(address member) external view returns (address[] memory);
}

interface ILeaderShareContract {
    function getShares(address leader) external view returns (address[] memory recipients, uint256[] memory percentages, uint256[] memory branchIds);
    function setLeaderShareDetails(address leader, address[] calldata recipients, uint256[] calldata percentages, uint256 branchId) external;
}

interface IDataContract {
    function addStake(address user, address token, uint256 amount, uint256 usdtAmount, uint256 planId) external returns (uint256);
}

contract AZCoinStaking is Ownable, ReentrancyGuard {
    struct StakingPlan {
        uint256 id;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 monthlyROI;
        bool active;
    }

    struct BranchMatch {
        uint256 matchCount;
        uint256 deepestLevel;
        bool hasDirectF1;
    }

    address public constant USDT = 0x55d398326f99059fF775485246999027B3197955;
    mapping(address => AggregatorV3Interface) public tokenPriceFeeds;

    address public devWallet = 0x04442e27179b0a950542e572eE85da27F93DDB96;
    address public marketingWallet = 0x95C9f6edE067a4e1EFffEb7D766bEd6ed95eb3E7;
    address public multiWallet = 0xCeceC77B08ffc53aFDA7fE3AA00415d34CF9a8C7;
    address public poolWallet = 0x41a9C31A00d63A72E807624765E0b65B6E61BD1d;
    IMemberContract public memberContract = IMemberContract(0xBbaA0fB84386d80465994FaEA9d4e954CB45bC8d);
    IDataContract public dataContract = IDataContract(0xC2482a36E3d219E6358D2397D67310059f024cfC);
    ILeaderShareContract public leaderShareContract = ILeaderShareContract(0x7d9951A385263249f2014a66D40649229C41A2ca);

    mapping(uint256 => StakingPlan) public stakingPlans;
    mapping(address => bool) public supportedTokens;

    uint256 public devFeePercent = 2;
    uint256 public marketingFeePercent = 15;
    uint256 public leaderFeePercent = 33;
    uint256 public multiWalletFeePercent = 37;
    uint256 public referralLevelOnePercent = 6;
    uint256 public referralLevelTwoPercent = 1;
    uint256 public referralLevelThreePercent = 1;

    uint256 public planIdCounter;
    uint256 public uplineLevels = 15;

    event StakingPlanCreated(uint256 indexed planId, uint256 minAmount, uint256 maxAmount, uint256 monthlyROI);
    event StakingPlanUpdated(uint256 indexed planId, uint256 minAmount, uint256 maxAmount, uint256 monthlyROI, bool active);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event Staked(address indexed user, address indexed token, uint256 amount, uint256 usdtValue, uint256 planId);
    event FeeDistributed(address indexed user, address indexed recipient, uint256 amount, string feeType);

    constructor() Ownable(msg.sender) {
        address _bnbUsdPriceFeed = 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE;
        supportedTokens[address(0)] = true;
        tokenPriceFeeds[address(0)] = AggregatorV3Interface(_bnbUsdPriceFeed);
        supportedTokens[USDT] = true;
    }

    function setWallet(address _poolWallet) external onlyOwner {
        require(_poolWallet != address(0), "Invalid wallet address");
        poolWallet = _poolWallet;
    }

    function setLeaderShareContract(address _leaderShareContract) external onlyOwner {
        require(_leaderShareContract != address(0), "Invalid LeaderShareContract address");
        leaderShareContract = ILeaderShareContract(_leaderShareContract);
    }

    function setUplineLevels(uint256 _levels) external onlyOwner {
        require(_levels > 0, "Levels must be greater than 0");
        uplineLevels = _levels;
    }

    function createStakingPlan(uint256 minAmount, uint256 maxAmount, uint256 monthlyROI) external onlyOwner {
        require(minAmount > 0, "Min amount must be greater than 0");
        require(maxAmount > minAmount, "Max amount must be greater than min amount");
        require(monthlyROI > 0, "ROI must be greater than 0");
        
        uint256 planId = planIdCounter++;
        stakingPlans[planId] = StakingPlan({id: planId, minAmount: minAmount, maxAmount: maxAmount, monthlyROI: monthlyROI, active: true});
        emit StakingPlanCreated(planId, minAmount, maxAmount, monthlyROI);
    }

    function updateStakingPlan(uint256 planId, uint256 minAmount, uint256 maxAmount, uint256 monthlyROI, bool active) external onlyOwner {
        require(planId < planIdCounter, "Plan does not exist");
        require(minAmount > 0, "Min amount must be greater than 0");
        require(maxAmount > minAmount, "Max amount must be greater than min amount");
        require(monthlyROI > 0, "ROI must be greater than 0");
        
        StakingPlan storage plan = stakingPlans[planId];
        plan.minAmount = minAmount;
        plan.maxAmount = maxAmount;
        plan.monthlyROI = monthlyROI;
        plan.active = active;
        emit StakingPlanUpdated(planId, minAmount, maxAmount, monthlyROI, active);
    }

    function addSupportedToken(address token, address priceFeed) external onlyOwner {
        require(token != address(0), "Cannot add zero address");
        require(!supportedTokens[token], "Token already supported");
        require(priceFeed != address(0), "Invalid price feed address");
        
        supportedTokens[token] = true;
        tokenPriceFeeds[token] = AggregatorV3Interface(priceFeed);
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Cannot remove BNB");
        require(token != USDT, "Cannot remove USDT");
        require(supportedTokens[token], "Token not supported");
        
        supportedTokens[token] = false;
        delete tokenPriceFeeds[token];
        emit TokenRemoved(token);
    }

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

    function stake(address token, uint256 amount, uint256 planId) external nonReentrant {
        require(token != address(0), "Use stakeBNB for BNB");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(planId < planIdCounter, "Plan does not exist");
        require(stakingPlans[planId].active, "Plan is not active");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        uint256 usdtValue = getTokenToUsdtValue(token, amount);
        require(usdtValue >= stakingPlans[planId].minAmount, "Amount below plan minimum");
        require(usdtValue <= stakingPlans[planId].maxAmount, "Amount above plan maximum");
        
        distributeFees(token, amount);
        dataContract.addStake(msg.sender, token, amount, usdtValue, planId);
        memberContract.updateTeamVolume(msg.sender, usdtValue);
        memberContract.updateF1Volume(msg.sender, usdtValue);
        
        emit Staked(msg.sender, token, amount, usdtValue, planId);
    }

    function stakeBNB(uint256 planId) external payable nonReentrant {
        uint256 amount = msg.value;
        require(amount > 0, "Amount must be greater than 0");
        require(planId < planIdCounter, "Plan does not exist");
        require(stakingPlans[planId].active, "Plan is not active");
        
        uint256 usdtValue = getTokenToUsdtValue(address(0), amount);
        require(usdtValue >= stakingPlans[planId].minAmount, "Amount below plan minimum");
        require(usdtValue <= stakingPlans[planId].maxAmount, "Amount above plan maximum");
        
        distributeBNBFees(amount);
        dataContract.addStake(msg.sender, address(0), amount, usdtValue, planId);
        memberContract.updateTeamVolume(msg.sender, usdtValue);
        memberContract.updateF1Volume(msg.sender, usdtValue);
        
        emit Staked(msg.sender, address(0), amount, usdtValue, planId);
    }

    function distributeFees(address token, uint256 amount) private {
        uint256 remainingAmount = amount;

        uint256 devFee = (amount * devFeePercent) / 100;
        if (devFee > 0) {
            IERC20(token).transfer(devWallet, devFee);
            remainingAmount -= devFee;
            emit FeeDistributed(msg.sender, devWallet, devFee, "Dev");
        }

        uint256 marketingFee = (amount * marketingFeePercent) / 100;
        if (marketingFee > 0) {
            IERC20(token).transfer(marketingWallet, marketingFee);
            remainingAmount -= marketingFee;
            emit FeeDistributed(msg.sender, marketingWallet, marketingFee, "Marketing");
        }

        uint256 multiWalletFee = (amount * multiWalletFeePercent) / 100;
        if (multiWalletFee > 0) {
            IERC20(token).transfer(multiWallet, multiWalletFee);
            remainingAmount -= multiWalletFee;
            emit FeeDistributed(msg.sender, multiWallet, multiWalletFee, "MultiWallet");
        }

        uint256 leaderFee = (amount * leaderFeePercent) / 100;
        if (leaderFee > 0) {
            remainingAmount -= distributeLeaderFee(token, leaderFee);
        }

        address[] memory referralUplines = memberContract.getUplines(msg.sender, 3);
        if (referralUplines.length > 0 && referralUplines[0] != address(0)) {
            uint256 level1Fee = (amount * referralLevelOnePercent) / 100;
            if (level1Fee > 0) {
                IERC20(token).transfer(referralUplines[0], level1Fee);
                remainingAmount -= level1Fee;
                emit FeeDistributed(msg.sender, referralUplines[0], level1Fee, "Referral-L1");
            }
        }
        if (referralUplines.length > 1 && referralUplines[1] != address(0)) {
            uint256 level2Fee = (amount * referralLevelTwoPercent) / 100;
            if (level2Fee > 0) {
                IERC20(token).transfer(referralUplines[1], level2Fee);
                remainingAmount -= level2Fee;
                emit FeeDistributed(msg.sender, referralUplines[1], level2Fee, "Referral-L2");
            }
        }
        if (referralUplines.length > 2 && referralUplines[2] != address(0)) {
            uint256 level3Fee = (amount * referralLevelThreePercent) / 100;
            if (level3Fee > 0) {
                IERC20(token).transfer(referralUplines[2], level3Fee);
                remainingAmount -= level3Fee;
                emit FeeDistributed(msg.sender, referralUplines[2], level3Fee, "Referral-L3");
            }
        }

        if (remainingAmount > 0) {
            IERC20(token).transfer(poolWallet, remainingAmount);
            emit FeeDistributed(msg.sender, poolWallet, remainingAmount, "Pool");
        }
    }

    // Distribute leader fee and return the amount distributed
    function distributeLeaderFee(address token, uint256 leaderFee) private returns (uint256) {
        address leader = memberContract.getHighestUpline(msg.sender);
        if (leader == address(0)) {
            IERC20(token).transfer(poolWallet, leaderFee);
            emit FeeDistributed(msg.sender, poolWallet, leaderFee, "Pool(Leader)");
            return leaderFee;
        }

        (address[] memory recipients, uint256[] memory percentages, uint256[] memory branchIds) = leaderShareContract.getShares(leader);
        if (recipients.length == 0) {
            // If no branch configured, Leader receives 33%
            IERC20(token).transfer(leader, leaderFee);
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        // Get the user's upline list
        address[] memory uplines = memberContract.getUplines(msg.sender, uplineLevels);
        if (uplines.length == 0 || (uplines.length == 1 && uplines[0] == address(0))) {
            // User has no valid uplines
            IERC20(token).transfer(leader, leaderFee);
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        // Find optimal branch based on the closest upline
        uint256 branchIdToDistribute = findOptimalBranch(uplines, recipients, branchIds);
        if (branchIdToDistribute == 0) {
            // No suitable branch found, Leader gets everything
            IERC20(token).transfer(leader, leaderFee);
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        // Distribute according to the chosen branch
        uint256 distributed = 0;
        uint256 leaderShare = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            if (branchIds[i] == branchIdToDistribute && isUplineOfUser(recipients[i], uplines)) {
                uint256 shareAmount = (leaderFee * percentages[i]) / 100;
                if (recipients[i] == leader) {
                    leaderShare = shareAmount;
                } else {
                    IERC20(token).transfer(recipients[i], shareAmount);
                    distributed += shareAmount;
                    emit FeeDistributed(msg.sender, recipients[i], shareAmount, "LeaderShare");
                }
            }
        }

        if (leaderShare > 0) {
            IERC20(token).transfer(leader, leaderShare);
            distributed += leaderShare;
            emit FeeDistributed(msg.sender, leader, leaderShare, "LeaderShare");
        }

        if (distributed < leaderFee) {
            uint256 remainingLeaderFee = leaderFee - distributed;
            IERC20(token).transfer(poolWallet, remainingLeaderFee);
            emit FeeDistributed(msg.sender, poolWallet, remainingLeaderFee, "Pool(LeaderRemainder)");
            distributed += remainingLeaderFee;
        }

        return distributed;
    }

    function distributeBNBFees(uint256 amount) private {
        uint256 remainingAmount = amount;
        require(address(this).balance >= amount, "Insufficient contract balance");

        uint256 devFee = (amount * devFeePercent) / 100;
        if (devFee > 0 && remainingAmount >= devFee) {
            (bool success, ) = devWallet.call{value: devFee}("");
            require(success, "Transfer to devWallet failed.");
            remainingAmount -= devFee;
            emit FeeDistributed(msg.sender, devWallet, devFee, "Dev");
        }

        uint256 marketingFee = (amount * marketingFeePercent) / 100;
        if (marketingFee > 0 && remainingAmount >= marketingFee) {
            (bool success, ) = marketingWallet.call{value: marketingFee}("");
            require(success, "Transfer to marketingWallet failed.");
            remainingAmount -= marketingFee;
            emit FeeDistributed(msg.sender, marketingWallet, marketingFee, "Marketing");
        }

        uint256 multiWalletFee = (amount * multiWalletFeePercent) / 100;
        if (multiWalletFee > 0 && remainingAmount >= multiWalletFee) {
            (bool success, ) = multiWallet.call{value: multiWalletFee}("");
            require(success, "Transfer to multiWallet failed.");
            remainingAmount -= multiWalletFee;
            emit FeeDistributed(msg.sender, multiWallet, multiWalletFee, "MultiWallet");
        }

        uint256 leaderFee = (amount * leaderFeePercent) / 100;
        if (leaderFee > 0 && remainingAmount >= leaderFee) {
            remainingAmount -= distributeBNBLeaderFee(leaderFee);
        }

        address[] memory referralUplines = memberContract.getUplines(msg.sender, 3);
        if (referralUplines.length > 0 && referralUplines[0] != address(0)) {
            uint256 level1Fee = (amount * referralLevelOnePercent) / 100;
            if (level1Fee > 0 && remainingAmount >= level1Fee) {
                (bool success, ) = referralUplines[0].call{value: level1Fee}("");
                require(success, "Transfer to level 1 upline failed.");
                remainingAmount -= level1Fee;
                emit FeeDistributed(msg.sender, referralUplines[0], level1Fee, "Referral-L1");
            }
        }
        if (referralUplines.length > 1 && referralUplines[1] != address(0)) {
            uint256 level2Fee = (amount * referralLevelTwoPercent) / 100;
            if (level2Fee > 0 && remainingAmount >= level2Fee) {
                (bool success, ) = referralUplines[1].call{value: level2Fee}("");
                require(success, "Transfer to level 2 upline failed.");
                remainingAmount -= level2Fee;
                emit FeeDistributed(msg.sender, referralUplines[1], level2Fee, "Referral-L2");
            }
        }
        if (referralUplines.length > 2 && referralUplines[2] != address(0)) {
            uint256 level3Fee = (amount * referralLevelThreePercent) / 100;
            if (level3Fee > 0 && remainingAmount >= level3Fee) {
                (bool success, ) = referralUplines[2].call{value: level3Fee}("");
                require(success, "Transfer to level 3 upline failed.");
                remainingAmount -= level3Fee;
                emit FeeDistributed(msg.sender, referralUplines[2], level3Fee, "Referral-L3");
            }
        }

        if (remainingAmount > 0) {
            (bool success, ) = poolWallet.call{value: remainingAmount}("");
            require(success, "Transfer to poolWallet failed.");
            emit FeeDistributed(msg.sender, poolWallet, remainingAmount, "Pool");
        }
    }

    // Distribute leader fee for BNB and return the amount distributed
    function distributeBNBLeaderFee(uint256 leaderFee) private returns (uint256) {
        address leader = memberContract.getHighestUpline(msg.sender);
        if (leader == address(0)) {
            (bool success, ) = poolWallet.call{value: leaderFee}("");
            require(success, "Transfer to poolWallet failed.");
            emit FeeDistributed(msg.sender, poolWallet, leaderFee, "Pool(Leader)");
            return leaderFee;
        }

        (address[] memory recipients, uint256[] memory percentages, uint256[] memory branchIds) = leaderShareContract.getShares(leader);
        if (recipients.length == 0) {
            // If no branch configured, Leader receives 33%
            (bool success, ) = leader.call{value: leaderFee}("");
            require(success, "Transfer to Leader failed.");
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        // Get the user's upline list
        address[] memory uplines = memberContract.getUplines(msg.sender, uplineLevels);
        if (uplines.length == 0 || (uplines.length == 1 && uplines[0] == address(0))) {
            // User has no valid uplines
            (bool success, ) = leader.call{value: leaderFee}("");
            require(success, "Transfer to Leader failed.");
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        // Find optimal branch based on the closest upline
        uint256 branchIdToDistribute = findOptimalBranch(uplines, recipients, branchIds);
        if (branchIdToDistribute == 0) {
            // No suitable branch found, Leader gets everything
            (bool success, ) = leader.call{value: leaderFee}("");
            require(success, "Transfer to Leader failed.");
            emit FeeDistributed(msg.sender, leader, leaderFee, "Leader");
            return leaderFee;
        }

        // Distribute according to the chosen branch
        uint256 distributed = 0;
        uint256 leaderShare = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            if (branchIds[i] == branchIdToDistribute && isUplineOfUser(recipients[i], uplines)) {
                uint256 shareAmount = (leaderFee * percentages[i]) / 100;
                if (recipients[i] == leader) {
                    leaderShare = shareAmount;
                } else {
                    (bool success, ) = recipients[i].call{value: shareAmount}("");
                    require(success, "Transfer to recipient failed.");
                    distributed += shareAmount;
                    emit FeeDistributed(msg.sender, recipients[i], shareAmount, "LeaderShare");
                }
            }
        }

        if (leaderShare > 0) {
            (bool success, ) = leader.call{value: leaderShare}("");
            require(success, "Transfer to Leader failed.");
            distributed += leaderShare;
            emit FeeDistributed(msg.sender, leader, leaderShare, "LeaderShare");
        }

        if (distributed < leaderFee) {
            uint256 remainingLeaderFee = leaderFee - distributed;
            (bool success, ) = poolWallet.call{value: remainingLeaderFee}("");
            require(success, "Transfer remaining to poolWallet failed.");
            emit FeeDistributed(msg.sender, poolWallet, remainingLeaderFee, "Pool(LeaderRemainder)");
            distributed += remainingLeaderFee;
        }

        return distributed;
    }

    function findOptimalBranch(
        address[] memory uplines, 
        address[] memory recipients, 
        uint256[] memory branchIds
    ) private pure returns (uint256) {
        if (recipients.length == 0) return 0;

        BranchMatch[] memory branchMatches = new BranchMatch[](recipients.length);
        uint256 uniqueBranchCount = 0;
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
        
        // Step 2: Analyze each branch to find the closest upline to the user
        // IMPORTANT: uplines[0] is the closest upline to the user (F1)
        // Lower indices mean uplines are closer to the user
        for (uint256 branchIdx = 0; branchIdx < uniqueBranchCount; branchIdx++) {
            uint256 branchId = uniqueBranchIds[branchIdx];
            
            // Go through all user's uplines, starting from the closest
            for (uint256 uplineIdx = 0; uplineIdx < uplines.length; uplineIdx++) {
                address upline = uplines[uplineIdx];
                
                // Check if this upline belongs to the current branch
                for (uint256 recipIdx = 0; recipIdx < recipients.length; recipIdx++) {
                    if (recipients[recipIdx] == upline && branchIds[recipIdx] == branchId) {
                        branchMatches[branchIdx].matchCount++;
                        
                        // Store the index of the closest upline in this branch
                        // Lower indices mean closer to user
                        if (uplineIdx < branchMatches[branchIdx].deepestLevel || branchMatches[branchIdx].deepestLevel == 0) {
                            branchMatches[branchIdx].deepestLevel = uplineIdx;
                        }
                        
                        // Mark if this is a direct F1
                        if (uplineIdx == 0) {
                            branchMatches[branchIdx].hasDirectF1 = true;
                        }
                    }
                }
            }
        }
        
        // Step 3: Select the optimal branch - prioritize branch with closest upline to user
        uint256 bestBranchIndex = 0;
        bool foundValidBranch = false;
        uint256 bestDepth = 999; // Start with high value, lower is better
        uint256 bestMatchCount = 0;
        
        for (uint256 i = 0; i < uniqueBranchCount; i++) {
            // Skip branches with no matching uplines
            if (branchMatches[i].matchCount == 0) continue;
            
            // Mark that we found a valid branch
            if (!foundValidBranch) {
                bestBranchIndex = i;
                bestDepth = branchMatches[i].deepestLevel;
                bestMatchCount = branchMatches[i].matchCount;
                foundValidBranch = true;
            } else {
                // Priority 1: Choose branch with closest upline to user (lowest deepestLevel)
                if (branchMatches[i].deepestLevel < bestDepth) {
                    bestBranchIndex = i;
                    bestDepth = branchMatches[i].deepestLevel;
                    bestMatchCount = branchMatches[i].matchCount;
                }
                // Priority 2: If same depth, choose branch with more matching uplines
                else if (branchMatches[i].deepestLevel == bestDepth && 
                        branchMatches[i].matchCount > bestMatchCount) {
                    bestBranchIndex = i;
                    bestMatchCount = branchMatches[i].matchCount;
                }
            }
        }
        
        return uniqueBranchIds[bestBranchIndex];
    }

    function isUplineOfUser(address recipient, address[] memory uplines) private pure returns (bool) {
        for (uint256 i = 0; i < uplines.length; i++) {
            if (uplines[i] == recipient) {
                return true;
            }
        }
        return false;
    }

    function getTokenToUsdtValue(address token, uint256 amount) public view returns (uint256) {
        if (token == USDT) {
            return amount;
        }
        
        AggregatorV3Interface priceFeed = tokenPriceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not set for token");

        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price from Oracle");

        uint256 priceIn18Decimals = uint256(price) * 10**10;
        uint256 usdtValue = (amount * priceIn18Decimals) / 10**18;

        return usdtValue;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    receive() external payable {}
}