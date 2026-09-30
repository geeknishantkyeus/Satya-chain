// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721, Ownable {
    event Locked(uint256 tokenId);

    uint256 private _nextTokenId;
    mapping(string => uint256) public certIdToToken;
    mapping(uint256 => string) private _tokenURIs;

    error CertificateAlreadyMinted(string certId);
    error SoulboundNonTransferable();

    constructor() ERC721("EduChain Certificate", "EDU") Ownable(msg.sender) {}

    function mintCertificate(
        address to,
        string calldata certId,
        string calldata metadataURI
    ) external onlyOwner returns (uint256) {
        if (certIdToToken[certId] != 0) revert CertificateAlreadyMinted(certId);

        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        certIdToToken[certId] = tokenId;

        emit Locked(tokenId);
        return tokenId;
    }

    function revokeCertificate(string calldata certId) external onlyOwner {
        uint256 tokenId = certIdToToken[certId];
        require(tokenId != 0, "NFT not found for certificate");
        _update(address(0), tokenId, address(0));
        delete certIdToToken[certId];
        delete _tokenURIs[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function locked(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert SoulboundNonTransferable();
        }
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert SoulboundNonTransferable();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundNonTransferable();
    }
}