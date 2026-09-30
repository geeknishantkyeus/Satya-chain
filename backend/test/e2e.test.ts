import { expect } from "chai";
import hre from "hardhat";

describe("Satya-Chain End-to-End (E2E) Integration Tests", function () {
  let connection: any;
  let deployer: any;
  let student: any;
  let citizen: any;
  let landBuyer: any;
  let patient: any;
  let doctor: any;
  let employerVerifier: any;

  // Contracts
  let certRegistry: any;
  let certNft: any;
  let govRegistry: any;
  let landRegistry: any;
  let landNft: any;
  let healthRegistry: any;
  let healthNft: any;
  let verifier: any;

  before(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [
      deployer,
      student,
      citizen,
      landBuyer,
      patient,
      doctor,
      employerVerifier,
    ] = await ethers.getSigners();

    // Deploy all 8 contracts
    const CertRegFactory = await ethers.getContractFactory("CertificateRegistry");
    certRegistry = await CertRegFactory.deploy();
    await certRegistry.waitForDeployment();

    const CertNFTFactory = await ethers.getContractFactory("CertificateNFT");
    certNft = await CertNFTFactory.deploy();
    await certNft.waitForDeployment();

    const GovFactory = await ethers.getContractFactory("GovernmentRegistry");
    govRegistry = await GovFactory.deploy();
    await govRegistry.waitForDeployment();

    const LandRegFactory = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegFactory.deploy();
    await landRegistry.waitForDeployment();

    const LandNFTFactory = await ethers.getContractFactory("LandDeedNFT");
    landNft = await LandNFTFactory.deploy();
    await landNft.waitForDeployment();

    const HealthRegFactory = await ethers.getContractFactory("HealthcareRegistry");
    healthRegistry = await HealthRegFactory.deploy();
    await healthRegistry.waitForDeployment();

    const HealthNFTFactory = await ethers.getContractFactory("HealthRecordNFT");
    healthNft = await HealthNFTFactory.deploy();
    await healthNft.waitForDeployment();

    const VerifierFactory = await ethers.getContractFactory("Verifier");
    verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
  });

  describe("1. Education E2E Flow (Soulbound Degree & Revocation)", function () {
    const certId = "IITB-2026-BTECH-999";
    const ipfsPdfHash = "QmE2EEducationCertificateHash12345";
    const ipfsMetadataUri = "ipfs://QmE2EMetadataJSONHash98765";

    it("Step 1: University issues certificate on-chain", async function () {
      await certRegistry.issue(
        certId,
        "Vikram Malhotra",
        "B.Tech in Artificial Intelligence",
        ipfsPdfHash,
        student.address
      );

      const record = await certRegistry.verify(certId);
      expect(record[0]).to.equal("Vikram Malhotra");
      expect(record[1]).to.equal("B.Tech in Artificial Intelligence");
      expect(record[2]).to.equal(ipfsPdfHash);
      expect(record[4]).to.equal(true);
    });

    it("Step 2: University auto-mints Soulbound NFT (ERC-5192) to student", async function () {
      await certNft.mintCertificate(student.address, certId, ipfsMetadataUri);
      const tokenId = await certNft.certIdToToken(certId);
      expect(tokenId).to.equal(1n);

      expect(await certNft.ownerOf(tokenId)).to.equal(student.address);
      expect(await certNft.locked(tokenId)).to.equal(true);
      expect(await certNft.tokenURI(tokenId)).to.equal(ipfsMetadataUri);
    });

    it("Step 3: Verifier / Employer instantly verifies credential by ID", async function () {
      const record = await certRegistry.connect(employerVerifier).verify(certId);
      expect(record[4]).to.equal(true); // Valid
    });

    it("Step 4: Student is prevented from transferring the soulbound degree", async function () {
      const tokenId = await certNft.certIdToToken(certId);
      await expect(
        certNft.connect(student).transferFrom(student.address, employerVerifier.address, tokenId)
      ).to.be.revertedWithCustomError(certNft, "SoulboundNonTransferable");
    });

    it("Step 5: Revocation triggers on-chain burning of the Soulbound NFT", async function () {
      // Registry revokes
      await certRegistry.revoke(certId);
      const recordAfterRevoke = await certRegistry.verify(certId);
      expect(recordAfterRevoke[4]).to.equal(false);

      // NFT burned
      await certNft.revokeCertificate(certId);
      expect(await certNft.certIdToToken(certId)).to.equal(0n);
      await expect(certNft.ownerOf(1n)).to.be.revertedWithCustomError(
        certNft,
        "ERC721NonexistentToken"
      );
    });
  });

  describe("2. Government ID E2E Flow (Immutable Registry & ZKP Proof)", function () {
    const govId = "AADH-9988-7766-5544";
    const ipfsGovHash = "QmE2EGovernmentIdentityCID";

    it("Step 1: Registrar registers Aadhaar card on-chain", async function () {
      const wallet = citizen.address.toLowerCase();
      await govRegistry.issue(
        govId,
        "Aadhaar",
        "Sunita Devi",
        ipfsGovHash,
        wallet
      );

      const rec = await govRegistry.verify(govId);
      expect(rec[0]).to.equal("Sunita Devi");
      expect(rec[1]).to.equal("Aadhaar");
      expect(rec[4]).to.equal(true);
    });

    it("Step 2: Citizen retrieves credential from personal dashboard in O(1)", async function () {
      const wallet = citizen.address.toLowerCase();
      const records = await govRegistry.getRecordsByWallet(wallet);
      expect(records).to.include(govId);
    });

    it("Step 3: ZKP Verifier validates Zero-Knowledge Age Proof on-chain", async function () {
      // Proof inputs: [currentYear: 2026, minAge: 18, isValid: 1]
      const a: [bigint, bigint] = [123456789n, 987654321n];
      const b: [[bigint, bigint], [bigint, bigint]] = [
        [111111111n, 222222222n],
        [333333333n, 444444444n],
      ];
      const c: [bigint, bigint] = [555555555n, 666666666n];
      const inputs: [bigint, bigint, bigint] = [2026n, 18n, 1n];

      const isVerified = await verifier.checkProof(a, b, c, inputs);
      expect(isVerified).to.equal(true);
    });
  });

  describe("3. Land Registry E2E Flow (Title Deeds & Transfer Count)", function () {
    const deedId = "DEL-DLF-PHASE5-PLOT10";
    const ipfsLandHash = "QmE2ELandDeedRegistryHash";
    const ipfsMetadataUri = "ipfs://QmE2ELandNFTMetadataURI";

    it("Step 1: Sub-Registrar issues title deed & mints Land Deed NFT", async function () {
      await landRegistry.issue(
        deedId,
        "Sale Deed",
        "Karan Singhania",
        "Plot 10, DLF Phase 5, Gurugram",
        ipfsLandHash,
        deployer.address.toLowerCase()
      );

      await landNft.mintDeed(deployer.address, deedId, ipfsMetadataUri);
      const tokenId = await landNft.deedIdToToken(deedId);
      expect(tokenId).to.equal(1n);
      expect(await landNft.ownerOf(tokenId)).to.equal(deployer.address);
      expect(await landNft.transferCount(tokenId)).to.equal(0n);
    });

    it("Step 2: Property is sold and NFT deed is transferred to Buyer", async function () {
      const tokenId = await landNft.deedIdToToken(deedId);
      await landNft.transferFrom(deployer.address, landBuyer.address, tokenId);

      // Ownership updated
      expect(await landNft.ownerOf(tokenId)).to.equal(landBuyer.address);

      // Audit trail: Transfer count permanently incremented
      expect(await landNft.transferCount(tokenId)).to.equal(1n);

      // Enumerable validation
      expect(await landNft.balanceOf(landBuyer.address)).to.equal(1n);
      expect(await landNft.tokenOfOwnerByIndex(landBuyer.address, 0n)).to.equal(tokenId);
    });
  });

  describe("4. Healthcare E2E Flow (Medical Record & Patient ACL)", function () {
    const recordId = "HLT-2026-AIIMS-CARDIO-001";
    const ipfsMedicalHash = "QmE2EMedicalPrescriptionCID";
    const ipfsMetadataUri = "ipfs://QmE2EHealthMetadataURI";

    it("Step 1: Hospital registers medical record and mints patient-controlled NFT", async function () {
      await healthRegistry.issue(
        recordId,
        "Cardiology Report",
        "Meera Nair",
        "Dr. R. Sen (AIIMS)",
        ipfsMedicalHash,
        patient.address.toLowerCase()
      );

      await healthNft.mintRecord(patient.address, recordId, ipfsMetadataUri);
      const tokenId = await healthNft.recordIdToToken(recordId);
      expect(tokenId).to.equal(1n);
      expect(await healthNft.ownerOf(tokenId)).to.equal(patient.address);
      expect(await healthNft.locked(tokenId)).to.equal(true);
    });

    it("Step 2: Patient grants temporary viewing access to attending doctor", async function () {
      const tokenId = await healthNft.recordIdToToken(recordId);
      expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(false);

      // Patient grants access
      await healthNft.connect(patient).grantAccess(tokenId, doctor.address);
      expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(true);
    });

    it("Step 3: Patient revokes doctor access once consultation is finished", async function () {
      const tokenId = await healthNft.recordIdToToken(recordId);
      await healthNft.connect(patient).revokeAccess(tokenId, doctor.address);
      expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(false);
    });
  });
});
