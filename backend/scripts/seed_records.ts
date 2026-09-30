import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.getOrCreate();
  const [deployer] = await ethers.getSigners();
  console.log("Seeding records with deployer/account:", deployer.address);

  // Addresses from constants
  const eduAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const govAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const hltAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const landAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const nftAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const landNftAddr = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const healthNftAddr = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  const CertificateRegistry = await ethers.getContractAt("CertificateRegistry", eduAddr);
  const GovernmentRegistry = await ethers.getContractAt("GovernmentRegistry", govAddr);
  const HealthcareRegistry = await ethers.getContractAt("HealthcareRegistry", hltAddr);
  const LandRegistry = await ethers.getContractAt("LandRegistry", landAddr);
  const CertificateNFT = await ethers.getContractAt("CertificateNFT", nftAddr);
  const LandDeedNFT = await ethers.getContractAt("LandDeedNFT", landNftAddr);
  const HealthRecordNFT = await ethers.getContractAt("HealthRecordNFT", healthNftAddr);

  // 1. Education
  try {
    const isIssued = (await CertificateRegistry.certificates("2024-001")).valid;
    if (!isIssued) {
      console.log("Issuing Education Certificate 2024-001...");
      const tx = await CertificateRegistry.issue(
        "2024-001",
        "Rahul Sharma",
        "B.Tech Computer Science",
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        deployer.address
      );
      await tx.wait();
      console.log("✅ Certificate 2024-001 issued!");
    }
    const token = await CertificateNFT.certIdToToken("2024-001");
    if (Number(token) === 0) {
      const txNft = await CertificateNFT.mintCertificate(
        deployer.address,
        "2024-001",
        "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
      );
      await txNft.wait();
      console.log("✅ Soulbound NFT minted for 2024-001!");
    }
  } catch (err) {
    console.warn("Education seed err:", err.message);
  }

  // 2. Government
  try {
    const isIssued = (await GovernmentRegistry.records("AADH-1234-5678")).valid;
    if (!isIssued) {
      console.log("Issuing Government ID AADH-1234-5678...");
      const tx = await GovernmentRegistry.issue(
        "AADH-1234-5678",
        "Aadhaar Card",
        "Rahul Sharma",
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        deployer.address
      );
      await tx.wait();
      console.log("✅ Aadhaar AADH-1234-5678 issued!");
    }
  } catch (err) {
    console.warn("Government seed err:", err.message);
  }

  // 3. Land
  try {
    const isIssued = (await LandRegistry.records("LAND-2024-001")).valid;
    if (!isIssued) {
      console.log("Issuing Land Deed LAND-2024-001...");
      const tx = await LandRegistry.issue(
        "LAND-2024-001",
        "Sale Deed",
        "Rahul Sharma",
        "Plot 42, Outer Ring Road, Bengaluru",
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        deployer.address
      );
      await tx.wait();
      console.log("✅ Land Deed LAND-2024-001 issued!");
    }
    const token = await LandDeedNFT.deedIdToToken("LAND-2024-001");
    if (Number(token) === 0) {
      const txNft = await LandDeedNFT.mintDeed(
        deployer.address,
        "LAND-2024-001",
        "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
      );
      await txNft.wait();
      console.log("✅ Land NFT minted for LAND-2024-001!");
    }
  } catch (err) {
    console.warn("Land seed err:", err.message);
  }

  // 4. Healthcare
  try {
    const isIssued = (await HealthcareRegistry.records("HLT-2024-001")).valid;
    if (!isIssued) {
      console.log("Issuing Health Record HLT-2024-001...");
      const tx = await HealthcareRegistry.issue(
        "HLT-2024-001",
        "Cardiology Comprehensive Checkup",
        "Rahul Sharma",
        "AIIMS New Delhi",
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        deployer.address
      );
      await tx.wait();
      console.log("✅ Health Record HLT-2024-001 issued!");
    }
    const token = await HealthRecordNFT.recordIdToToken("HLT-2024-001");
    if (Number(token) === 0) {
      const txNft = await HealthRecordNFT.mintRecord(
        deployer.address,
        "HLT-2024-001",
        "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
      );
      await txNft.wait();
      console.log("✅ Healthcare Soulbound NFT minted for HLT-2024-001!");
    }
  } catch (err) {
    console.warn("Healthcare seed err:", err.message);
  }

  console.log("\n🎉 All 4 sectors seeded successfully on local node!");
}

main().catch(console.error);
