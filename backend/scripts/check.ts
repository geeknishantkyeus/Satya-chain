import hre from "hardhat";

async function main() {
  const address = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const { ethers } = await hre.network.connect();
  
  const Registry = await ethers.getContractAt("CertificateRegistry", address);
  
  const admin = await Registry.admin();
  const [deployer] = await ethers.getSigners();
  
  console.log("📬 Contract Admin:", admin);
  console.log("🔑 Your Wallet:  ", deployer.address);
  console.log("✅ You are admin?", admin.toLowerCase() === deployer.address.toLowerCase());
}

main().catch(console.error);