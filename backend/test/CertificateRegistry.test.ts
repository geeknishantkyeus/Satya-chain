import { expect } from "chai";
import hre from "hardhat";

describe("CertificateRegistry", function () {
  let registry: any;
  let admin: any;
  let student: any;
  let other: any;

  beforeEach(async function () {
    const { ethers } = await hre.network.create();
    [admin, student, other] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("CertificateRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it("Should set admin correctly", async function () {
    expect(await registry.admin()).to.equal(admin.address);
  });

  it("Should issue a certificate", async function () {
    await registry.issue("2024-001", "Rahul", "B.Tech", "QmXyz", student.address);
    const c = await registry.verify("2024-001");
    expect(c[0]).to.equal("Rahul");
    expect(c[1]).to.equal("B.Tech");
    expect(c[2]).to.equal("QmXyz");
    expect(c[4]).to.equal(true);
  });

  it("Should reject duplicate ID", async function () {
    await registry.issue("2024-001", "Rahul", "B.Tech", "QmXyz", student.address);
    await expect(
      registry.issue("2024-001", "Priya", "MBA", "QmAbc", student.address)
    ).to.be.revertedWith("ID exists");
  });

  it("Should reject non-admin issue", async function () {
    await expect(
      registry.connect(other).issue("2024-002", "Priya", "MBA", "QmAbc", student.address)
    ).to.be.revertedWith("Not admin");
  });

  it("Should revoke a certificate", async function () {
    await registry.issue("2024-001", "Rahul", "B.Tech", "QmXyz", student.address);
    await registry.revoke("2024-001");
    const c = await registry.verify("2024-001");
    expect(c[4]).to.equal(false);
  });

  it("Should reject revoke of non-existent", async function () {
    await expect(registry.revoke("9999")).to.be.revertedWith("Not found or already revoked");
  });

  it("Should track certificates by student", async function () {
    await registry.issue("2024-001", "Rahul", "B.Tech", "QmXyz", student.address);
    await registry.issue("2024-002", "Rahul", "MBA", "QmAbc", student.address);
    const certs = await registry.getCertificatesByStudent(student.address);
    expect(certs.length).to.equal(2);
    expect(certs[0]).to.equal("2024-001");
    expect(certs[1]).to.equal("2024-002");
  });

  it("Should index certificates for the correct student", async function () {
    await registry.issue("2024-001", "Rahul", "B.Tech", "QmXyz", student.address);
    await registry.issue("2024-002", "Priya", "MBA", "QmAbc", other.address);

    const studentCerts = await registry.getCertificatesByStudent(student.address);
    const otherCerts = await registry.getCertificatesByStudent(other.address);

    expect(studentCerts.length).to.equal(1);
    expect(studentCerts[0]).to.equal("2024-001");
    expect(otherCerts.length).to.equal(1);
    expect(otherCerts[0]).to.equal("2024-002");
  });

  it("Should return empty array for student with no certificates", async function () {
    const certs = await registry.getCertificatesByStudent(student.address);
    expect(certs.length).to.equal(0);
  });

  it("Should emit Issued event", async function () {
    await expect(
      registry.issue("2024-001", "Rahul", "B.Tech", "QmXyz", student.address)
    ).to.emit(registry, "Issued");
  });
});
