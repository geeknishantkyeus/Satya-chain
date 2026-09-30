// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public admin;

    struct Certificate {
        string studentName;
        string course;
        string ipfs;
        uint256 date;
        bool valid;
    }

    mapping(string => Certificate) public certificates;
    mapping(address => string[]) public studentCerts;
    string[] public allIds;
    uint256 public total;
    uint256 public revokedCount;

    event Issued(
        string id,
        string name,
        string ipfs,
        uint256 date,
        address studentWallet
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
        string memory id,
        string memory name,
        string memory course,
        string memory ipfs,
        address studentWallet
    ) public onlyAdmin {
        require(bytes(id).length > 0, "ID required");
        require(bytes(name).length > 0, "Name required");
        require(!certificates[id].valid, "ID exists");

        certificates[id] = Certificate({
            studentName: name,
            course: course,
            ipfs: ipfs,
            date: block.timestamp,
            valid: true
        });

        allIds.push(id);
        studentCerts[studentWallet].push(id);
        total++;

        emit Issued(id, name, ipfs, block.timestamp, studentWallet);
    }

    function verify(string memory id)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        Certificate memory c = certificates[id];
        return (c.studentName, c.course, c.ipfs, c.date, c.valid);
    }

    function revoke(string memory id) public onlyAdmin {
        require(certificates[id].valid, "Not found or already revoked");
        certificates[id].valid = false;
        revokedCount++;
        emit Revoked(id, block.timestamp);
    }

    function getAllIds() public view returns (string[] memory) {
        return allIds;
    }

    function getCertificatesByStudent(address student)
        public
        view
        returns (string[] memory)
    {
        return studentCerts[student];
    }
}