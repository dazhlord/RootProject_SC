var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var PensionFundRelease = artifacts.require("./PensionFundRelease.sol");


contract('PensionFundRelease', function(accounts) {
  var validators = [accounts[0], accounts[1]];
  var worker = accounts[2];
  var unauthorized = accounts[3];

  var deployParams = [[accounts[0], accounts[1]], accounts[2], 100, 23123434, 999, 100]

  it("should return firstPaymentPercent", function() {
    return PensionFundRelease.deployed().then(function(instance) {
      return instance.firstPaymentPercent.call();
    }).then(function(percent) {
      return percent.toNumber();
    }).should.eventually.equal(100);
  });
  it("should return validators", function() {
    return PensionFundRelease.deployed().then(function(instance) {
      return instance.validators.call(0);
    }).should.eventually.equal(validators[0]) ;
  });
  
  it("should allow validators to vote", function() {
    var instance;
    return PensionFundRelease.deployed().then(function(inst) {
      instance = inst;
      return instance.vote(true, "justification", {from: validators[0]});
    }).then(function() {
      return instance.voteIndex.call(validators[0]);
    }).then(function(index) {
      return instance.votes.call(index);
    }).then(function(vote){
      return vote[2];
    }).should.be.eventually.equal("justification");
  });

  it("should not allow non-validators to vote", function() {
    return PensionFundRelease.deployed().then(function(inst) {
      return instance.vote(true, "justification", {from: unauthorized});
    }).should.be.rejected;
  });

  it("should allow release after all validators approval", function() {
    var instance;
    return PensionFundRelease.new.apply(this, deployParams).then(function(inst) {
      instance = inst;
      return instance.vote(true, "justification", {from: validators[0]});
    }).then(function() {
      return instance.vote(true, "justification", {from: validators[1]});
    }).then(function() {
      return instance.isReleaseApproved.call();
    }).should.be.eventually.equal(true);
  });

  it("should not allow release if not all validators approved release", function() {
    var instance;
    return PensionFundRelease.new.apply(this, deployParams).then(function(inst) {
      instance = inst;
      return instance.vote(true, "justification", {from: validators[0]});
    }).then(function() {
      return instance.isReleaseApproved.call();
    }).should.be.eventually.equal(false);
  });

  it("should allow burn after all validators rejection", function() {
    var instance;
    return PensionFundRelease.new.apply(this, deployParams).then(function(inst) {
      instance = inst;
      return instance.vote(false, "justification", {from: validators[0]});
    }).then(function() {
      return instance.vote(false, "justification", {from: validators[1]});
    }).then(function() {
      return instance.isBurnApproved.call();
    }).should.be.eventually.equal(true);
  });

  it("should not allow burn if not all validators approved release", function() {
    var instance;
    return PensionFundRelease.new.apply(this, deployParams).then(function(inst) {
      instance = inst;
      return instance.vote(false, "justification", {from: validators[0]});
    }).then(function() {
      return instance.isBurnApproved.call();
    }).should.be.eventually.equal(false);
  });
});
