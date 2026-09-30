# Satya-Chain Backend

Hardhat v3 and Solidity backend for the Satya-Chain certificate registry.

## Requirements

- Node.js 22.13.0 or newer
- npm
- A funded wallet and RPC endpoint for Polygon Amoy deployments

## Setup

```powershell
cd backend
npm install
```

Create `.env` in this directory. Never commit a real private key.

```env
PRIVATE_KEY=0xYOUR_64_HEX_CHARACTER_PRIVATE_KEY
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
```

## Commands

```powershell
npm run compile
npm test
npm run deploy:local
npm run deploy:amoy
```

Equivalent Hardhat commands:

```powershell
npx hardhat build
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/deploy.ts --network amoy
```

The local node must remain running in one terminal before using `--network localhost` from another terminal.

## Contract

`contracts/CertificateRegistry.sol` uses Solidity `^0.8.20` with the optimizer enabled for 200 runs.

Functions:

- `admin()` returns the administrator wallet.
- `total()` returns the number of issued certificates.
- `certs(string id)` returns certificate data by ID.
- `studentCerts(address student, uint256 index)` returns an indexed certificate ID.
- `issue(string id, string name, string course, string ipfs, address studentWallet)` issues a certificate. Admin only.
- `getCertificatesByStudent(address student)` returns certificate IDs for a student.
- `verify(string id)` returns name, course, IPFS hash, timestamp, and validity.
- `revoke(string id)` marks a certificate invalid. Admin only.

Events:

- `Issued(string id, string name, string ipfs, uint256 date, address studentWallet)`
- `Revoked(string id, uint256 date)`

## Deployment

`scripts/deploy.ts` deploys `CertificateRegistry`, prints the deployer and deployment block, reads the compiled ABI, and writes the address and ABI to:

```text
../frontend/src/config/constants.js
```

The latest verified local deployment during project setup was:

```text
Network: local Hardhat node
Address: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Block: 5
RPC: http://127.0.0.1:8545/
```

This address is local-only and is not an Amoy deployment. An Amoy deployment requires a valid 32-byte private key and test MATIC. The current deployment script uses the CLI-selected network connection; Hardhat may report a deprecation warning for `hre.network.connect()` in future versions.

## Tests

The test suite covers admin assignment, certificate issuance, duplicate IDs, access control, revocation, student indexing, empty student results, and the `Issued` event.

```text
10 passing
```

Generated artifacts are stored under `artifacts/` and generated contract types under `types/`. These directories should be regenerated with `npm run compile` rather than edited manually.
