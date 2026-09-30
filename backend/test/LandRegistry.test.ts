import { expect } from "chai";
import hre from "hardhat";

describe("LandRegistry Contract Tests", function () {
  let landRegistry: any;
  let admin: any;
  let owner1: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, owner1] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("LandRegistry");
    landRegistry = await Factory.deploy();
    await landRegistry.waitForDeployment();
  });

  it("Should issue and verify a land title deed", async function () {
    const wallet = owner1.address.toLowerCase();
    await landRegistry.issue("LAND-404", "Sale Deed", "Rajesh", "Mumbai Plot 42", "QmLand404", wallet);
    const rec = await landRegistry.verify("LAND-404");
    expect(rec[0]).to.equal("Rajesh");
    expect(rec[1]).to.equal("Sale Deed");
    expect(rec[2]).to.equal("Mumbai Plot 42");
    expect(rec[5]).to.equal(true);
  });

  it("Should index deeds by owner wallet", async function () {
    const wallet = owner1.address.toLowerCase();
    await landRegistry.issue("LAND-404", "Sale Deed", "Rajesh", "Mumbai Plot 42", "QmLand404", wallet);
    const deeds = await landRegistry.getRecordsByWallet(wallet);
    expect(deeds.length).to.equal(1);
    expect(deeds[0]).to.equal("LAND-404");
  });

  it("Should reject duplicate land deed ID", async function () {
    const wallet = owner1.address.toLowerCase();
    await landRegistry.issue("LAND-404", "Sale Deed", "Rajesh", "Mumbai Plot 42", "QmLand404", wallet);
    await expect(
      landRegistry.issue("LAND-404", "Sale Deed", "Rajesh", "Duplicate", "QmDup", wallet)
    ).to.be.revertedWith("Record exists");
  });

  it("Should revoke a land deed record", async function () {
    const wallet = owner1.address.toLowerCase();
    await landRegistry.issue("LAND-404", "Sale Deed", "Rajesh", "Mumbai Plot 42", "QmLand404", wallet);
    await landRegistry.revoke("LAND-404");
    const rec = await landRegistry.verify("LAND-404");
    expect(rec[5]).to.equal(false);
  });
});
