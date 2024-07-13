// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RewardsPoolManager {
    address public owner;
    IERC20 immutable private usdcToken;
    uint256 public subscriptionFee;  // The subscription fee in USDC (expressed in smallest units)

    struct Winner {
        address winnerAddress;
        uint256 score;
    }

    struct RewardsPool {
        uint256 amount;
        uint256 distributionDate;
        uint256 totalScore;
    }

    mapping(string => RewardsPool) public pools;
    mapping(address => bool) public subscribers;

    event PoolCreated(string companyId, uint256 amount, uint256 distributionDate);
    event PoolDistributed(string companyId);
    event Subscription(address subscriber);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier subscriberOnly() {
        require(subscribers[msg.sender] == true, "Only subscribers can call this function");
        _;
    }

    constructor(address _usdcTokenAddress, uint256 _subscriptionFee) {
        owner = msg.sender;
        require(_usdcTokenAddress != address(0x0));
        usdcToken = IERC20(_usdcTokenAddress);
        subscriptionFee = _subscriptionFee;
    }

    function subscribe() public {
        require(!subscribers[msg.sender], "Already subscribed");
        usdcToken.transferFrom(msg.sender, address(this), subscriptionFee);
        subscribers[msg.sender] = true;

        emit Subscription(msg.sender);
    }

    function createPool(string calldata companyId, uint256 amount, uint256 distributionDate) external subscriberOnly {
        require(pools[companyId].amount == 0, "Pool already exists");

        // Take USDC from the user
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        pools[companyId] = RewardsPool({
            amount: amount,
            distributionDate: distributionDate,
            totalScore: 0
        });

        emit PoolCreated(companyId, amount, distributionDate);
    }

    function distributePool(string calldata companyId, Winner[] calldata winners) external onlyOwner {
        RewardsPool storage pool = pools[companyId];
        require(pool.amount != 0, "Pool does not exist");
        require(block.timestamp >= pool.distributionDate, "Cannot distribute before the distribution date");

        uint256 totalScore = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            totalScore += winners[i].score;
        }
        pool.totalScore = totalScore;

        for (uint256 i = 0; i < winners.length; i++) {
            uint256 winnerPoolShare = winners[i].score * 1e18 / pool.totalScore;
            uint256 winnerPrizeUsdc = pool.amount * winnerPoolShare / 1e18;

            require(usdcToken.transfer(winners[i].winnerAddress, winnerPrizeUsdc), "USDC transfer failed");
        }

        // Delete the pool after distribution
        delete pools[companyId];

        emit PoolDistributed(companyId);
    }

    function isSubscriber(address user) external view returns (bool) {
        return subscribers[user];
    }
}
