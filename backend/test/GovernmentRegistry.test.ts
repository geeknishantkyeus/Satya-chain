import { expect } from "chai";
import hre from "hardhat";

describe("GovernmentRegistry Contract Tests", function () {
  let govRegistry: any;
  let admin: any;
  let citizen1: any;
  let citizen2: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, citizen1, citizen2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("GovernmentRegistry");
    govRegistry = await Factory.deploy();
    await govRegistry.waitForDeployment();
  });

  it("Should set admin correctly", async function () {
    expect(await govRegistry.admin()).to.equal(admin.address);
  });

  it("Should issue and verify a government ID", async function () {
    const wallet = citizen1.address.toLowerCase();
    await govRegistry.issue("AADH-101", "Aadhaar", "Amit Kumar", "QmGov101", wallet);
    const result = await govRegistry.verify("AADH-101");
    expect(result[0]).to.equal("Amit Kumar");
    expect(result[1]).to.equal("Aadhaar");
    expect(result[2]).to.equal("QmGov101");
    expect(result[4]).to.equal(true);
    expect(await govRegistry.total()).to.equal(1n);
  });

  it("Should reject duplicate ID issue", async function () {
    const wallet = citizen1.address.toLowerCase();
    await govRegistry.issue("AADH-101", "Aadhaar", "Amit Kumar", "QmGov101", wallet);
    await expect(
      govRegistry.issue("AADH-101", "Aadhaar", "Duplicate", "QmDup", wallet)
    ).to.be.revertedWith("ID exists");
  });

  it("Should reject non-admin issuing", async function () {
    await expect(
      govRegistry.connect(citizen1).issue("AADH-102", "Aadhaar", "Hacker", "QmHack", citizen1.address.toLowerCase())
    ).to.be.revertedWith("Not admin");
  });

  it("Should revoke a government ID", async function () {
    const wallet = citizen1.address.toLowerCase();
    await govRegistry.issue("AADH-101", "Aadhaar", "Amit Kumar", "QmGov101", wallet);
    await govRegistry.revoke("AADH-101");
    const result = await govRegistry.verify("AADH-101");
    expect(result[4]).to.equal(false);
    expect(await govRegistry.revokedCount()).to.equal(1n);
  });

  it("Should index credentials accurately by citizen wallet", async function () {
    const w1 = citizen1.address.toLowerCase();
    const w2 = citizen2.address.toLowerCase();
    await govRegistry.issue("AADH-101", "Aadhaar", "Amit", "Qm1", w1);
    await govRegistry.issue("PAN-201", "PAN", "Amit", "Qm2", w1);
    await govRegistry.issue("DL-301", "Driving License", "Pooja", "Qm3", w2);

    const recs1 = await govRegistry.getRecordsByWallet(w1);
    const recs2 = await govRegistry.getRecordsByWallet(w2);

    expect(recs1.length).to.equal(2);
    expect(recs1[0]).to.equal("AADH-101");
    expect(recs1[1]).to.equal("PAN-201");
    expect(recs2.length).to.equal(1);
    expect(recs2[0]).to.equal("DL-301");
  });
});
