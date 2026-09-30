import { expect } from "chai";
import hre from "hardhat";

describe("CertificateNFT Contract Tests", function () {
  let nft: any;
  let admin: any;
  let student: any;
  let other: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, student, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CertificateNFT");
    nft = await Factory.deploy();
    await nft.waitForDeployment();
  });

  it("Should set owner correctly to deployer", async function () {
    expect(await nft.owner()).to.equal(admin.address);
  });

  it("Should mint a soulbound certificate NFT", async function () {
    await nft.mintCertificate(student.address, "CERT-001", "ipfs://cert-001-metadata");
    const tokenId = await nft.certIdToToken("CERT-001");
    expect(tokenId).to.equal(1n);
    expect(await nft.ownerOf(1n)).to.equal(student.address);
    expect(await nft.tokenURI(1n)).to.equal("ipfs://cert-001-metadata");
    expect(await nft.locked(1n)).to.equal(true);
    expect(await nft.totalMinted()).to.equal(1n);
  });

  it("Should reject duplicate certificate mint", async function () {
    await nft.mintCertificate(student.address, "CERT-001", "ipfs://cert-001-metadata");
    await expect(
      nft.mintCertificate(student.address, "CERT-001", "ipfs://duplicate")
    ).to.be.revertedWithCustomError(nft, "CertificateAlreadyMinted");
  });

  it("Should reject minting by non-owner", async function () {
    await expect(
      nft.connect(other).mintCertificate(student.address, "CERT-002", "ipfs://fake")
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("Should block transfers (Soulbound)", async function () {
    await nft.mintCertificate(student.address, "CERT-001", "ipfs://cert-001-metadata");
    await expect(
      nft.connect(student).transferFrom(student.address, other.address, 1n)
    ).to.be.revertedWithCustomError(nft, "SoulboundNonTransferable");
  });

  it("Should block approvals (Soulbound)", async function () {
    await nft.mintCertificate(student.address, "CERT-001", "ipfs://cert-001-metadata");
    await expect(
      nft.connect(student).approve(other.address, 1n)
    ).to.be.revertedWithCustomError(nft, "SoulboundNonTransferable");
  });

  it("Should allow admin to burn NFT on certificate revocation", async function () {
    await nft.mintCertificate(student.address, "CERT-001", "ipfs://cert-001-metadata");
    await nft.revokeCertificate("CERT-001");
    expect(await nft.certIdToToken("CERT-001")).to.equal(0n);
    await expect(nft.ownerOf(1n)).to.be.revertedWithCustomError(
      nft,
      "ERC721NonexistentToken"
    );
  });
});
