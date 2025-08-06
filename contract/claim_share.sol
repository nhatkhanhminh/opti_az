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

// File: @openzeppelin/contracts/access/IAccessControl.sol


// OpenZeppelin Contracts (last updated v5.1.0) (access/IAccessControl.sol)

pragma solidity ^0.8.20;

/**
 * @dev External interface of AccessControl declared to support ERC-165 detection.
 */
interface IAccessControl {
    /**
     * @dev The `account` is missing a role.
     */
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    /**
     * @dev The caller of a function is not the expected one.
     *
     * NOTE: Don't confuse with {AccessControlUnauthorizedAccount}.
     */
    error AccessControlBadConfirmation();

    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted signaling this.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call. This account bears the admin role (for the granted role).
     * Expected in cases where the role was granted using the internal {AccessControl-_grantRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     */
    function renounceRole(bytes32 role, address callerConfirmation) external;
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

// File: @openzeppelin/contracts/utils/introspection/IERC165.sol


// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/IERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File: @openzeppelin/contracts/utils/introspection/ERC165.sol


// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/ERC165.sol)

pragma solidity ^0.8.20;


/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC-165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 */
abstract contract ERC165 is IERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

// File: @openzeppelin/contracts/access/AccessControl.sol


// OpenZeppelin Contracts (last updated v5.0.0) (access/AccessControl.sol)

pragma solidity ^0.8.20;




/**
 * @dev Contract module that allows children to implement role-based access
 * control mechanisms. This is a lightweight version that doesn't allow enumerating role
 * members except through off-chain means by accessing the contract event logs. Some
 * applications may benefit from on-chain enumerability, for those cases see
 * {AccessControlEnumerable}.
 *
 * Roles are referred to by their `bytes32` identifier. These should be exposed
 * in the external API and be unique. The best way to achieve this is by
 * using `public constant` hash digests:
 *
 * ```solidity
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```solidity
 * function foo() public {
 *     require(hasRole(MY_ROLE, msg.sender));
 *     ...
 * }
 * ```
 *
 * Roles can be granted and revoked dynamically via the {grantRole} and
 * {revokeRole} functions. Each role has an associated admin role, and only
 * accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 *
 * By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 * that only accounts with this role will be able to grant or revoke other
 * roles. More complex role relationships can be created by using
 * {_setRoleAdmin}.
 *
 * WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 * grant and revoke this role. Extra precautions should be taken to secure
 * accounts that have been granted it. We recommend using {AccessControlDefaultAdminRules}
 * to enforce additional security measures for this role.
 */
abstract contract AccessControl is Context, IAccessControl, ERC165 {
    struct RoleData {
        mapping(address account => bool) hasRole;
        bytes32 adminRole;
    }

    mapping(bytes32 role => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    /**
     * @dev Modifier that checks that an account has a specific role. Reverts
     * with an {AccessControlUnauthorizedAccount} error including the required role.
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        return _roles[role].hasRole[account];
    }

    /**
     * @dev Reverts with an {AccessControlUnauthorizedAccount} error if `_msgSender()`
     * is missing `role`. Overriding this function changes the behavior of the {onlyRole} modifier.
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    /**
     * @dev Reverts with an {AccessControlUnauthorizedAccount} error if `account`
     * is missing `role`.
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roles[role].adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleGranted} event.
     */
    function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleRevoked} event.
     */
    function revokeRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been revoked `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     *
     * May emit a {RoleRevoked} event.
     */
    function renounceRole(bytes32 role, address callerConfirmation) public virtual {
        if (callerConfirmation != _msgSender()) {
            revert AccessControlBadConfirmation();
        }

        _revokeRole(role, callerConfirmation);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Attempts to grant `role` to `account` and returns a boolean indicating if `role` was granted.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleGranted} event.
     */
    function _grantRole(bytes32 role, address account) internal virtual returns (bool) {
        if (!hasRole(role, account)) {
            _roles[role].hasRole[account] = true;
            emit RoleGranted(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Attempts to revoke `role` to `account` and returns a boolean indicating if `role` was revoked.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleRevoked} event.
     */
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

// File: claudeaui/claim_fixPrice_refundgas.sol


pragma solidity ^0.8.0;





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
    
    // Chainlink Price Feed mapping
    mapping(address => AggregatorV3Interface) public tokenPriceFeeds; // Token => Price Feed (USD)
    
    // Constants
    uint256 public constant MAX_PAYOUT_PERCENT = 400;  // 400% max payout
    
    // Fee percentages for upline rewards (in basis points, 100 = 1%)
    uint256[10] public uplineRewardPercents = [2000, 1000, 500, 500, 500, 100, 100, 100, 100, 100];
    uint256 public DeepLevel = 20;

    // Level requirements and rewards
    struct LevelInfo {
        uint256 directVolume;      // Required direct downline volume in USD
        uint256 teamVolume;        // Required team volume in USD
        uint256 rewardPercent;     // Reward percent of system-wide interest (basis points)
    }
    
    LevelInfo[5] public levelRequirements;
    
    // Token distribution percentages
    uint256 public originalTokenPercent = 70;  // 70% of reward in original token
    uint256 public azcTokenPercent = 30;       // 30% of reward in AZC token
    
    // AZC price in USDT (1 AZC = 0.01 USDT)
    uint256 public azcPrice = 10**16; // 0.01 USDT with 18 decimals

    // Contract sharing settings
    bool public contractSharingEnabled = false;
    address public constant CONTRACT_SHARE_ADDRESS = 0x1afEDB0d3fd6DE762173376605003F85B62EaeA0;
    uint256 public contractSharePercent = 20; // 20% of claim rewards
    
    // Events
    event Claimed(address indexed user, uint256 indexed stakeId, address token, uint256 usdtAmount, uint256 timestamp);
    event ReferralReward(address indexed user, address indexed referrer, uint256 amount, uint256 level);
    event LevelReward(address indexed user, uint256 amount, uint256 level);
    event TokensDistributed(address indexed user, address indexed token, uint256 amount, string tokenType);
    event ContractShareDistributed(address indexed claimer, address indexed contractAddress, address indexed token, uint256 amount);

    
    constructor(
        address _dataContract,
        address _memberContract,
        address _stakingContract,
        address _azcToken,
        address _bnbUsdPriceFeed // Price feed for BNB/USD
    ) {
        dataContract = IDataContract(_dataContract);
        memberContract = IMemberContract(_memberContract);
        stakingContract = IStakingContract(_stakingContract);
        azc = _azcToken;
        
        // Setup Chainlink Price Feeds
        tokenPriceFeeds[address(0)] = AggregatorV3Interface(_bnbUsdPriceFeed); // BNB/USD
        
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

    // Claim interest for a stake
    function claimStake(uint256 stakeId) external nonReentrant {
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
        
        // Distribute to contract share address if enabled
        if (contractSharingEnabled) {
            distributeContractShare(stake.user, stake.token, claimUsdtAmount);
        }
        
        distributeLevelRewards(stake.user, stake.token, claimUsdtAmount);
        
        emit Claimed(stake.user, stakeId, stake.token, claimUsdtAmount, block.timestamp);
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

    // Convert USDT amount to token amount using Chainlink
    function convertUsdtToTokenAmount(address token, uint256 usdtAmount) public view returns (uint256) {
        if (token == USDT) {
            return usdtAmount; // USDT is 1:1
        }
        
        if (token == azc) {
            // 1 AZC = 0.01 USDT -> azcPrice = 0.01 * 10^18
            return (usdtAmount * 10**18) / azcPrice; // usdtAmount / (0.01 * 10^18) = 100 AZC per 1 USDT
        }
        
        AggregatorV3Interface priceFeed = tokenPriceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not set for token");

        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price from Oracle");

        uint256 priceIn18Decimals = uint256(price) * 10**10; // Chainlink price in 8 decimals to 18 decimals
        uint256 tokenAmount = (usdtAmount * 10**18) / priceIn18Decimals; // Convert USDT to token amount

        return tokenAmount;
    }

    // Distribute reward tokens (original token and AZC)
    function distributeRewardTokens(address user, address token, uint256 usdtAmount) private {
        uint256 originalTokenUsdtAmount = usdtAmount * originalTokenPercent / 100;
        uint256 azcTokenUsdtAmount = usdtAmount * azcTokenPercent / 100;
        
        if (token == address(0)) {
            uint256 bnbAmount = convertUsdtToTokenAmount(address(0), originalTokenUsdtAmount);
            payable(user).transfer(bnbAmount);
            emit TokensDistributed(user, token, bnbAmount, "BNB");
        } else {
            uint256 tokenAmount = convertUsdtToTokenAmount(token, originalTokenUsdtAmount);
            require(IERC20(token).transfer(user, tokenAmount), "Token transfer failed");
            emit TokensDistributed(user, token, tokenAmount, "Original");
        }
        
        uint256 azcAmount = convertUsdtToTokenAmount(azc, azcTokenUsdtAmount);
        require(IERC20(azc).transfer(user, azcAmount), "AZC transfer failed");
        emit TokensDistributed(user, azc, azcAmount, "AZC");
    }

    // Wrapper for distributing tokens to user
    function distributeTokensToUser(address user, address token, uint256 usdtAmount) private {
        distributeRewardTokens(user, token, usdtAmount);
    }

    // Distribute contract share (20% of claim rewards to fixed address)
    function distributeContractShare(address claimer, address token, uint256 claimUsdtAmount) private {
        uint256 shareAmount = claimUsdtAmount * contractSharePercent / 100;
        if (shareAmount > 0) {
            distributeRewardTokens(CONTRACT_SHARE_ADDRESS, token, shareAmount);
            emit ContractShareDistributed(claimer, CONTRACT_SHARE_ADDRESS, token, shareAmount);
        }
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
    


    // Admin function to add a token price feed
    function addTokenPriceFeed(address token, address priceFeed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0) || token == azc, "Invalid token");
        require(priceFeed != address(0), "Invalid price feed");
        tokenPriceFeeds[token] = AggregatorV3Interface(priceFeed);
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

    // EDITOR function to toggle contract sharing
    function toggleContractSharing(bool _enabled) external onlyRole(EDITOR_ROLE) {
        contractSharingEnabled = _enabled;
    }

    // EDITOR function to update contract share percentage
    function updateContractSharePercent(uint256 _percent) external onlyRole(EDITOR_ROLE) {
        require(_percent <= 100, "Percentage cannot exceed 100");
        contractSharePercent = _percent;
    }


    
    // View function to get contract sharing info
    function getContractSharingInfo() external view returns (bool enabled, address shareAddress, uint256 sharePercent) {
        return (contractSharingEnabled, CONTRACT_SHARE_ADDRESS, contractSharePercent);
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

    // Emergency withdraw function for specific amount of tokens
    function emergencyTokenAmount(address token, address to, uint256 amount) external onlyRole(EDITOR_ROLE) nonReentrant {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance >= amount, "Insufficient token balance");
        IERC20(token).transfer(to, amount);
    }

    // Admin function to update DeepLevel
    function updateDeepLevel(uint256 _deepLevel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_deepLevel > 0, "DeepLevel must be greater than 0");
        require(_deepLevel <= 50, "DeepLevel too high, risk of gas limit");
        DeepLevel = _deepLevel;
    }

    // Fallback function to receive BNB
    receive() external payable {}
}