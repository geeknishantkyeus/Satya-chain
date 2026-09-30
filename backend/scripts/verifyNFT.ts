import hre from "hardhat";

async function main() {
  const connection = await hre.network.create();
  const [admin, student] = await connection.ethers.getSigners();

  // Use the CertificateNFT address from constants.js
  const nftAddress = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
  const nft = await connection.ethers.getContractAt("CertificateNFT", nftAddress);

  console.log("=== Verifying NFT #1 ===");
  const owner = await nft.ownerOf(1);
  console.log("ownerOf(1):", owner);
  console.log("Student address:", student.address);
  console.log("Match?", owner.toLowerCase() === student.address.toLowerCase());

  const uri = await nft.tokenURI(1);
  console.log("tokenURI(1):", uri);

  const locked = await nft.locked(1);
  console.log("locked(1):", locked);

  const tokenIdFromCert = await nft.certIdToToken("TEST-001");
  console.log("certIdToToken('TEST-001'):", tokenIdFromCert.toString());

  const total = await nft.totalMinted();
  console.log("totalMinted():", total.toString());

  console.log("\n=== Trying transfer (should fail) ===");
  try {
    await nft.connect(student).transferFrom(student.address, admin.address, 1);
    console.log("❌ Transfer succeeded — soulbound BROKEN");
  } catch (e: any) {
    console.log("✅ Transfer blocked:", e.shortMessage || "reverted");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});