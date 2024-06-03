const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TransportAndDelivery", function () {
  let transportAndDelivery;
  let testToken;

  let owner;
  let requester;
  let driver;
  let otherAccount;

  const paymentAmount = ethers.parseEther("0.5");
  const totalSupply = ethers.parseEther('10');

  const requesterAmount = ethers.parseEther('5');

  beforeEach(async function () {
    // Create the smart contract object to test from
    [owner, requester, driver, otherAccount] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("MockToken");
    testToken = await TestToken.deploy(totalSupply);

    await testToken.connect(owner).transfer(requester,requesterAmount);
    const amount = await testToken.connect(requester).balanceOf(requester);

    const TransportAndDelivery = await ethers.getContractFactory("TransportAndDelivery");
    transportAndDelivery = await TransportAndDelivery.deploy(testToken.target);
});

  /**
   * Check request creation
   */
  it("should create a request", async function () {
  
    //await transportAndDelivery.connect(requester).createRequest( paymentAmount, { // Assuming _serviceType is 1
    //  value: paymentAmount,
    //  from: requester,
    //});
    await testToken.connect(requester).approve(transportAndDelivery.target,paymentAmount)
    await transportAndDelivery.connect(requester).createRequest( paymentAmount)

    const request = await transportAndDelivery.requests(1);

    expect(request.requester).to.equal(requester.address);
    expect(request.paymentAmount).to.equal(paymentAmount);

  });


  /**
   * Check courier accepting a request
   */
  
  it("should accept a request", async function () {

    await testToken.connect(requester).approve(transportAndDelivery.target,paymentAmount)
    await transportAndDelivery.connect(requester).createRequest( paymentAmount)

    //const requestOne = await transportAndDelivery.requests(1);

    await transportAndDelivery.connect(driver).acceptRequest(1, {
        from: driver,
    });

    const request = await transportAndDelivery.requests(1);
    
    expect(request.courier).to.equal(driver.address);
  });

  /**
   * Check request completion 
   */
  it("should complete a request", async function () {

    await testToken.connect(requester).approve(transportAndDelivery.target,paymentAmount)
    await transportAndDelivery.connect(requester).createRequest( paymentAmount)

    await transportAndDelivery.connect(driver).acceptRequest(1, {
        from: driver,
    });

    await transportAndDelivery.connect(driver).completeRequest(1, {
        from: driver,
    });

    const request = await transportAndDelivery.requests(1);
    expect(request.completed).to.be.true;
  });

  it("should confirm a request from requester", async function () {

    await testToken.connect(requester).approve(transportAndDelivery.target,paymentAmount)
    await transportAndDelivery.connect(requester).createRequest( paymentAmount)

    await transportAndDelivery.connect(driver).acceptRequest(1, {
        from: driver,
    });
    
    await transportAndDelivery.connect(driver).completeRequest(1, {
        from: driver,
    });

    await transportAndDelivery.connect(requester).confirmRequest(1, {
        from: requester,
    });

    const request = await transportAndDelivery.requests(1);
 
    expect(request.completed).to.be.true;
  });

  it("Checking balances", async function () {
    const rbOrgi = await testToken.balanceOf(requester);
    const cbOrgi = await testToken.balanceOf(driver);

    await testToken.connect(requester).approve(transportAndDelivery.target,paymentAmount)
    await transportAndDelivery.connect(requester).createRequest( paymentAmount)

    const requestBefore = await transportAndDelivery.requests(1);
    const contractBalance = await testToken.balanceOf(transportAndDelivery.target);

    expect(contractBalance != 0).to.be.true;

    await transportAndDelivery.connect(driver).acceptRequest(1, {
        from: driver,
    });
    
    await transportAndDelivery.connect(driver).completeRequest(1, {
        from: driver,
    });

    await transportAndDelivery.connect(requester).confirmRequest(1, {
        from: requester,
    });

    await transportAndDelivery.connect(requester).payout(1, {
      from: requester,
    });

    const contractBalanceAfter = await testToken.balanceOf(transportAndDelivery.target);

    expect(contractBalanceAfter == 0).to.be.true;

    const rbAfter = await testToken.balanceOf(requester);
    const cbAfter = await testToken.balanceOf(driver);
    
    expect(rbOrgi != rbAfter).to.be.true;
    expect(cbOrgi != cbAfter).to.be.true;

    const request = await transportAndDelivery.requests(1);
    expect(request.completed).to.be.true;
  });
});
