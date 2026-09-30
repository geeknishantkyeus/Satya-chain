# 📡 Satya-Chain: API Reference & Smart Contract Specification

This document provides complete documentation for the Satya-Chain Express.js REST API and the 8 deployed Smart Contracts.

---

## 1. Express.js REST API Endpoints

**Base URL:** `http://localhost:5000/api` (or deployed Railway/Render URL)

### 1.1 Upload File to IPFS (PDFs & Documents)
- **Endpoint:** `POST /api/upload-to-ipfs`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (Binary document / PDF up to 15MB)
- **Response (200 OK):**
```json
{
  "success": true,
  "ipfsHash": "QmXyz123456789...",
  "pinSize": 45120,
  "timestamp": "2026-09-29T12:00:00.000Z",
  "ipfsUri": "ipfs://QmXyz123456789...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXyz123456789..."
}
```

### 1.2 Upload NFT Metadata JSON
- **Endpoint:** `POST /api/upload-json`
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "fileName": "IITB-2026-metadata.json",
  "metadata": {
    "name": "B.Tech Degree - Rahul Sharma",
    "description": "Blockchain verified soulbound certificate",
    "image": "ipfs://QmXyz...",
    "attributes": [
      { "trait_type": "Course", "value": "Computer Science" }
    ]
  }
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "ipfsHash": "QmMetadataHash...",
  "ipfsUri": "ipfs://QmMetadataHash...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmMetadataHash..."
}
```

### 1.3 Verify Record On-Chain
- **Endpoint:** `GET /api/verify/:sector/:id`
- **Parameters:**
  - `sector`: `education` | `government` | `land` | `healthcare`
  - `id`: Unique record identifier (e.g. `2024-001`, `AADH-101`)
- **Response (200 OK):**
```json
{
  "success": true,
  "sector": "education",
  "record": {
    "id": "2024-001",
    "studentName": "Rahul Sharma",
    "course": "B.Tech Computer Science",
    "ipfsHash": "QmXyz...",
    "issueDate": "2026-09-28T06:35:30.000Z",
    "isValid": true
  }
}
```

### 1.4 Get Records by Wallet
- **Endpoint:** `GET /api/records/:sector/:wallet`
- **Parameters:**
  - `sector`: `education` | `government` | `land` | `healthcare`
  - `wallet`: Ethereum address (`0x...`)
- **Response (200 OK):**
```json
{
  "success": true,
  "sector": "government",
  "wallet": "0x71c...a3",
  "ids": ["AADH-101", "PAN-202"]
}
```

---

## 2. Smart Contract Function Reference

### 2.1 CertificateRegistry.sol (Education)
- `issue(string id, string name, string course, string ipfs, address studentWallet)` -> Emits `Issued`
- `verify(string id)` -> returns `(string name, string course, string ipfs, uint256 date, bool valid)`
- `revoke(string id)` -> Marks `valid = false`, increments `revokedCount`
- `getCertificatesByStudent(address student)` -> returns `string[] memory`
- `getAllIds()` -> returns `string[] memory`

### 2.2 CertificateNFT.sol (Soulbound ERC-5192)
- `mintCertificate(address to, string certId, string metadataURI)` -> returns `tokenId`
- `revokeCertificate(string certId)` -> Burns NFT (`_update(address(0), ...)`), deletes mapping
- `locked(uint256 tokenId)` -> returns `true` (ERC-5192 lock)
- `_update(...)` -> Reverts on transfer (`SoulboundNonTransferable`)

### 2.3 GovernmentRegistry.sol (National Identity)
- `issue(string id, string idType, string holderName, string ipfs, string holderWallet)`
- `verify(string id)` -> returns `(string holderName, string idType, string ipfs, uint256 date, bool valid)`
- `getRecordsByWallet(string wallet)` -> returns `string[] memory` in $O(1)$
- `revoke(string id)` -> Marks invalid

### 2.4 LandRegistry.sol & LandDeedNFT.sol (Real Estate)
- `LandRegistry.issue(string id, string deedType, string ownerName, string propertyAddress, string ipfs, string ownerWallet)`
- `LandDeedNFT.mintDeed(address to, string deedId, string metadataURI)`
- `LandDeedNFT.transferFrom(address from, address to, uint256 tokenId)` -> Increments `transferCount[tokenId]`
- `LandDeedNFT.tokenOfOwnerByIndex(address owner, uint256 index)` -> Enumerable ownership lookup

### 2.5 HealthcareRegistry.sol & HealthRecordNFT.sol (Medical)
- `HealthcareRegistry.issue(string id, string recordType, string patientName, string doctorName, string ipfs, string patientWallet)`
- `HealthRecordNFT.mintRecord(address patient, string recordId, string metadataURI)`
- `HealthRecordNFT.grantAccess(uint256 tokenId, address doctor)` -> Patient permits doctor
- `HealthRecordNFT.revokeAccess(uint256 tokenId, address doctor)` -> Patient removes doctor
- `HealthRecordNFT.hasAccess(uint256 tokenId, address doctor)` -> returns `bool`

### 2.6 Verifier.sol (ZKP Groth16)
- `checkProof(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[3] input)` -> returns `bool`
- `verifyProof(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[3] input)` -> Emits `ProofVerified`
