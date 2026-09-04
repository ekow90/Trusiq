const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReviewAnchor", function () {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const ReviewAnchor = await ethers.getContractFactory("ReviewAnchor");
    const contract = await ReviewAnchor.deploy();
    await contract.waitForDeployment();
    return { contract, owner, other };
  }

  it("anchors a review hash and emits its values", async function () {
    const { contract, owner } = await deployFixture();
    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("review-hash"));

    await expect(
      contract.anchorReviewHash("review-1", reviewHash, "business-1"),
    )
      .to.emit(contract, "ReviewHashAnchored")
      .withArgs("review-1", reviewHash, "business-1", anyValue, owner.address);

    const anchor = await contract.getAnchor("review-1");
    expect(anchor.reviewId).to.equal("review-1");
    expect(anchor.reviewHash).to.equal(reviewHash);
    expect(anchor.businessId).to.equal("business-1");
    expect(anchor.anchoredAt).to.be.greaterThan(0);
    expect(anchor.submitter).to.equal(owner.address);
    expect(await contract.isAnchored("review-1")).to.equal(true);
  });

  it("rejects duplicate review IDs", async function () {
    const { contract } = await deployFixture();
    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("hash"));
    await contract.anchorReviewHash("review-1", reviewHash, "business-1");

    await expect(
      contract.anchorReviewHash("review-1", reviewHash, "business-1"),
    ).to.be.revertedWithCustomError(contract, "ReviewAlreadyAnchored");
  });

  it("rejects empty IDs and zero hashes", async function () {
    const { contract } = await deployFixture();
    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("hash"));

    await expect(
      contract.anchorReviewHash("", reviewHash, "business-1"),
    ).to.be.revertedWithCustomError(contract, "EmptyValue");
    await expect(
      contract.anchorReviewHash("review-1", ethers.ZeroHash, "business-1"),
    ).to.be.revertedWithCustomError(contract, "EmptyValue");
    await expect(
      contract.anchorReviewHash("review-1", reviewHash, ""),
    ).to.be.revertedWithCustomError(contract, "EmptyValue");
  });

  it("restricts anchoring to the contract owner", async function () {
    const { contract, other } = await deployFixture();
    const reviewHash = ethers.keccak256(ethers.toUtf8Bytes("hash"));

    await expect(
      contract
        .connect(other)
        .anchorReviewHash("review-1", reviewHash, "business-1"),
    ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
  });
});

const anyValue =
  require("@nomicfoundation/hardhat-chai-matchers/withArgs").anyValue;
