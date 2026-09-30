# Satya-Chain Frontend

React frontend for issuing, viewing, and verifying blockchain-backed certificates.

## Requirements

- Node.js 22.13.0 or newer
- npm
- MetaMask for wallet-based flows
- A valid Pinata JWT for IPFS uploads
- A deployed `CertificateRegistry` address

## Setup

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:3000`.

For a production bundle:

```powershell
npm run build
```

For frontend tests:

```powershell
npm test
```

## Environment Variables

Create `frontend/.env` locally:

```env
REACT_APP_PINATA_JWT=your_real_pinata_jwt
REACT_APP_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Create React App exposes only variables prefixed with `REACT_APP_` to browser code. Never commit a real Pinata JWT.

`src/config/constants.js` contains the generated contract ABI, address fallback, and Polygon Amoy network metadata. The deployment script regenerates this file after deployment.

## Pages

- `/` - Satya-Chain overview and workflow.
- `/university` - Generates a certificate PDF, uploads it to IPFS, and issues the certificate from the admin wallet. The form accepts certificate ID, student name, course, university, and student wallet address.
- `/student` - Connects a wallet and lists certificate IDs indexed to that wallet.
- `/verify` - Looks up a certificate by ID and displays its validity and IPFS document link.
- `/verify/:certId` - Opens verification for a certificate ID, including QR-code destinations.

MetaMask is required for wallet connection, network switching, contract reads in the current browser integration, and transactions.

## Utilities

- `src/utils/contractHelper.js` - Ethers.js contract instances, address validation, issuing, verification, student lookup, and revocation.
- `src/utils/wallet.js` - MetaMask connection, Polygon Amoy network switching, and account lookup.
- `src/utils/ipfs.js` - Pinata file upload and IPFS gateway URL creation.
- `src/utils/pdfGenerator.js` - Certificate PDF generation, embedded verification QR code, and browser download.

## Components

- `Navbar.js` - Navigation, wallet connection, account display, and explorer link.
- `CertificateCard.js` - Certificate summary with download and IPFS actions.
- `Footer.js` - Project navigation and technology summary.
- `AnimatedCounter.js`, `GlowOrbs.js`, and `StarField.js` - Home page presentation components with reduced-motion support.

## Contract Integration

The frontend expects these contract methods:

```text
issue(id, name, course, ipfs, studentWallet)
verify(id)
getCertificatesByStudent(student)
revoke(id)
```

The generated ABI also includes the public `admin`, `total`, `certs`, and `studentCerts` getters.

## Local Development

Start the local blockchain first:

```powershell
cd backend
npx hardhat node
```

In another terminal, deploy the contract and regenerate the frontend constants:

```powershell
cd backend
npx hardhat run scripts/deploy.ts --network localhost
```

Then start the frontend:

```powershell
cd frontend
npm start
```

The local Hardhat deployment address changes when the node state is reset. Do not use a local address as a Polygon Amoy address.

## Current Limitations

- IPFS uploads require a real Pinata JWT; the placeholder value returns a 401 error.
- MetaMask is required for the complete issue, verify, and student flows.
- Polygon Amoy deployment requires a valid funded wallet private key in the backend environment.
- The frontend build and backend tests are verified independently; a full browser transaction flow requires those external services.
