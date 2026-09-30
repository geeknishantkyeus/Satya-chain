# 🇮🇳 Satya-Chain: India's Decentralized Trust Layer

> **"Fake certificates? Not anymore. Trust, Speed, Access — sab ek jagah."**

Satya-Chain is a Multi-Sector Blockchain Credential, Identity & NFT Verification System designed to eliminate fraud across Education, Government, Real Estate, and Healthcare.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?logo=solidity)](https://soliditylang.org/)
[![Polygon](https://img.shields.io/badge/Polygon-PoS%20%2F%20Amoy-8247E5?logo=polygon)](https://polygon.technology/)
[![Tests](https://img.shields.io/badge/Tests-61%2F61%20Passing%20(100%25)-success)](#test-coverage)
[![Security](https://img.shields.io/badge/Security-Audited-brightgreen)](#security)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 The Problem & Our Solution

### The Crisis in India:
- **10 Lakh+ Fake Degrees** circulate annually in India.
- **₹10,000+ Crore** fraudulent certificate and fake registry racket.
- **2 to 3 Weeks** required for traditional paper-based verification.
- **₹300 - ₹500** spent per document verification.
- Land title duplication and medical record tampering run rampant.

### The Satya-Chain Solution:
- **⚡ 2-Second QR Verification:** 100,000x faster than postal or email verification.
- **💰 < ₹0.25 Cost:** Powered by Polygon PoS micro-transaction economics (verification is 100% FREE).
- **🛡️ Tamper-Proof & Permanent:** Secured on decentralized blockchain and IPFS.
- **🔒 Privacy Preserving:** Zero-Knowledge Proofs (ZKP) enable selective disclosure without exposing private citizen data.

---

## 🏛️ The 4 Sectors

| Sector | Model | Standard | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **🎓 Education** | Soulbound NFT (Non-transferable) | ERC-721 + ERC-5192 | Degrees cannot be transferred or sold. Revoking a certificate burns the NFT on-chain. |
| **🆔 Government** | On-Chain Identity Registry | Custom Registry + ZKP | Aadhaar, PAN, DL, Passport records. Citizens prove age (18+) without revealing DOB. |
| **🏠 Land & Property** | Transferable NFT | ERC-721 + Enumerable | Real estate deeds. Property sales transfer the NFT and update an immutable transfer audit trail. |
| **🏥 Healthcare** | Soulbound NFT with Doctor ACL | Custom Access Control | Patients own medical records and grant/revoke temporary viewing permission to doctors. |

---

## ⚡ Tech Stack

- **Blockchain:** Polygon PoS / Amoy Testnet, Solidity 0.8.28, Hardhat 3.x, OpenZeppelin Contracts v5.x
- **Frontend:** React 19, Tailwind CSS, Ethers.js v6, jsPDF, QRCode
- **Backend API:** Node.js, Express.js, Multer, CORS
- **Storage:** IPFS & Filecoin pinned via Pinata Cloud
- **Privacy:** Circom 2.0, snarkjs, Groth16 Zero-Knowledge Verifier (`Verifier.sol`)

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- Node.js (v18+ or v20+ recommended, v24 supported)
- Browser with [MetaMask Extension](https://metamask.io/)

### 1. Install Dependencies
```powershell
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install --legacy-peer-deps
```

### 2. Configure Environment Files

**Backend (`backend/.env`):**
```env
PORT=5000
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=
PINATA_JWT=your_pinata_jwt_here
```

**Frontend (`frontend/.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
REACT_APP_PINATA_JWT=your_pinata_jwt_here
```

### 3. Start Local Environment (3 Terminals)

**Terminal 1 — Local Blockchain Node:**
```powershell
cd backend
npx hardhat node
```

**Terminal 2 — Deploy Contracts & Start Backend API:**
```powershell
cd backend
npx hardhat run scripts/deploy.ts --network localhost
npm run start:api
```

**Terminal 3 — Start Web Application:**
```powershell
cd frontend
npm start
```

Visit **`http://localhost:3000`** in your browser!

---

## 🧪 Test Coverage (61/61 Passing)

Run the comprehensive unit and end-to-end integration test suite:
```powershell
cd backend
npm test
```

```text
✔ CertificateNFT Contract Tests (7 passing)
✔ CertificateRegistry Tests (10 passing)
✔ Satya-Chain End-to-End (E2E) Integration Tests (13 passing)
✔ GovernmentRegistry Contract Tests (6 passing)
✔ HealthcareRegistry Contract Tests (3 passing)
✔ HealthRecordNFT Contract Tests (4 passing)
✔ LandDeedNFT Contract Tests (3 passing)
✔ LandRegistry Contract Tests (4 passing)
✔ Multi-Sector Contracts Suite (11 passing)

Total: 61 passing (2s) — 100% Success!
```

---

## 🌐 Deploying to Production

### Deploy Smart Contracts to Polygon Amoy
1. Get test POL from the [Polygon Faucet](https://faucet.polygon.technology/).
2. Set your wallet `PRIVATE_KEY` in `backend/.env`.
3. Deploy:
   ```powershell
   cd backend
   npx hardhat run scripts/deploy.ts --network amoy
   ```
*(Contract addresses and network configuration in `frontend/src/config/constants.js` are updated automatically)*

### Deploy Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add `REACT_APP_API_URL` and `REACT_APP_PINATA_JWT` in Environment Variables.
4. Click **Deploy**.

---

## 📚 Complete Documentation

- [System Architecture & Data Flows](docs/ARCHITECTURE.md)
- [REST API & Smart Contract Specification](docs/API.md)
- [Live Demo Script & Walkthrough](docs/DEMO.md)
- [Security Audit & Vulnerability Report](backend/audit-report.md)
- [Gas Optimization & Cost Analysis](backend/gas-report.md)
- [Pitch Presentation Slides](docs/PRESENTATION.md)
- [Video Demo Script](docs/DEMO-SCRIPT.md)

---

## ⚖️ License
Released under the [MIT License](LICENSE).