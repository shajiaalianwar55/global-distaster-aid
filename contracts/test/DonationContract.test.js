const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationContract", function () {
  let donationContract;
  let usdcToken;
  let owner;
  let donor;
  let recipient;

  beforeEach(async function () {
    [owner, donor, recipient] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdcToken = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdcToken.waitForDeployment();

    // Deploy DonationContract
    const DonationContract = await ethers.getContractFactory("DonationContract");
    donationContract = await DonationContract.deploy(await usdcToken.getAddress());
    await donationContract.waitForDeployment();
  });

  it("Should verify recipient", async function () {
    await donationContract.verifyRecipient(recipient.address);
    expect(await donationContract.verifiedRecipients(recipient.address)).to.be.true;
  });

  it("Should accept native ETH donations", async function () {
    await donationContract.verifyRecipient(recipient.address);
    
    const donationAmount = ethers.parseEther("1.0");
    await expect(
      donationContract.connect(donor).donateNative(recipient.address, { value: donationAmount })
    ).to.emit(donationContract, "DonationMade");

    expect(await donationContract.recipientBalances(recipient.address)).to.equal(donationAmount);
  });

  it("Should reject donations to unverified recipients", async function () {
    const donationAmount = ethers.parseEther("1.0");
    await expect(
      donationContract.connect(donor).donateNative(recipient.address, { value: donationAmount })
    ).to.be.revertedWith("Recipient must be verified");
  });
});

