# 🔒 Satya-Chain: Security Policy & Threat Model

**Status:** Audited (Internal Static Analysis & Automated Slither Checks)  
**Standard:** OpenZeppelin Contracts v5.x / EVM Cancun / Solc 0.8.28  

---

## 1. Security Architecture & Principles

1. **Non-Custodial Design:**
   Satya-Chain does not hold or escrow user funds. Contracts store cryptographic credential registries and non-fungible tokens.

2. **Soulbound Token Immutability (ERC-5192):**
   In `CertificateNFT.sol` and `HealthRecordNFT.sol`, standard ERC-721 transfer functions (`transferFrom`, `safeTransferFrom`, `approve`, `setApprovalForAll`) are overridden to revert if both `from` and `to` are non-zero addresses.
   Only burning (`to == address(0)`) is permitted upon administrator revocation.

3. **Access Control Integrity:**
   - Registrars and universities use the `onlyAdmin` modifier or Ownable pattern.
   - Medical record access lists use `ownerOf(tokenId) == msg.sender` checks to guarantee only the patient can grant or revoke doctor viewing rights.

4. **Gas Limit DoS Defense:**
   All registry queries (`getRecordsByWallet`) use direct storage mapping lookups (`O(1)`), eliminating any loops that could trigger Out-of-Gas exceptions under high record volume.

---

## 2. Threat Analysis & Mitigations

| Threat Vector | Severity | Mitigation Implemented |
| :--- | :---: | :--- |
| **Reentrancy Attacks** | Low | Registry functions do not make external calls before state updates (Checks-Effects-Interactions pattern). |
| **Soulbound Transfer Bypass** | High | Overridden `_update()` hook intercepts all transfer pathways at the core ERC-721 layer. |
| **Credential Spoofing** | High | Unique ID enforcement (`require(!records[id].valid)` / `CertificateAlreadyMinted`). |
| **Public API Key Exposure** | Medium | Server-side Pinata JWT proxy via Express backend (`backend/api/upload.js`). |
| **Unauthorized Revocation** | High | Restricted strictly to the contract admin / issuing authority. |

---

## 3. Recommended Production Hardening

For multi-institution enterprise deployment:
1. **Multi-Signature Governance:** Transfer contract ownership to a Gnosis Safe multi-sig wallet requiring $M$-of-$N$ signatures for credential revocation.
2. **Decentralized Identifiers (DID):** Integrate W3C Verifiable Credentials and DID standards for university issuer identity federation.
3. **Formal Verification:** Execute Certora or Slither formal proofs prior to mainnet launch.
