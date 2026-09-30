#!/bin/bash
set -e

echo "🚀 Compiling Satya-Chain ZKP Circuit..."

CIRCUIT_DIR="circuits"
BUILD_DIR="build/zkp"
CONTRACTS_DIR="contracts"

mkdir -p "$BUILD_DIR"

# 1. Compile circom circuit
if command -v circom &> /dev/null; then
    echo "⚙️ Compiling ageProof.circom with circom..."
    circom "$CIRCUIT_DIR/ageProof.circom" --r1cs --wasm --sym -o "$BUILD_DIR"
else
    echo "⚠️ circom CLI not installed globally. Using snarkjs setup..."
fi

# 2. Check if snarkjs is available
if ! command -v snarkjs &> /dev/null; then
    SNARKJS="npx snarkjs"
else
    SNARKJS="snarkjs"
fi

echo "🔐 Generating Powers of Tau ceremony..."
PTAU_FILE="$BUILD_DIR/pot12_final.ptau"

if [ ! -f "$PTAU_FILE" ]; then
    $SNARKJS powersoftau new bn128 12 "$BUILD_DIR/pot12_0000.ptau" -v
    $SNARKJS powersoftau contribute "$BUILD_DIR/pot12_0000.ptau" "$BUILD_DIR/pot12_0001.ptau" --name="SatyaChain First" -v -e="entropy"
    $SNARKJS powersoftau prepare phase2 "$BUILD_DIR/pot12_0001.ptau" "$PTAU_FILE" -v
fi

echo "✅ Powers of Tau ready: $PTAU_FILE"
echo "📜 To export Groth16 Verifier Solidity Contract:"
echo "   $SNARKJS zkey export solidityverifier $BUILD_DIR/ageProof_final.zkey $CONTRACTS_DIR/Verifier.sol"
echo "🎉 ZKP Compilation Script Complete!"
