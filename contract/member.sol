// SPDX-License-Identifier: MIT
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

// File: claudeaui/Member.sol


pragma solidity ^0.8.26;
contract MemberContract is AccessControl  {
    // Structures
    struct Member {
        address upline;  // Direct referrer
        address[] downlines;
        bool isLeader;
        uint256 totalTeamVolume;  // Total team volume in USDT
        uint256 f1Volume;
        uint256 level;
    }
    bytes32 public constant EDITOR = keccak256("EDITOR");
    // Mapping from user address to Member struct
    mapping(address => Member) public members;

    uint256 public DeepLevel = 10;

    // Array to store leaders for easy access
    address[] public leaders;
      constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    // Events
    event MemberAdded(address indexed member, address indexed upline);
    event LeaderAdded(address indexed leader);
    event LeaderRemoved(address indexed leader);
    event UplineChanged(address indexed member, address indexed oldUpline, address indexed newUpline);
    event F1VolumeUpdated(address indexed member, uint256 amount);
    event LevelUpdated(address indexed member, uint256 newLevel);

    function registerMember(address upline) external {
    address member = msg.sender;
    require(member != address(0), "Invalid member address");
    require(upline != member, "Cannot be your own upline");
    require(members[member].upline == address(0), "Member already registered");
    
        // If upline is not registered and not zero address, set upline to zero address
        // if (upline != address(0) && members[upline].upline == address(0) && !members[upline].isLeader) {
        //     upline = address(0);
        // }
        
        members[member].upline = upline;
        
        // Add member to upline's downlines if upline exists
        if (upline != address(0)) {
            members[upline].downlines.push(member);
        }
        
        emit MemberAdded(member, upline);
    }

    function getLevel(address member) external view returns (uint256) {
        return members[member].level;
    }
    function updateLevel(address member, uint256 newLevel) external onlyRole(EDITOR) {
        members[member].level = newLevel;
        emit LevelUpdated(member, newLevel);
    }
    // Function to add a leader
    function addLeader(address leader) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(leader != address(0), "Invalid leader address");
        require(!members[leader].isLeader, "Already a leader");
        
        members[leader].isLeader = true;
        leaders.push(leader);
        
        emit LeaderAdded(leader);
    }
    
    // Function to remove a leader
    function removeLeader(address leader) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(members[leader].isLeader, "Not a leader");
        
        members[leader].isLeader = false;
        
        // Remove from leaders array
        for (uint i = 0; i < leaders.length; i++) {
            if (leaders[i] == leader) {
                leaders[i] = leaders[leaders.length - 1];
                leaders.pop();
                break;
            }
        }
        
        emit LeaderRemoved(leader);
    }
    
    // Function to change upline (partner)
    function changeUpline(address member, address newUpline) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(member != address(0), "Invalid member address");
        require(newUpline != address(0), "Invalid upline address");
        require(member != newUpline, "Cannot be your own upline");
        require(members[member].upline != newUpline, "Already your upline");
        
        address oldUpline = members[member].upline;
        
        // Remove member from old upline's downlines
        if (oldUpline != address(0)) {
            address[] storage downlines = members[oldUpline].downlines;
            for (uint i = 0; i < downlines.length; i++) {
                if (downlines[i] == member) {
                    downlines[i] = downlines[downlines.length - 1];
                    downlines.pop();
                    break;
                }
            }
        }
        
        // Set new upline
        members[member].upline = newUpline;
        
        // Add member to new upline's downlines
        members[newUpline].downlines.push(member);
        
        emit UplineChanged(member, oldUpline, newUpline);
    }
    
    // Function to get upline of a member
    function getUpline(address member) external view returns (address) {
        return members[member].upline;
    }
    
    // Function to get all uplines of a member (10 levels)
    function getUplines(address member, uint256 levels) external view returns (address[] memory) {
        require(levels > 0 && levels <= DeepLevel, "Invalid levels: max = DeepLevel");
        
        address[] memory uplines = new address[](levels);
        address current = members[member].upline;
        
        for (uint256 i = 0; i < levels && current != address(0); i++) {
            uplines[i] = current;
            current = members[current].upline;
        }
        
        return uplines;
    }
    
    // Function to check if an address is a leader
    function isLeader(address member) external view returns (bool) {
        return members[member].isLeader;
    }
    
    // Function to get the highest upline (leader) of a member
    function getHighestUpline(address member) external view returns (address) {
        address current = member;
        address highest = address(0);
        
        while (current != address(0)) {
            if (members[current].isLeader) {
                highest = current;
                break;
            }
            current = members[current].upline;
            if (current == address(0)) break;
        }
        
        return highest;
    }
    
    // Function to update team volume (called from StakingContract)
    function updateTeamVolume(address member, uint256 amount) external onlyRole(EDITOR) {
        address current = member;
        
        while (current != address(0)) {
            members[current].totalTeamVolume += amount;
            current = members[current].upline;
            if (current == address(0)) break;
        }
    }
    
    // Function to get total team volume
   function getTeamVolume(address member) external view returns (uint256) {
        return members[member].totalTeamVolume;  // Changed from 'current' to 'member'
    }
    
    // Function to get direct downlines
    function getDirectDownlines(address member) external view returns (address[] memory) {
        return members[member].downlines;
    }
    
    // Function to get total direct downlines count
    function getDirectDownlinesCount(address member) external view returns (uint256) {
        return members[member].downlines.length;
    }
     function updateF1Volume(address member, uint256 amount) external onlyRole(EDITOR) {
        members[member].f1Volume += amount;
    }
      function getF1Volume(address member) external view returns (uint256) {
        return members[member].f1Volume;
    }
     function countAllDownlines(address member) public view returns (uint256) {
        uint256 count = 0;
        address[] memory downlines = members[member].downlines;
        
        for (uint256 i = 0; i < downlines.length; i++) {
            count += 1 + countAllDownlines(downlines[i]);
        }
        
        return count;
    }
 
    
    // Function to calculate total commission
    function calculateTotalCommission(address member) external view returns (uint256) {
        uint256 totalCommission = 0;
        
        // Calculate F1 commission
        address[] memory f1Downlines = members[member].downlines;
        for (uint256 i = 0; i < f1Downlines.length; i++) {
            uint256 f1Volume = members[f1Downlines[i]].totalTeamVolume;
            totalCommission += (f1Volume * 6) / 100;
            
            // Calculate F2 commission
            address[] memory f2Downlines = members[f1Downlines[i]].downlines;
            for (uint256 j = 0; j < f2Downlines.length; j++) {
                uint256 f2Volume = members[f2Downlines[j]].totalTeamVolume;
                totalCommission += (f2Volume * 1) / 100;
                
                // Calculate F3 commission
                address[] memory f3Downlines = members[f2Downlines[j]].downlines;
                for (uint256 k = 0; k < f3Downlines.length; k++) {
                    uint256 f3Volume = members[f3Downlines[k]].totalTeamVolume;
                    totalCommission += (f3Volume * 1) / 100;
                }
            }
        }
        
        return totalCommission;
    }
     function updateDeepLevel(uint256 _deepLevel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_deepLevel > 0, "DeepLevel must be greater than 0");
        require(_deepLevel <= 100, "DeepLevel too high, risk of gas limit");
    DeepLevel = _deepLevel;
    }
   
}