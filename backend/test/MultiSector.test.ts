import { expect } from "chai";
import hre from "hardhat";

describe("Multi-Sector Contracts Suite", function () {
  let admin: any;
  let user1: any;
  let user2: any;
  let doctor: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, user1, user2, doctor] = await ethers.getSigners();
  });

  describe("CertificateNFT (Soulbound)", function () {
    let nft: any;

    beforeEach(async function () {
      const Factory = await connection.ethers.getContractFactory("CertificateNFT");
      nft = await Factory.deploy();
      await nft.waitForDeployment();
    });

    it("Should mint soulbound certificate NFT", async function () {
      await nft.mintCertificate(user1.address, "EDU-101", "ipfs://metadata-101");
      const tokenId = await nft.certIdToToken("EDU-101");
      expect(tokenId).to.equal(1n);
      expect(await nft.ownerOf(1n)).to.equal(user1.address);
      expect(await nft.tokenURI(1n)).to.equal("ipfs://metadata-101");
      expect(await nft.locked(1n)).to.equal(true);
    });

    it("Should block transfer of soulbound NFT", async function () {
      await nft.mintCertificate(user1.address, "EDU-101", "ipfs://metadata-101");
      await expect(
        nft.connect(user1).transferFrom(user1.address, user2.address, 1n)
      ).to.be.revertedWithCustomError(nft, "SoulboundNonTransferable");
    });

    it("Should allow admin to burn NFT on certificate revoke", async function () {
      await nft.mintCertificate(user1.address, "EDU-101", "ipfs://metadata-101");
      await nft.revokeCertificate("EDU-101");
      expect(await nft.certIdToToken("EDU-101")).to.equal(0n);
      await expect(nft.ownerOf(1n)).to.be.revertedWithCustomError(
        nft,
        "ERC721NonexistentToken"
      );
    });
  });

  describe("GovernmentRegistry", function () {
    let govRegistry: any;

    beforeEach(async function () {
      const Factory = await connection.ethers.getContractFactory("GovernmentRegistry");
      govRegistry = await Factory.deploy();
      await govRegistry.waitForDeployment();
    });

    it("Should issue and verify government ID", async function () {
      await govRegistry.issue("AADH-1001", "Aadhaar", "Amit Kumar", "QmGovHash", user1.address.toLowerCase());
      const rec = await govRegistry.verify("AADH-1001");
      expect(rec[0]).to.equal("Amit Kumar");
      expect(rec[1]).to.equal("Aadhaar");
      expect(rec[4]).to.equal(true);
    });

    it("Should retrieve records by holder wallet in O(1)", async function () {
      const wallet = user1.address.toLowerCase();
      await govRegistry.issue("AADH-1001", "Aadhaar", "Amit Kumar", "Qm1", wallet);
      await govRegistry.issue("PAN-2002", "PAN", "Amit Kumar", "Qm2", wallet);

      const records = await govRegistry.getRecordsByWallet(wallet);
      expect(records.length).to.equal(2);
      expect(records[0]).to.equal("AADH-1001");
      expect(records[1]).to.equal("PAN-2002");
    });

    it("Should revoke government credential", async function () {
      await govRegistry.issue("AADH-1001", "Aadhaar", "Amit Kumar", "Qm1", user1.address.toLowerCase());
      await govRegistry.revoke("AADH-1001");
      const rec = await govRegistry.verify("AADH-1001");
      expect(rec[4]).to.equal(false);
    });
  });

  describe("LandRegistry and LandDeedNFT", function () {
    let landRegistry: any;
    let landNft: any;

    beforeEach(async function () {
      const RegFactory = await connection.ethers.getContractFactory("LandRegistry");
      landRegistry = await RegFactory.deploy();
      await landRegistry.waitForDeployment();

      const NFTFactory = await connection.ethers.getContractFactory("LandDeedNFT");
      landNft = await NFTFactory.deploy();
      await landNft.waitForDeployment();
    });

    it("Should issue land record and index by wallet", async function () {
      const wallet = user1.address.toLowerCase();
      await landRegistry.issue("LAND-001", "Title Deed", "Rajesh", "Mumbai 400001", "QmLand", wallet);
      const rec = await landRegistry.verify("LAND-001");
      expect(rec[0]).to.equal("Rajesh");
      expect(rec[1]).to.equal("Title Deed");
      expect(rec[2]).to.equal("Mumbai 400001");

      const deeds = await landRegistry.getRecordsByWallet(wallet);
      expect(deeds.length).to.equal(1);
      expect(deeds[0]).to.equal("LAND-001");
    });

    it("Should allow transfer of land deed NFT and increment transferCount", async function () {
      await landNft.mintDeed(user1.address, "LAND-001", "ipfs://land-metadata");
      expect(await landNft.ownerOf(1n)).to.equal(user1.address);
      expect(await landNft.transferCount(1n)).to.equal(0n);

      // User1 transfers land deed to User2
      await landNft.connect(user1).transferFrom(user1.address, user2.address, 1n);
      expect(await landNft.ownerOf(1n)).to.equal(user2.address);
      expect(await landNft.transferCount(1n)).to.equal(1n);

      // Enumerable check
      expect(await landNft.balanceOf(user2.address)).to.equal(1n);
      expect(await landNft.tokenOfOwnerByIndex(user2.address, 0n)).to.equal(1n);
    });
  });

  describe("HealthcareRegistry and HealthRecordNFT", function () {
    let healthRegistry: any;
    let healthNft: any;

    beforeEach(async function () {
      const RegFactory = await connection.ethers.getContractFactory("HealthcareRegistry");
      healthRegistry = await RegFactory.deploy();
      await healthRegistry.waitForDeployment();

      const NFTFactory = await connection.ethers.getContractFactory("HealthRecordNFT");
      healthNft = await NFTFactory.deploy();
      await healthNft.waitForDeployment();
    });

    it("Should issue health record and index by patient wallet", async function () {
      const wallet = user1.address.toLowerCase();
      await healthRegistry.issue("HLT-001", "Prescription", "Priya", "Dr. Sharma", "QmHealth", wallet);
      const rec = await healthRegistry.verify("HLT-001");
      expect(rec[0]).to.equal("Priya");
      expect(rec[1]).to.equal("Prescription");
      expect(rec[2]).to.equal("Dr. Sharma");

      const records = await healthRegistry.getRecordsByWallet(wallet);
      expect(records.length).to.equal(1);
      expect(records[0]).to.equal("HLT-001");
    });

    it("Should manage patient-controlled doctor access control (ACL)", async function () {
      await healthNft.mintRecord(user1.address, "HLT-001", "ipfs://health-metadata");
      const tokenId = await healthNft.recordIdToToken("HLT-001");

      // Initially doctor has no access
      expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(false);

      // Other user cannot grant access
      await expect(
        healthNft.connect(user2).grantAccess(tokenId, doctor.address)
      ).to.be.revertedWithCustomError(healthNft, "NotTokenOwner");

      // Patient grants access to doctor
      await healthNft.connect(user1).grantAccess(tokenId, doctor.address);
      expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(true);

      // Patient revokes access from doctor
      await healthNft.connect(user1).revokeAccess(tokenId, doctor.address);
      expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(false);
    });

    it("Should block transfers of health record NFT (Soulbound)", async function () {
      await healthNft.mintRecord(user1.address, "HLT-001", "ipfs://health-metadata");
      await expect(
        healthNft.connect(user1).transferFrom(user1.address, user2.address, 1n)
      ).to.be.revertedWithCustomError(healthNft, "SoulboundNonTransferable");
    });
  });
});
