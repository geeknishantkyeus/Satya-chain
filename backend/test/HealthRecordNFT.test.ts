import { expect } from "chai";
import hre from "hardhat";

describe("HealthRecordNFT Contract Tests", function () {
  let healthNft: any;
  let admin: any;
  let patient: any;
  let doctor: any;
  let unauthorized: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, patient, doctor, unauthorized] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("HealthRecordNFT");
    healthNft = await Factory.deploy();
    await healthNft.waitForDeployment();
  });

  it("Should mint a patient-controlled medical record NFT", async function () {
    await healthNft.mintRecord(patient.address, "REC-001", "ipfs://rec-001");
    expect(await healthNft.ownerOf(1n)).to.equal(patient.address);
    expect(await healthNft.locked(1n)).to.equal(true);
  });

  it("Should allow patient to grant and revoke doctor access (ACL)", async function () {
    await healthNft.mintRecord(patient.address, "REC-001", "ipfs://rec-001");
    const tokenId = await healthNft.recordIdToToken("REC-001");

    // Initially doctor has no access
    expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(false);

    // Patient grants access
    await healthNft.connect(patient).grantAccess(tokenId, doctor.address);
    expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(true);

    // Patient revokes access
    await healthNft.connect(patient).revokeAccess(tokenId, doctor.address);
    expect(await healthNft.hasAccess(tokenId, doctor.address)).to.equal(false);
  });

  it("Should prevent unauthorized users from managing doctor access", async function () {
    await healthNft.mintRecord(patient.address, "REC-001", "ipfs://rec-001");
    const tokenId = await healthNft.recordIdToToken("REC-001");

    await expect(
      healthNft.connect(unauthorized).grantAccess(tokenId, doctor.address)
    ).to.be.revertedWithCustomError(healthNft, "NotTokenOwner");
  });

  it("Should block transfers of medical record (Soulbound)", async function () {
    await healthNft.mintRecord(patient.address, "REC-001", "ipfs://rec-001");
    await expect(
      healthNft.connect(patient).transferFrom(patient.address, unauthorized.address, 1n)
    ).to.be.revertedWithCustomError(healthNft, "SoulboundNonTransferable");
  });
});
