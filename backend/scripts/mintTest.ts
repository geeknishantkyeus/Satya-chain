import hre from "hardhat";

async function main() {
  const connection = await hre.network.create();
  const [deployer, student] = await connection.ethers.getSigners();

  // 1. Deploy fresh
  const CertificateNFT = await connection.ethers.getContractFactory("CertificateNFT");
  const nft = await CertificateNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("Deployed to:", nftAddress);

  console.log("Admin:", deployer.address);
  console.log("Student:", student.address);

  // 2. Mint
  const tx = await nft.mintCertificate(
    student.address,
    "EDU-TEST-001",
    "ipfs://QmTestMetadataHash"
  );
  await tx.wait();
  console.log("Minted token ID 1 to student");

  // 3. Check ownership
  const owner = await nft.ownerOf(1);
  console.log("ownerOf(1):", owner);

  // 4. Check tokenURI
  const uri = await nft.tokenURI(1);
  console.log("tokenURI(1):", uri);

  // 5. Check soulbound
  const isLocked = await nft.locked(1);
  console.log("locked(1):", isLocked);

  // 6. Try transfer — should FAIL
  try {
    await nft.connect(student).transferFrom(student.address, deployer.address, 1);
    console.log("❌ Transfer succeeded — soulbound is BROKEN");
  } catch (e: any) {
    console.log("✅ Transfer blocked (soulbound works)");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});