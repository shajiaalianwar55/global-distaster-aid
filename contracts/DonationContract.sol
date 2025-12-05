// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DonationContract
 * @dev Handles cryptocurrency donations to verified recipients in disaster/war zones
 */
contract DonationContract is Ownable, ReentrancyGuard {
    // USDC token address on Base (will be set during deployment)
    IERC20 public usdcToken;
    
    // Mapping of recipient address to their donation balance
    mapping(address => uint256) public recipientBalances;
    
    // Mapping to track if an address is a verified recipient
    mapping(address => bool) public verifiedRecipients;
    
    // Total donations received per recipient
    mapping(address => uint256) public totalDonationsReceived;
    
    // Donation event
    event DonationMade(
        address indexed donor,
        address indexed recipient,
        uint256 amount,
        bool isNative,
        uint256 timestamp
    );
    
    // Withdrawal event
    event WithdrawalMade(
        address indexed recipient,
        uint256 amount,
        bool isNative,
        uint256 timestamp
    );
    
    // Recipient verification event
    event RecipientVerified(address indexed recipient, bool verified);
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Donate native ETH to a verified recipient
     */
    function donateNative(address recipient) external payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(verifiedRecipients[recipient], "Recipient must be verified");
        
        recipientBalances[recipient] += msg.value;
        totalDonationsReceived[recipient] += msg.value;
        
        emit DonationMade(msg.sender, recipient, msg.value, true, block.timestamp);
    }
    
    /**
     * @dev Donate USDC to a verified recipient
     */
    function donateUSDC(address recipient, uint256 amount) external nonReentrant {
        require(amount > 0, "Donation amount must be greater than 0");
        require(verifiedRecipients[recipient], "Recipient must be verified");
        
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        recipientBalances[recipient] += amount;
        totalDonationsReceived[recipient] += amount;
        
        emit DonationMade(msg.sender, recipient, amount, false, block.timestamp);
    }
    
    /**
     * @dev Withdraw native ETH (only verified recipients)
     */
    function withdrawNative(uint256 amount) external nonReentrant {
        require(verifiedRecipients[msg.sender], "Only verified recipients can withdraw");
        require(recipientBalances[msg.sender] >= amount, "Insufficient balance");
        
        recipientBalances[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawalMade(msg.sender, amount, true, block.timestamp);
    }
    
    /**
     * @dev Withdraw USDC (only verified recipients)
     */
    function withdrawUSDC(uint256 amount) external nonReentrant {
        require(verifiedRecipients[msg.sender], "Only verified recipients can withdraw");
        require(recipientBalances[msg.sender] >= amount, "Insufficient balance");
        
        recipientBalances[msg.sender] -= amount;
        
        require(
            usdcToken.transfer(msg.sender, amount),
            "USDC withdrawal failed"
        );
        
        emit WithdrawalMade(msg.sender, amount, false, block.timestamp);
    }
    
    /**
     * @dev Verify a recipient (only owner/admin)
     */
    function verifyRecipient(address recipient) external onlyOwner {
        verifiedRecipients[recipient] = true;
        emit RecipientVerified(recipient, true);
    }
    
    /**
     * @dev Revoke verification (only owner/admin)
     */
    function revokeVerification(address recipient) external onlyOwner {
        verifiedRecipients[recipient] = false;
        emit RecipientVerified(recipient, false);
    }
    
    /**
     * @dev Get recipient balance
     */
    function getRecipientBalance(address recipient) external view returns (uint256) {
        return recipientBalances[recipient];
    }
    
    /**
     * @dev Update USDC token address (only owner)
     */
    function setUSDCToken(address _usdcToken) external onlyOwner {
        usdcToken = IERC20(_usdcToken);
    }
    
    // Allow contract to receive ETH
    receive() external payable {
        revert("Use donateNative() function to make donations");
    }
}

