// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CHEFStake is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // 池信息结构体
    struct Pool {
        IERC20 stToken;
        uint256 poolWeight;
        uint256 lastRewardBlock;
        uint256 accCHEFPerST;
        uint256 stTokenAmount;
        uint256 minDepositAmount;
        uint256 unstakeLockedBlocks;
    }

    // 解质押请求结构体
    struct UnstakeRequest {
        // 解质押数量
        uint256 amount;
        // 解锁区块
        uint256 unlockBlock;
    }

    // 用户信息结构体
    struct UserInfo {
        // 用户质押的代币数量
        uint256 stAmount;
        // 已分配的 Chef 数量
        uint256 finishedChef;
        // 待领取的 Chef 数量
        uint256 pendingChef;
        // 解质押请求列表，每个请求包含解质押数量和解锁区块。
        UnstakeRequest[] requests;
    }

    IERC20 public immutable chefToken;
    Pool[] public pools;
    uint256 public totalAllocPoint;
    uint256 public CHEF_PER_BLOCK = 1e18; // 默认每区块奖励

    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    // 暂停状态控制
    bool public isStakePaused;
    bool public isUnstakePaused;
    bool public isClaimPaused;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event WithdrawRequest(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event Claim(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, IERC20 stToken, uint256 poolWeight);
    event PoolUpdated(uint256 indexed pid);

    constructor(IERC20 _chefToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);
        chefToken = _chefToken;
    }

    // 质押功能
    function deposit(
        uint256 pid,
        uint256 amount
    ) external payable nonReentrant {
        require(!isStakePaused, "Deposit paused");
        Pool storage pool = pools[pid];
        require(amount >= pool.minDepositAmount, "Below minimum");

        updatePool(pid);
        UserInfo storage user = userInfo[pid][msg.sender];

        // 处理代币转账
        if (address(pool.stToken) == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            pool.stToken.safeTransferFrom(msg.sender, address(this), amount);
        }

        // 更新质押信息
        _updateUserReward(pid, user);
        user.stAmount += amount;
        pool.stTokenAmount += amount;

        emit Deposit(msg.sender, pid, amount);
    }

    // 请求解质押
    function requestUnstake(uint256 pid, uint256 amount) external nonReentrant {
        require(!isUnstakePaused, "Unstake paused");
        UserInfo storage user = userInfo[pid][msg.sender];
        require(user.stAmount >= amount, "Insufficient balance");

        updatePool(pid);
        _updateUserReward(pid, user);

        // 记录解质押请求
        user.unstakeRequests.push(
            UnstakeRequest({
                amount: amount,
                unlockBlock: block.number + pools[pid].unstakeLockedBlocks
            })
        );

        // 更新质押信息
        user.stAmount -= amount;
        pools[pid].stTokenAmount -= amount;

        emit WithdrawRequest(msg.sender, pid, amount);
    }

    // 领取奖励
    function claim(uint256 pid) external nonReentrant {
        require(!isClaimPaused, "Claim paused");
        UserInfo storage user = userInfo[pid][msg.sender];
        updatePool(pid);
        _updateUserReward(pid, user);

        uint256 amount = user.pendingCHEF;
        require(amount > 0, "No rewards");

        user.pendingCHEF = 0;
        chefToken.safeTransfer(msg.sender, amount);

        emit Claim(msg.sender, pid, amount);
    }

    // 提取已解锁资金
    function withdraw(uint256 pid) external nonReentrant {
        UserInfo storage user = userInfo[pid][msg.sender];
        uint256 totalAmount;

        // 逆向遍历避免删除时的索引问题
        for (int256 i = int256(user.unstakeRequests.length) - 1; i >= 0; i--) {
            UnstakeRequest storage req = user.unstakeRequests[uint256(i)];
            if (req.unlockBlock <= block.number) {
                totalAmount += req.amount;
                _removeRequest(user.unstakeRequests, uint256(i));
            }
        }

        require(totalAmount > 0, "Nothing to withdraw");
        _transferToken(pid, msg.sender, totalAmount);
    }

    // 管理员添加新池
    function addPool(
        IERC20 stToken,
        uint256 weight,
        uint256 minDeposit,
        uint256 lockedBlocks
    ) external onlyRole(ADMIN_ROLE) {
        totalAllocPoint += weight;
        pools.push(
            Pool({
                stToken: stToken,
                poolWeight: weight,
                lastRewardBlock: block.number,
                accCHEFPerST: 0,
                stTokenAmount: 0,
                minDepositAmount: minDeposit,
                unstakeLockedBlocks: lockedBlocks
            })
        );
        emit PoolAdded(pools.length - 1, stToken, weight);
    }

    // 更新奖励参数
    function updatePool(uint256 pid) public {
        Pool storage pool = pools[pid];
        if (block.number <= pool.lastRewardBlock) return;

        uint256 stSupply = pool.stTokenAmount;
        if (stSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 blocksPassed = block.number - pool.lastRewardBlock;
        uint256 chefReward = (blocksPassed * CHEF_PER_BLOCK * pool.poolWeight) /
            totalAllocPoint;

        pool.accCHEFPerST += (chefReward * 1e12) / stSupply;
        pool.lastRewardBlock = block.number;
    }

    // 设置每区块奖励（管理员）
    function setCHEFPerBlock(uint256 amount) external onlyRole(ADMIN_ROLE) {
        CHEF_PER_BLOCK = amount;
    }

    // 暂停功能控制
    function setPaused(
        bool stake,
        bool unstake,
        bool claimP
    ) external onlyRole(ADMIN_ROLE) {
        isStakePaused = stake;
        isUnstakePaused = unstake;
        isClaimPaused = claimP;
    }

    // 内部函数：更新用户奖励
    function _updateUserReward(uint256 pid, UserInfo storage user) internal {
        Pool storage pool = pools[pid];
        uint256 accPerST = pool.accCHEFPerST;
        user.pendingCHEF +=
            (user.stAmount * (accPerST - user.finishedCHEF)) /
            1e12;
        user.finishedCHEF = accPerST;
    }

    // 内部函数：代币转账
    function _transferToken(uint256 pid, address to, uint256 amount) internal {
        Pool storage pool = pools[pid];
        if (address(pool.stToken) == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            pool.stToken.safeTransfer(to, amount);
        }
    }

    // 内部函数：删除解质押请求
    function _removeRequest(
        UnstakeRequest[] storage arr,
        uint256 index
    ) internal {
        arr[index] = arr[arr.length - 1];
        arr.pop();
    }

    // 接收ETH（用于原生代币质押）
    receive() external payable {}
}
