# 🎬 Satya-Chain: Live Demo & Walkthrough Guide

**Duration:** 2 - 3 Minutes  
**Goal:** Prove how Satya-Chain stops counterfeit documents across Education, Government, Real Estate, and Healthcare with 2-second verification.

---

## Pre-Demo Preparation (1 Minute Setup)
1. Ensure your local node is running:
   ```powershell
   cd backend
   npx hardhat node
   ```
2. Start the Frontend & API:
   ```powershell
   # Terminal 2
   cd backend && npm run start:api
   # Terminal 3
   cd frontend && npm start
   ```
3. Open MetaMask with `Account #0` imported (Hardhat Local network).
4. Navigate to `http://localhost:3000`.

---

## Step-by-Step Demo Script (2 - 3 Minutes)

### Phase 1: Problem Pitch & Solution (0:00 - 0:45)
- **Speaker:** "Every year in India, over 10 Lakh counterfeit degrees and fake registries circulate, creating a ₹10,000 Crore fraud industry. Traditional verification takes 3 weeks and costs hundreds of rupees.
- Welcome to **Satya-Chain: India's Decentralized Trust Layer**. It combines Polygon PoS, IPFS, and Soulbound NFTs to reduce verification time from 3 weeks to **2 seconds** at a cost of less than **₹0.25 per record**."

### Phase 2: Education Sector Demo (0:45 - 1:30)
1. Navigate to `/education` (or click "Education" on Dashboard).
2. Fill out the **Issue Degree** form:
   - Certificate ID: `IITB-2026-CS-001`
   - Student Name: `Rahul Sharma`
   - Course: `B.Tech Computer Science`
   - Student Wallet: Paste any valid wallet (or Account #1).
3. Click **"Issue & Auto-Mint Soulbound NFT"**.
4. **Observation:**
   - Vector PDF generates with watermark and dynamic verification QR code.
   - PDF uploads to IPFS cluster.
   - On-chain registry stores the record.
   - Soulbound ERC-5192 NFT is minted directly into the student's wallet.
5. In the **2-Second Verification** box, enter `IITB-2026-CS-001` and click **Verify**.
   - **Result:** Shows **"✓ Authentic"** with student details and direct IPFS document link!
6. Click **Revoke Certificate**:
   - The degree is marked invalid and the Soulbound NFT is burned on-chain. Verification now shows **"✕ Revoked"**!

### Phase 3: Government ID & ZKP Privacy (1:30 - 2:00)
1. Navigate to `/government`.
2. Enter ID: `AADH-1234-5678-9012`, Name: `Amit Kumar`.
3. Click **"Generate ZK-Proof (Age 18+ Without Revealing DOB)"**.
4. **Observation:**
   - The Zero-Knowledge Proof verifies cryptographically that the citizen is an adult without ever revealing their birth date or Aadhaar number!

### Phase 4: Land Deeds & Patient Healthcare ACL (2:00 - 2:30)
1. Navigate to `/land`:
   - Show how a Land Title Deed is an NFT with a visible **Transfer Count**.
   - Demonstrate legal property transfer upon sale.
2. Navigate to `/healthcare`:
   - Show the **Patient Access Control (ACL)** widget where patients grant and revoke access to doctors with a single click.

### Phase 5: Conclusion (2:30 - 3:00)
- "Satya-Chain is fast, multi-sector, tamper-proof, and costs less than a photocopy. Trust, Speed, Access — all in one place."
