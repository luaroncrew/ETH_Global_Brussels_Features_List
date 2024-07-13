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

    mapping(uint256 => RewardsPool) public pools;
    mapping(address => bool) public subscribers;

    event PoolCreated(uint256 listId, uint256 amount, uint256 distributionDate);
    event PoolDistributed(uint256 listId);
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
    }

    function createPool(uint256 listId, uint256 amount, uint256 distributionDate) external subscriberOnly {
        require(pools[listId].amount == 0, "Pool already exists");

        // Take USDC from the user
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        pools[listId] = RewardsPool({
            amount: amount,
            distributionDate: distributionDate,
            totalScore: 0
        });

        emit PoolCreated(listId, amount, distributionDate);
    }

    function distributePool(uint256 listId, Winner[] calldata winners) external onlyOwner {
        RewardsPool storage pool = pools[listId];
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
        delete pools[listId];

        emit PoolDistributed(listId);
    }

    function isSubscriber(address user) external view returns (bool) {
        return subscribers[user];
    }
}
