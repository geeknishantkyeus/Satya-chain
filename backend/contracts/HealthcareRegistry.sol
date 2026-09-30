// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthcareRegistry {
    address public admin;

    struct HealthRecord {
        string id;
        string recordType;
        string patientName;
        string patientWallet;
        string doctorName;
        string ipfs;
        uint256 date;
        bool valid;
    }

    mapping(string => HealthRecord) public records;
    mapping(string => string[]) public patientRecords;
    string[] public allIds;
    uint256 public total;
    uint256 public revokedCount;

    event Issued(
        string id,
        string recordType,
        string patientName,
        string ipfs,
        uint256 date,
        string patientWallet
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
        string memory _recordType,
        string memory _patientName,
        string memory _doctorName,
        string memory _ipfs,
        string memory _patientWallet
    ) public onlyAdmin {
        require(bytes(_id).length > 0, "ID required");
        require(bytes(_patientName).length > 0, "Patient name required");
        require(!records[_id].valid, "Record exists");

        records[_id] = HealthRecord({
            id: _id,
            recordType: _recordType,
            patientName: _patientName,
            patientWallet: _patientWallet,
            doctorName: _doctorName,
            ipfs: _ipfs,
            date: block.timestamp,
            valid: true
        });

        allIds.push(_id);
        patientRecords[_patientWallet].push(_id);
        total++;

        emit Issued(_id, _recordType, _patientName, _ipfs, block.timestamp, _patientWallet);
    }

    function verify(string memory _id)
        public
        view
        returns (
            string memory patientName,
            string memory recordType,
            string memory doctorName,
            string memory ipfs,
            uint256 date,
            bool valid
        )
    {
        HealthRecord memory r = records[_id];
        return (r.patientName, r.recordType, r.doctorName, r.ipfs, r.date, r.valid);
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
        return patientRecords[_wallet];
    }

    function getAllIds() public view returns (string[] memory) {
        return allIds;
    }
}