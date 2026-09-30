import { expect } from "chai";
import hre from "hardhat";

describe("LandDeedNFT Contract Tests", function () {
  let landNft: any;
  let admin: any;
  let buyer1: any;
  let buyer2: any;
  let connection: any;

  beforeEach(async function () {
    connection = await hre.network.create();
    const { ethers } = connection;
    [admin, buyer1, buyer2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("LandDeedNFT");
    landNft = await Factory.deploy();
    await landNft.waitForDeployment();
  });

  it("Should mint a transferable land deed NFT", async function () {
    await landNft.mintDeed(buyer1.address, "DEED-001", "ipfs://deed-001");
    expect(await landNft.ownerOf(1n)).to.equal(buyer1.address);
    expect(await landNft.transferCount(1n)).to.equal(0n);
    expect(await landNft.tokenURI(1n)).to.equal("ipfs://deed-001");
  });

  it("Should allow transfer upon sale and track transfer count", async function () {
    await landNft.mintDeed(buyer1.address, "DEED-001", "ipfs://deed-001");
    // Buyer1 transfers deed to Buyer2
    await landNft.connect(buyer1).transferFrom(buyer1.address, buyer2.address, 1n);
    expect(await landNft.ownerOf(1n)).to.equal(buyer2.address);
    expect(await landNft.transferCount(1n)).to.equal(1n);

    // Enumerable check
    expect(await landNft.balanceOf(buyer2.address)).to.equal(1n);
    expect(await landNft.tokenOfOwnerByIndex(buyer2.address, 0n)).to.equal(1n);
  });

  it("Should reject duplicate deed minting", async function () {
    await landNft.mintDeed(buyer1.address, "DEED-001", "ipfs://deed-001");
    await expect(
      landNft.mintDeed(buyer2.address, "DEED-001", "ipfs://duplicate")
    ).to.be.revertedWithCustomError(landNft, "DeedAlreadyMinted");
  });
});
