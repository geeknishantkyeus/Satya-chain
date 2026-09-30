import { expect } from "chai";
import hre from "hardhat";

describe("HealthcareRegistry Contract Tests", function () {
  let healthRegistry: any;
  let admin: any;
  let patient: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, patient] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("HealthcareRegistry");
    healthRegistry = await Factory.deploy();
    await healthRegistry.waitForDeployment();
  });

  it("Should issue and verify a healthcare record", async function () {
    const wallet = patient.address.toLowerCase();
    await healthRegistry.issue("HLT-505", "Prescription", "Priya", "Dr. Mehta", "QmHealth505", wallet);
    const rec = await healthRegistry.verify("HLT-505");
    expect(rec[0]).to.equal("Priya");
    expect(rec[1]).to.equal("Prescription");
    expect(rec[2]).to.equal("Dr. Mehta");
    expect(rec[5]).to.equal(true);
  });

  it("Should index records by patient wallet", async function () {
    const wallet = patient.address.toLowerCase();
    await healthRegistry.issue("HLT-505", "Prescription", "Priya", "Dr. Mehta", "QmHealth505", wallet);
    const records = await healthRegistry.getRecordsByWallet(wallet);
    expect(records.length).to.equal(1);
    expect(records[0]).to.equal("HLT-505");
  });

  it("Should revoke a healthcare record", async function () {
    const wallet = patient.address.toLowerCase();
    await healthRegistry.issue("HLT-505", "Prescription", "Priya", "Dr. Mehta", "QmHealth505", wallet);
    await healthRegistry.revoke("HLT-505");
    const rec = await healthRegistry.verify("HLT-505");
    expect(rec[5]).to.equal(false);
  });
});
