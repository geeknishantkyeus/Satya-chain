import hre from "hardhat";

async function main() {
  // Create a network connection
  const connection = await hre.network.create();
  
  // Get signers and ethers from the connection
  const [deployer] = await connection.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const CertificateNFT = await connection.ethers.getContractFactory("CertificateNFT");
  const nft = await CertificateNFT.deploy();
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("CertificateNFT deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});