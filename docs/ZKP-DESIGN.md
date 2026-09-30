# Zero-Knowledge Proofs (ZKP) — Design & Roadmap

## Why ZKP for SatyaChain

SatyaChain stores records on-chain and verifies them by looking up the record ID.
This works, but it has a privacy weakness: **to verify a certificate, the verifier
must know the certificate ID**, and querying the chain reveals the holder's name,
course, university, and PDF hash.

Zero-Knowledge Proofs fix this. A ZKP lets a user prove a statement is true
**without revealing the underlying data**. In our case:

> "I hold a valid certificate from Mumbai University, issued after 2020,
> for a B.Tech in Computer Science — but I will not tell you my name, my
> certificate ID, or show you the PDF."

The verifier learns only what is necessary (the claim is true), and nothing else.
This is the same privacy model used by:

- **Bhutan National Digital Identity (NDI)** — citizens prove age, residency,
  or citizenship without revealing their ID number.
- **World ID** — users prove they are a unique human without revealing who they are.
- **EU EBSI / SSI** — selective disclosure of Verifiable Credentials.

## The Core Idea

Instead of storing the certificate ID directly on-chain, we store a **commitment**:

```
commitment = Poseidon(certId, ownerSecret)
```

- `certId` — the certificate ID (private)
- `ownerSecret` — a secret only the student knows (private)
- `commitment` — the hash, stored on-chain (public)

Later, the student can generate a ZK proof:

> "I know `certId` and `ownerSecret` such that
> `Poseidon(certId, ownerSecret) == <on-chain commitment>`."

The verifier checks the proof against the on-chain commitment. If it passes,
the verifier knows:

1. The student holds a real certificate
2. It was issued by the expected authority
3. Nothing else — not the ID, not the name, not the course

## Architecture

```
┌─────────────────┐         ┌────────────────────┐
│   Student       │         │  University        │
│   (Prover)      │         │  (Issuer)          │
└────────┬────────┘         └──────────┬─────────┘
         │                             │
         │  1. Enroll: send wallet     │
         │  ─────────────────────────► │
         │                             │
         │             2. Issue cert:  │
         │             commitment =    │
         │             Poseidon(id,    │
         │             ownerSecret)    │
         │                             │
         │◄──── commitment ────────────│
         │                             │
         │  3. Later: prove validity   │
         │  ┌──────────────────────┐   │
         │  │ Generate ZK proof    │   │
         │  │ in browser (snarkjs) │   │
         │  └──────────┬───────────┘   │
         │             │               │
         │             ▼               │
         │      ┌──────────────┐       │
         │      │ Verifier     │       │
         │      │ Contract     │       │
         │      │ (Groth16)    │       │
         │      └──────┬───────┘       │
         │             │               │
         │             ▼               │
         │      ✅ Valid / ❌ Invalid    │
         └─────────────────────────────┘
```

## Components

### 1. Circuit (Circom)

A minimal circuit that enforces the commitment relationship:

```circom
pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template CertValidity() {
    // Private inputs
    signal input certId;
    signal input ownerSecret;

    // Public input
    signal input commitment;

    // Constraint
    component hasher = Poseidon(2);
    hasher.inputs[0] <== certId;
    hasher.inputs[1] <== ownerSecret;

    hasher.out === commitment;
}

component main = CertValidity();
```

### 2. Trusted Setup (Groth16)

Groth16 requires a one-time trusted setup per circuit:

```bash
# Phase 1: Powers of Tau (reusable)
snarkjs powersoftau new bn128 14 pot14_0000.ptau
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau

# Phase 2: Circuit-specific
snarkjs groth16 setup certValidity.r1cs pot14_final.ptau certValidity_0000.zkey
snarkjs zkey contribute certValidity_0000.zkey certValidity_final.zkey

# Export verifier contract
snarkjs zkey export solidityverifier certValidity_final.zkey CertValidityVerifier.sol
```

### 3. On-Chain Verifier

snarkjs generates a Groth16 verifier contract (Solidity). It exposes one function:

```solidity
function verifyProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[1] memory input
) public view returns (bool);
```

The `input` array contains the public signal (`commitment`). The verifier
checks the pairing equation and returns `true` if the proof is valid.

### 4. Frontend Flow

```javascript
// Generate proof in browser
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  { certId, ownerSecret, commitment },
  '/circuits/certValidity.wasm',
  '/circuits/certValidity_final.zkey'
);

// Convert to Solidity calldata
const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
const [a, b, c, inputs] = JSON.parse('[' + calldata + ']');

// Verify on-chain
const verifier = new ethers.Contract(verifierAddr, verifierAbi, signer);
const isValid = await verifier.verifyProof(a, b, c, inputs);
```

## What's Implemented vs. Planned

| Component | Status |
|-----------|--------|
| Commitment design | ✅ Documented here |
| Circom circuit | 📋 Planned — awaiting toolchain |
| Trusted setup | 📋 Planned |
| Verifier contract | 📋 Planned |
| Frontend integration | 📋 Planned |

**Toolchain note:** Compiling Circom circuits on Windows requires the MSVC
C++ toolchain and Windows SDK, which proved unreliable in this environment.
The next implementation step is to run the trusted setup on Linux (WSL or a
Linux CI runner), where the Rust + Circom toolchain installs cleanly.

## Security Considerations

- **Trusted setup ceremony** must be multi-party. A single-party setup lets the
  ceremony coordinator forge proofs. Production deployments use Powers of Tau
  with hundreds of contributors.
- **Poseidon** is used instead of Keccak/SHA because it is ZK-friendly —
  the constraint count is much lower, keeping proofs small and fast.
- **ownerSecret** must be stored client-side (e.g. in browser localStorage
  encrypted with a passphrase). Losing it means losing the ability to prove
  ownership; leaking it means anyone can impersonate the holder.
- **Replay protection**: `scope` (a per-application value) prevents a proof
  from one context being reused in another.

## Real-World References

- Bhutan NDI — https://www.dhi.bt
- World ID — https://world.org/world-id
- EU EBSI Verifiable Credentials — https://ec.europa.eu/digital-building-blocks/sites/display/EBSI
- snarkjs — https://github.com/iden3/snarkjs
- Circom — https://docs.circom.io
- Poseidon hash — https://www.poseidon-hash.info