// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
contract LeaderShareContract is Ownable {
    struct ShareDetail {
        address recipient;
        uint256 percentage;
        uint256 branchId;
    }

    mapping(address => ShareDetail[]) public leaderShareDetails;
    mapping(address => uint256) public totalShares;

    event ShareSet(address indexed leader, address indexed recipient, uint256 percentage, uint256 branchId);
    event ShareRemoved(address indexed leader, address indexed recipient, uint256 branchId);

    constructor() Ownable(msg.sender) {}

    function setLeaderShareDetails(
        address leader,
        address[] calldata recipients,
        uint256[] calldata percentages,
        uint256 branchId
    ) external onlyOwner {
        require(leader != address(0), "Invalid leader address");
        require(recipients.length == percentages.length, "Arrays length mismatch");
        // require(recipients.length <= 5, "Maximum 5 levels allowed");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(percentages[i] <= 100, "Percentage must be <= 100");
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 100, "Total percentage must equal 100%");

        if (branchId == 1) {
            delete leaderShareDetails[leader];
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            bool exists = false;
            for (uint256 j = 0; j < leaderShareDetails[leader].length; j++) {
                if (leaderShareDetails[leader][j].recipient == recipients[i] && 
                    leaderShareDetails[leader][j].branchId == branchId) {
                    exists = true;
                    leaderShareDetails[leader][j].percentage = percentages[i];
                    emit ShareSet(leader, recipients[i], percentages[i], branchId);
                    break;
                }
            }
            if (!exists) {
                leaderShareDetails[leader].push(ShareDetail({
                    recipient: recipients[i],
                    percentage: percentages[i],
                    branchId: branchId
                }));
                emit ShareSet(leader, recipients[i], percentages[i], branchId);
            }
        }

        totalShares[leader] = branchId == 1 ? totalPercentage : totalShares[leader];
    }

    function removeLeaderShareDetails(address leader) external onlyOwner {
        require(leader != address(0), "Invalid leader address");
        require(leaderShareDetails[leader].length > 0, "No shares set");

        for (uint256 i = 0; i < leaderShareDetails[leader].length; i++) {
            emit ShareRemoved(leader, leaderShareDetails[leader][i].recipient, leaderShareDetails[leader][i].branchId);
        }
        delete leaderShareDetails[leader];
        totalShares[leader] = 0;
    }

    function getShares(address leader) external view returns (
        address[] memory recipients, 
        uint256[] memory percentages, 
        uint256[] memory branchIds
    ) {
        ShareDetail[] memory shares = leaderShareDetails[leader];
        recipients = new address[](shares.length);
        percentages = new uint256[](shares.length);
        branchIds = new uint256[](shares.length);
        for (uint256 i = 0; i < shares.length; i++) {
            recipients[i] = shares[i].recipient;
            percentages[i] = shares[i].percentage;
            branchIds[i] = shares[i].branchId;
        }
        return (recipients, percentages, branchIds);
    }
}