// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HealthRecordNFT
 * @notice Soulbound NFT representing a patient's medical record.
 *         - Only the hospital admin can mint new record NFTs.
 *         - The patient owns the NFT (soulbound — cannot be transferred).
 *         - Patient controls access: grantAccess / revokeAccess for doctors.
 *         - Doctor access is a boolean flag on-chain.
 */
contract HealthRecordNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    mapping(string => uint256) public recordIdToToken;
    mapping(uint256 => string) private _tokenURIs;

    // tokenId => doctor address => access granted?
    mapping(uint256 => mapping(address => bool)) public doctorAccess;

    // Track all doctors who have ever been granted access (for UI listing)
    mapping(uint256 => address[]) public accessHistory;

    event Locked(uint256 tokenId);
    event RecordMinted(string indexed recordId, uint256 indexed tokenId, address patient);
    event AccessGranted(uint256 indexed tokenId, address indexed doctor, address grantedBy);
    event AccessRevoked(uint256 indexed tokenId, address indexed doctor, address revokedBy);

    error RecordAlreadyMinted(string recordId);
    error SoulboundNonTransferable();
    error NotTokenOwner();

    constructor() ERC721("SatyaChain Health Record", "SCHR") Ownable(msg.sender) {}

    /**
     * @notice Mint a new health record NFT to the patient. Admin only.
     */
    function mintRecord(
        address patient,
        string calldata recordId,
        string calldata metadataURI
    ) external onlyOwner returns (uint256) {
        if (recordIdToToken[recordId] != 0) revert RecordAlreadyMinted(recordId);

        uint256 tokenId = ++_nextTokenId;
        _safeMint(patient, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        recordIdToToken[recordId] = tokenId;

        emit Locked(tokenId);
        emit RecordMinted(recordId, tokenId, patient);
        return tokenId;
    }

    /**
     * @notice Patient grants a doctor access to this record.
     */
    function grantAccess(uint256 tokenId, address doctor) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (!doctorAccess[tokenId][doctor]) {
            doctorAccess[tokenId][doctor] = true;
            accessHistory[tokenId].push(doctor);
            emit AccessGranted(tokenId, doctor, msg.sender);
        }
    }

    /**
     * @notice Patient revokes a doctor's access.
     */
    function revokeAccess(uint256 tokenId, address doctor) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (doctorAccess[tokenId][doctor]) {
            doctorAccess[tokenId][doctor] = false;
            emit AccessRevoked(tokenId, doctor, msg.sender);
        }
    }

    /**
     * @notice Check if a doctor can access this record.
     */
    function hasAccess(uint256 tokenId, address doctor) external view returns (bool) {
        return doctorAccess[tokenId][doctor];
    }

    /**
     * @notice How many doctors have ever been granted access (for a UI list).
     */
    function accessHistoryLength(uint256 tokenId) external view returns (uint256) {
        return accessHistory[tokenId].length;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice ERC-5192: returns true if the token is locked (non-transferable).
     */
    function locked(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    /**
     * @dev Block all transfers (soulbound).
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert SoulboundNonTransferable();
        }
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundNonTransferable();
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert SoulboundNonTransferable();
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}