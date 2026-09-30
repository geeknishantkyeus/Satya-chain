# Satya-Chain Handoff

## Overview

Satya-Chain is a blockchain-backed certificate issuing and verification application. Universities issue certificate records, students view certificates associated with their wallet, and third parties verify certificates by ID.

The repository contains a Hardhat v3 backend and a Create React App frontend.

## Tech Stack

- Solidity `^0.8.20`
- Hardhat `3.x`
- TypeScript and ts-node for backend configuration, deployment, and tests
- Mocha, Chai, and the Hardhat Mocha + Ethers toolbox
- React 19 and React Router
- Ethers.js 6
- Tailwind CSS
- jsPDF and QRCode for certificate PDFs
- Pinata IPFS for PDF storage
- Polygon Amoy Testnet for intended public deployment

## Project Layout

```text
satya-chain/
├── backend/
│   ├── contracts/CertificateRegistry.sol
│   ├── scripts/deploy.ts
│   ├── test/CertificateRegistry.test.ts
│   ├── artifacts/
│   ├── types/
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/components/
│   ├── src/pages/
│   ├── src/utils/
│   ├── src/config/constants.js
│   ├── package.json
│   ├── .env
│   └── .env.example
└── HANDOFF.md
```

## Contract Behavior

`CertificateRegistry` assigns each certificate to an explicit `studentWallet`. The administrator issues and revokes records. Public callers can verify a certificate or list IDs indexed to a student wallet.

The issue call is:

```text
issue(id, name, course, ipfs, studentWallet)
```

The frontend helper resolves each returned student certificate ID through `verify()` before displaying it.

## Backend Commands

```powershell
cd backend
npm install
npm run compile
npm test
```

Local deployment:

```powershell
# Terminal 1
npx hardhat node

# Terminal 2
cd backend
npx hardhat run scripts/deploy.ts --network localhost
```

Amoy deployment:

```powershell
cd backend
npx hardhat run scripts/deploy.ts --network amoy
```

The Amoy wallet must have test MATIC and `backend/.env` must contain a valid 66-character private key value. Never share or commit that key.

## Frontend Commands

```powershell
cd frontend
npm install
npm start
npm run build
npm test
```

The development server runs at `http://localhost:3000`.

## Deployment Details

Latest verified local deployment:

```text
Network: Hardhat local node
RPC: http://127.0.0.1:8545/
Contract: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Block: 5
```

The deployment script writes the compiled contract address and ABI to:

```text
frontend/src/config/constants.js
```

A local address is not valid on Polygon Amoy. After a successful Amoy deployment, regenerate this file and ensure the frontend is configured for the Amoy chain.

## Frontend Environment

`frontend/.env` should contain local values such as:

```env
REACT_APP_PINATA_JWT=your_real_pinata_jwt
REACT_APP_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

The current placeholder Pinata value will cause IPFS uploads to fail with a 401 error. The frontend `.env` is ignored by Git.

## Test Data

Backend tests use:

```text
Certificate ID: 2024-001
Student: Rahul
Course: B.Tech
IPFS hash: QmXyz
```

A second ownership test uses:

```text
Certificate ID: 2024-002
Student: Priya
Course: MBA
IPFS hash: QmAbc
```

The local Hardhat node provides deterministic test accounts with 10000 ETH each. These accounts and private keys are public test fixtures only and must never be used on a live network.

## Verification Status

- Backend build: successful with solc 0.8.20.
- Backend tests: 10 passing.
- Frontend production build: successful.
- Frontend development server: available at `http://localhost:3000`.
- Full wallet/IPFS/browser flow: requires MetaMask and a valid Pinata JWT.
- Amoy deployment: pending a valid funded wallet private key.

## Contact

No project owner or contact address was provided in the repository. Add the maintainer's name, email, repository URL, and deployment wallet owner here before handing the project to an external team.
