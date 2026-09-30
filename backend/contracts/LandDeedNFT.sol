// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LandDeedNFT
 * @notice Transferable NFT representing a land deed.
 *         - Only the registry admin can mint new deeds.
 *         - Deeds are freely transferable (real estate can change hands).
 *         - Each deedId maps to exactly one tokenId (no duplicate deeds).
 *         - Enumerable: lists all tokens owned by an address.
 */
contract LandDeedNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    mapping(string => uint256) public deedIdToToken;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public transferCount;

    event DeedMinted(string indexed deedId, uint256 indexed tokenId, address to);
    event DeedTransferred(uint256 indexed tokenId, address from, address to);

    error DeedAlreadyMinted(string deedId);

    constructor() ERC721("SatyaChain Land Deed", "SCLD") Ownable(msg.sender) {}

    /**
     * @notice Mint a new land deed NFT. Admin only.
     */
    function mintDeed(
        address to,
        string calldata deedId,
        string calldata metadataURI
    ) external onlyOwner returns (uint256) {
        if (deedIdToToken[deedId] != 0) revert DeedAlreadyMinted(deedId);

        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        deedIdToToken[deedId] = tokenId;

        emit DeedMinted(deedId, tokenId, to);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Hook to count transfers (audit trail).
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0)) {
            transferCount[tokenId] += 1;
            emit DeedTransferred(tokenId, from, to);
        }

        return from;
    }

    /**
     * @dev Required by ERC721Enumerable.
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Required by ERC721Enumerable.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}