const { expect } = require("chai");
// TODO intergrate into EAS service
/*
describe("TransportAndDeliveryWithAttestation", function () {
  let TransportAndDelivery;
  let transportAndDelivery;
  let attestationService;
  let owner;
  let requester;
  let serviceProvider;
  let otherAccount;

  before(async function () {
    [owner, requester, serviceProvider, otherAccount] = await ethers.getSigners();

    const AttestationService = await ethers.getContractFactory("AttestationService");
    attestationService = await AttestationService.deploy();
    await attestationService.deployed();

    TransportAndDelivery = await ethers.getContractFactory("TransportAndDeliveryWithAttestation");
    transportAndDelivery = await TransportAndDelivery.deploy(attestationService.address);
    await transportAndDelivery.deployed();
  });

  it("should create a request", async function () {
    const paymentAmount = ethers.utils.parseEther("1");

    await transportAndDelivery.connect(requester).createRequest(paymentAmount, {
      value: paymentAmount,
    });

    const request = await transportAndDelivery.requests(1);

    expect(request.requester).to.equal(requester.address);
    expect(request.paymentAmount).to.equal(paymentAmount);
  });

  it("should accept a request", async function () {
    await transportAndDelivery.connect(serviceProvider).acceptRequest(1);

    const request = await transportAndDelivery.requests(1);

    expect(request.serviceProvider).to.equal(serviceProvider.address);
  });

  it("should complete a request and rate the service provider", async function () {
    const rating = 5;

    await transportAndDelivery.connect(serviceProvider).completeRequest(1, rating);

    const request = await transportAndDelivery.requests(1);
    expect(request.completed).to.be.true;

    const totalRating = await transportAndDelivery.ratings(serviceProvider.address);
    const ratingCount = await transportAndDelivery.ratingCounts(serviceProvider.address);
    const averageRating = await transportAndDelivery.getAverageRating(serviceProvider.address);

    expect(totalRating).to.equal(rating);
    expect(ratingCount).to.equal(1);
    expect(averageRating).to.equal(rating);
  });
});
*/