// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
    address public admin;

    struct LandRecord {
        string id;
        string deedType;
        string ownerName;
        string ownerWallet;
        string propertyAddress;
        string ipfs;
        uint256 date;
        bool valid;
    }

    mapping(string => LandRecord) public records;
    mapping(string => string[]) public ownerRecords;
    string[] public allIds;
    uint256 public total;
    uint256 public revokedCount;

    event Issued(
        string id,
        string deedType,
        string ownerName,
        string ipfs,
        uint256 date,
        string ownerWallet
    );

    event Revoked(string id, uint256 date);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function issue(
        string memory _id,
        string memory _deedType,
        string memory _ownerName,
        string memory _propertyAddress,
        string memory _ipfs,
        string memory _ownerWallet
    ) public onlyAdmin {
        require(bytes(_id).length > 0, "ID required");
        require(bytes(_ownerName).length > 0, "Owner name required");
        require(!records[_id].valid, "Record exists");

        records[_id] = LandRecord({
            id: _id,
            deedType: _deedType,
            ownerName: _ownerName,
            ownerWallet: _ownerWallet,
            propertyAddress: _propertyAddress,
            ipfs: _ipfs,
            date: block.timestamp,
            valid: true
        });

        allIds.push(_id);
        ownerRecords[_ownerWallet].push(_id);
        total++;

        emit Issued(_id, _deedType, _ownerName, _ipfs, block.timestamp, _ownerWallet);
    }

    function verify(string memory _id)
        public
        view
        returns (
            string memory ownerName,
            string memory deedType,
            string memory propertyAddress,
            string memory ipfs,
            uint256 date,
            bool valid
        )
    {
        LandRecord memory r = records[_id];
        return (r.ownerName, r.deedType, r.propertyAddress, r.ipfs, r.date, r.valid);
    }

    function revoke(string memory _id) public onlyAdmin {
        require(records[_id].valid, "Not found or already revoked");
        records[_id].valid = false;
        revokedCount++;
        emit Revoked(_id, block.timestamp);
    }

    function getRecordsByWallet(string memory _wallet)
        public
        view
        returns (string[] memory)
    {
        return ownerRecords[_wallet];
    }

    function getAllIds() public view returns (string[] memory) {
        return allIds;
    }
}