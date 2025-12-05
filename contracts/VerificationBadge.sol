// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title VerificationBadge
 * @dev ERC-721 NFT representing verification badges for disaster zone residents
 */
contract VerificationBadge is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Mapping from user address to token ID
    mapping(address => uint256) public userToTokenId;
    
    // Mapping from token ID to verification metadata
    mapping(uint256 => VerificationData) public verificationData;
    
    // Struct to store verification information
    struct VerificationData {
        address user;
        uint256 verifiedAt;
        string zoneType; // "disaster" or "war"
        bool isActive;
    }
    
    // Events
    event BadgeMinted(
        address indexed user,
        uint256 indexed tokenId,
        string zoneType,
        uint256 timestamp
    );
    
    event BadgeRevoked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    constructor() ERC721("Disaster Relief Verification Badge", "DRVB") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a verification badge to a user
     * @param to Address to mint the badge to
     * @param zoneType Type of zone ("disaster" or "war")
     * @param tokenURI Metadata URI for the badge
     */
    function mintBadge(
        address to,
        string memory zoneType,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(userToTokenId[to] == 0, "User already has a badge");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        userToTokenId[to] = newTokenId;
        verificationData[newTokenId] = VerificationData({
            user: to,
            verifiedAt: block.timestamp,
            zoneType: zoneType,
            isActive: true
        });
        
        emit BadgeMinted(to, newTokenId, zoneType, block.timestamp);
        
        return newTokenId;
    }
    
    /**
     * @dev Revoke a verification badge
     * @param user Address of the user whose badge should be revoked
     */
    function revokeBadge(address user) external onlyOwner {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User does not have a badge");
        require(verificationData[tokenId].isActive, "Badge already revoked");
        
        verificationData[tokenId].isActive = false;
        
        emit BadgeRevoked(user, tokenId, block.timestamp);
    }
    
    /**
     * @dev Check if a user has an active verification badge
     * @param user Address to check
     * @return bool True if user has an active badge
     */
    function isVerified(address user) external view returns (bool) {
        uint256 tokenId = userToTokenId[user];
        if (tokenId == 0) return false;
        return verificationData[tokenId].isActive;
    }
    
    /**
     * @dev Get token ID for a user
     * @param user Address to check
     * @return uint256 Token ID (0 if no badge)
     */
    function getTokenId(address user) external view returns (uint256) {
        return userToTokenId[user];
    }
    
    /**
     * @dev Get verification data for a user
     * @param user Address to check
     * @return VerificationData Verification data struct
     */
    function getVerificationData(address user) external view returns (VerificationData memory) {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User does not have a badge");
        return verificationData[tokenId];
    }
    
    /**
     * @dev Override transfer to prevent badge transfers (badges are soulbound)
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        // Prevent transfers - badges are soulbound
        if (to != address(0) && ownerOf(tokenId) != address(0)) {
            revert("Verification badges cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }
}

