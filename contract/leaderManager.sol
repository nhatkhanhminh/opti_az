// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

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
    
    struct Branch {
        bool exists;
        uint256 count;
        mapping(uint256 => ShareDetail) shares; // Index => ShareDetail
    }

    // Leader => BranchId => Branch
    mapping(address => mapping(uint256 => Branch)) private leaderBranches;
    // Leader => array of branchIds that exist
    mapping(address => uint256[]) private leaderBranchIds;
    mapping(address => uint256) public totalShares;
    
    // Backward compatibility for existing functions
    mapping(address => ShareDetail[]) public leaderShareDetails;

    event ShareSet(address indexed leader, address indexed recipient, uint256 percentage, uint256 branchId);
    event ShareRemoved(address indexed leader, address indexed recipient, uint256 branchId);
    event BranchRemoved(address indexed leader, uint256 branchId);
    event BranchUpdated(address indexed leader, uint256 branchId);

    constructor() Ownable(msg.sender) {}

    // Private helper functions
    function _addOrUpdateBranch(
        address leader, 
        uint256 branchId, 
        address[] calldata recipients, 
        uint256[] calldata percentages
    ) private {
        Branch storage branch = leaderBranches[leader][branchId];
        
        // If branch doesn't exist yet, add it to the list of branchIds
        if (!branch.exists) {
            leaderBranchIds[leader].push(branchId);
            branch.exists = true;
        } else {
            // Clear existing data completely before adding new data
            for (uint256 i = 0; i < branch.count; i++) {
                delete branch.shares[i];
            }
            branch.count = 0; // Reset count to zero
        }
        
        // Set new data
        branch.count = recipients.length;
        for (uint256 i = 0; i < recipients.length; i++) {
            branch.shares[i] = ShareDetail({
                recipient: recipients[i],
                percentage: percentages[i],
                branchId: branchId
            });
            emit ShareSet(leader, recipients[i], percentages[i], branchId);
        }
    }
    
    function _removeBranch(address leader, uint256 branchId) private {
        Branch storage branch = leaderBranches[leader][branchId];
        
        // Emit events for each share that's being removed
        for (uint256 i = 0; i < branch.count; i++) {
            emit ShareRemoved(leader, branch.shares[i].recipient, branchId);
            delete branch.shares[i];
        }
        
        // Mark branch as not existing
        branch.exists = false;
        branch.count = 0;
        
        // Remove branchId from the leaderBranchIds array
        uint256 length = leaderBranchIds[leader].length;
        for (uint256 i = 0; i < length; i++) {
            if (leaderBranchIds[leader][i] == branchId) {
                // Swap with the last element and pop
                leaderBranchIds[leader][i] = leaderBranchIds[leader][length - 1];
                leaderBranchIds[leader].pop();
                break;
            }
        }
    }
    
    function _removeAllBranches(address leader) private {
        uint256[] memory branchIds = leaderBranchIds[leader];
        
        for (uint256 i = 0; i < branchIds.length; i++) {
            uint256 branchId = branchIds[i];
            Branch storage branch = leaderBranches[leader][branchId];
            
            // Emit events for each share that's being removed
            for (uint256 j = 0; j < branch.count; j++) {
                emit ShareRemoved(leader, branch.shares[j].recipient, branchId);
                delete branch.shares[j];
            }
            
            // Mark branch as not existing and clean up
            branch.exists = false;
            branch.count = 0;
            emit BranchRemoved(leader, branchId);
        }
        
        // Clear the branchIds array
        delete leaderBranchIds[leader];
    }
    
    function _updateLegacyStorage(address leader, uint256 specificBranchId) private {
        // Clear legacy storage completely
        delete leaderShareDetails[leader];
        
        // Rebuild legacy storage from optimized structure
        uint256[] memory branchIds = leaderBranchIds[leader];
        
        for (uint256 i = 0; i < branchIds.length; i++) {
            uint256 branchId = branchIds[i];
            
            // Skip if we're only updating a specific branch and this isn't it
            if (specificBranchId != 0 && branchId != specificBranchId) {
                continue;
            }
            
            Branch storage branch = leaderBranches[leader][branchId];
            if (branch.exists) {
                for (uint256 j = 0; j < branch.count; j++) {
                    // Verify the data isn't corrupted
                    if (branch.shares[j].recipient != address(0)) {
                        leaderShareDetails[leader].push(branch.shares[j]);
                    }
                }
            }
        }
    }

    function setLeaderShareDetails(
        address leader,
        address[] calldata recipients,
        uint256[] calldata percentages,
        uint256 branchId
    ) external onlyOwner {
        require(leader != address(0), "Invalid leader address");
        require(recipients.length == percentages.length, "Arrays length mismatch");
        require(recipients.length > 0, "Must provide at least one recipient");
        // require(recipients.length <= 5, "Maximum 5 levels allowed");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(percentages[i] <= 100, "Percentage must be <= 100");
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 100, "Total percentage must equal 100%");

        if (branchId == 1) {
            // Reset all leader data if branch 1 is set - maintain backward compatibility
            _removeAllBranches(leader);
        }
        
        // Use optimized storage structure
        _addOrUpdateBranch(leader, branchId, recipients, percentages);
        
        // For backward compatibility, update leaderShareDetails
        _updateLegacyStorage(leader, branchId);
        
        // Update total shares only for branch 1
        if (branchId == 1) {
            totalShares[leader] = totalPercentage;
        }
    }

    function updateBranch(
        address leader,
        uint256 branchId,
        address[] calldata recipients,
        uint256[] calldata percentages
    ) external onlyOwner {
        require(leader != address(0), "Invalid leader address");
        require(branchId > 0, "Invalid branch ID");
        require(leaderBranches[leader][branchId].exists, "Branch does not exist");
        require(recipients.length == percentages.length, "Arrays length mismatch");
        require(recipients.length > 0, "Must provide at least one recipient");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(percentages[i] <= 100, "Percentage must be <= 100");
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 100, "Total percentage must equal 100%");
        
        // First remove the branch to ensure clean update
        _removeBranch(leader, branchId);
        
        // Then add it again with new data
        leaderBranchIds[leader].push(branchId);
        Branch storage branch = leaderBranches[leader][branchId];
        branch.exists = true;
        branch.count = recipients.length;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            branch.shares[i] = ShareDetail({
                recipient: recipients[i],
                percentage: percentages[i],
                branchId: branchId
            });
            emit ShareSet(leader, recipients[i], percentages[i], branchId);
        }
        
        // Update legacy storage with only this branch
        _updateLegacyStorage(leader, branchId);
        
        emit BranchUpdated(leader, branchId);
    }
    
    function removeBranch(address leader, uint256 branchId) public onlyOwner {
        require(leader != address(0), "Invalid leader address");
        require(branchId > 0, "Invalid branch ID");
        require(leaderBranches[leader][branchId].exists, "Branch does not exist");
        
        // Remove branch from optimized structure
        _removeBranch(leader, branchId);
        
        // Update legacy storage
        _updateLegacyStorage(leader, 0); // 0 means update all branches
        
        emit BranchRemoved(leader, branchId);
    }

    function removeLeaderShareDetails(address leader) external onlyOwner {
        require(leader != address(0), "Invalid leader address");
        
        // Remove all branches from optimized structure
        _removeAllBranches(leader);
        
        // Clear legacy storage
        delete leaderShareDetails[leader];
        totalShares[leader] = 0;
    }

    function getShares(address leader) external view returns (
        address[] memory recipients, 
        uint256[] memory percentages, 
        uint256[] memory branchIds
    ) {
        // Check if we have any data in the optimized structure
        uint256[] memory optimizedBranchIds = leaderBranchIds[leader];
        uint256 totalCount = 0;
        
        // First calculate the total number of shares across all branches
        for (uint256 i = 0; i < optimizedBranchIds.length; i++) {
            uint256 branchId = optimizedBranchIds[i];
            Branch storage branch = leaderBranches[leader][branchId];
            if (branch.exists) {
                totalCount += branch.count;
            }
        }
        
        // Use legacy storage if no optimized data or if it's empty
        if (totalCount == 0) {
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
        
        // Create arrays of the correct size
        recipients = new address[](totalCount);
        percentages = new uint256[](totalCount);
        branchIds = new uint256[](totalCount);
        
        // Fill the arrays with data from each branch
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < optimizedBranchIds.length; i++) {
            uint256 branchId = optimizedBranchIds[i];
            Branch storage branch = leaderBranches[leader][branchId];
            if (branch.exists) {
                for (uint256 j = 0; j < branch.count; j++) {
                    recipients[currentIndex] = branch.shares[j].recipient;
                    percentages[currentIndex] = branch.shares[j].percentage;
                    branchIds[currentIndex] = branchId;
                    currentIndex++;
                }
            }
        }
        
        return (recipients, percentages, branchIds);
    }
    
    function getBranchShares(address leader, uint256 branchId) external view returns (
        address[] memory recipients, 
        uint256[] memory percentages
    ) {
        require(leader != address(0), "Invalid leader address");
        require(leaderBranches[leader][branchId].exists, "Branch does not exist");
        
        uint256 count = leaderBranches[leader][branchId].count;
        recipients = new address[](count);
        percentages = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            recipients[i] = leaderBranches[leader][branchId].shares[i].recipient;
            percentages[i] = leaderBranches[leader][branchId].shares[i].percentage;
        }
        
        return (recipients, percentages);
    }
    
    function checkBranchExists(address leader, uint256 branchId) external view returns (bool) {
        return leaderBranches[leader][branchId].exists;
    }
    
    function getLeaderBranchIds(address leader) external view returns (uint256[] memory) {
        return leaderBranchIds[leader];
    }

    // Thêm hàm mới trả về thông tin đầy đủ về các nhánh của một leader
    function getDetailedBranchInfo(address leader) external view returns (
        uint256[] memory branchIds,
        address[][] memory recipients,
        uint256[][] memory percentages
    ) {
        // Lấy danh sách các branchId
        branchIds = leaderBranchIds[leader];
        
        // Tạo mảng trả về với kích thước đúng bằng số lượng nhánh
        recipients = new address[][](branchIds.length);
        percentages = new uint256[][](branchIds.length);
        
        // Lấp đầy mảng với thông tin chi tiết về mỗi nhánh
        for (uint256 i = 0; i < branchIds.length; i++) {
            uint256 branchId = branchIds[i];
            uint256 count = leaderBranches[leader][branchId].count;
            
            recipients[i] = new address[](count);
            percentages[i] = new uint256[](count);
            
            for (uint256 j = 0; j < count; j++) {
                recipients[i][j] = leaderBranches[leader][branchId].shares[j].recipient;
                percentages[i][j] = leaderBranches[leader][branchId].shares[j].percentage;
            }
        }
        
        return (branchIds, recipients, percentages);
    }
}