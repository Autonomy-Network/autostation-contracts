
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, BigNumberish, Contract, ContractReceipt, PopulatedTransaction } from 'ethers';

import { TimeConditions } from '@autonomy-station/typechain-types/TimeConditions';
import { TimeConditions__factory } from '@autonomy-station/typechain-types/factories/TimeConditions__factory';

import wethAbi from './weth.abi.json';
import registryAbi from './autonomy-registry.abi.json';


const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ONE_ETHER = ethers.utils.parseEther('1');

describe('TimeConditions contract', () => {

  let owner: SignerWithAddress;
  let accountA: SignerWithAddress;
  let timeConditions: TimeConditions;

  beforeEach(async () => {
    [ owner, accountA ] = await ethers.getSigners();
    
    const factory = await ethers.getContractFactory('TimeConditions', owner) as TimeConditions__factory;
    timeConditions = await factory.deploy();
  });

  describe('Test "executeAt" function', () => {

    it('Should fail with "too early"', async () => {
      const block = await ethers.provider.getBlock('latest');
      const now = block.timestamp;

      await expect(timeConditions.executeAt(now + ONE_DAY, now + (10 * ONE_DAY), ZERO_ADDRESS, '0x00')).to.be.revertedWith('Error: too early');
    });

    it('Should fail with "too late"', async () => {
      const block = await ethers.provider.getBlock('latest');
      const now = block.timestamp;

      await expect(timeConditions.executeAt(now - (10 * ONE_DAY), now - ONE_DAY, ZERO_ADDRESS, '0x00')).to.be.revertedWith('Error: too late');
    });

    it('Should succeed', async () => {
      const block = await ethers.provider.getBlock('latest');
      const now = block.timestamp;

      const tx = await timeConditions.executeAt(now - ONE_DAY, now + ONE_DAY, ZERO_ADDRESS, '0x00');
      const receipt = await tx.wait();

      // statically call the function to get access to the returned values
      const [ success, data ] = await timeConditions.callStatic.executeAt(now - ONE_DAY, now + ONE_DAY, ZERO_ADDRESS, '0x00');

      expect(receipt.status).to.be.equal(1);
      expect(success).to.be.true;
      expect(data).to.be.equal('0x');
    });
  });


  describe('Test "executeAfter" function', () => {

    beforeEach(async () => {
      const CALL_ID = 0;

      const tx = await timeConditions.executeAfter(owner.address, CALL_ID, ONE_HOUR, ZERO_ADDRESS, '0x00');
      await tx.wait();
    });

    it('Should succeed at executing immediately the first time', async () => {

      const CALL_ID = 1;

      const lastExecA = await timeConditions.userToIdToLastExecTime(owner.address, CALL_ID);
      expect(lastExecA).to.be.equal(0);

      // statically call the function to get access to the returned values
      const [ success, data ] = await timeConditions.callStatic.executeAfter(owner.address, CALL_ID, ONE_HOUR, ZERO_ADDRESS, '0x00');

      expect(success).to.be.true;
      expect(data).to.be.equal('0x');

      const tx = await timeConditions.executeAfter(owner.address, CALL_ID, ONE_HOUR, ZERO_ADDRESS, '0x00');
      const receipt = await tx.wait();
      expect(receipt.status).to.be.equal(1);

      const block = await ethers.provider.getBlock('latest');
      const now = block.timestamp;

      const lastExecB = await timeConditions.userToIdToLastExecTime(owner.address, CALL_ID);
      expect(lastExecB).to.be.equal(now);
    });

    it('Should fail at executing too early the second time', async () => {

      const CALL_ID = 0;

      const block = await ethers.provider.getBlock('latest');
      const now = block.timestamp;
      const lastExecA = await timeConditions.userToIdToLastExecTime(owner.address, CALL_ID);
      expect(lastExecA).to.be.equal(now);

      expect(timeConditions.executeAfter(owner.address, CALL_ID, ONE_HOUR, ZERO_ADDRESS, '0x00')).to.be.revertedWith('Error: too early');
    });

    it('Should succeed at executing the second time', async () => {

      const CALL_ID = 0;

      const block = await ethers.provider.getBlock('latest');
      const previousTime = block.timestamp;

      await ethers.provider.send('evm_increaseTime', [ ONE_HOUR + 10 ]); // increase eth node time by some amount in seconds
      await ethers.provider.send('evm_mine', []); // force mine a block so that block.timestamp is set as we wanted above

      const lastExecA = await timeConditions.userToIdToLastExecTime(owner.address, CALL_ID);
      expect(lastExecA).to.be.equal(previousTime);

      // statically call the function to get access to the returned values
      const [ success, data ] = await timeConditions.callStatic.executeAfter(owner.address, CALL_ID, ONE_HOUR, ZERO_ADDRESS, '0x00');

      expect(success).to.be.true;
      expect(data).to.be.equal('0x');

      const tx = await timeConditions.executeAfter(owner.address, CALL_ID, ONE_HOUR, ZERO_ADDRESS, '0x00');
      const receipt = await tx.wait();
      expect(receipt.status).to.be.equal(1);

      const lastExecB = await timeConditions.userToIdToLastExecTime(owner.address, CALL_ID);
      expect(lastExecB).to.be.equal(previousTime + ONE_HOUR);
    });

  });

  describe('Test "real life" scenarios', () => {

    // Deposit 1 ETH in WETH contract
    //  Note: the scenario is pretty dumb because it's the
    //    TimeCondition contract that will deposit ETH into
    //    the WETH contract, making it the owner of the WETH.

    /** Autonomy Registry on Ropsten */
    const AUTONOMY_REGISTRY = '0x3C901dc595105934D61DB70C2170D3a6834Cb8B7';

    /** WETH address on Ropsten */
    const WETH_ADDRESS = '0xc778417E063141139Fce010982780140Aa0cD5Ab';

    /** WETH contract: `function deposit() public payable` */
    const DEPOSIT_SIGNATURE = '0xd0e30db0'

    // const GAS_PRICE = ethers.utils.parseEther('0.000005'); 
    const GAS_PRICE = ethers.utils.parseUnits('50', 'gwei'); 
    const GAS_LIMIT = 10_000_000; // should be more than enough

    let now: number;
    let WETH: Contract;
    let registry: Contract;
    let reqId: BigNumberish;
    let reqReceipt: ContractReceipt;
    let callData: PopulatedTransaction;

    beforeEach(async () => {
      WETH = new ethers.Contract(WETH_ADDRESS, wethAbi, owner);
      registry = new ethers.Contract(AUTONOMY_REGISTRY, registryAbi, owner);

      const block = await ethers.provider.getBlock('latest');
      now = block.timestamp;

      callData = await timeConditions.populateTransaction.executeAt(
        now + (2 * ONE_HOUR), // notBefore
        now + (4 * ONE_HOUR), // notAfter
        WETH_ADDRESS,
        DEPOSIT_SIGNATURE,
      );

      const tx = await registry.newReq(
        timeConditions.address, // target address, here the timeCondition, this is not the "final" target (the WETH contract)
        ZERO_ADDRESS, // referrer address that may collect some fee because they brought the user into the Autonomy ecosystem
        callData.data, // callData to pass to the TimeCondition smart-contract: executeAt(notBefore, notAfter, target, params)
        ONE_ETHER, // ethForCall: value to forward
        false, // verifyUser
        false, // insertFeeAmount
        false, // isAlive
        { value: ONE_ETHER.add(GAS_PRICE.mul(GAS_LIMIT)) } // ETH to send, along with the gas of the future tx
      );

      reqReceipt = await tx.wait();

      reqId = reqReceipt.events![0].args![0];
    });

    it('Should Wrap one ETH at a later date', async () => {

      const balanceBefore = await WETH.balanceOf(timeConditions.address);
      expect(balanceBefore).to.be.equal('0');

      // if we don't increase it fails has expected (too early) but we don't get the error reason
      await ethers.provider.send('evm_increaseTime', [ 2 * ONE_HOUR + 10 ]); // increase eth node time by some amount in seconds
      await ethers.provider.send('evm_mine', []); // force mine a block so that block.timestamp is set as we wanted above

      const tx = await registry.executeHashedReq(
        reqId,
        [ // Request struct (has more params than the "newReq" function)
          owner.address, // user: msg.sender of the user creating the request with "newReq"
          timeConditions.address, // target address, here the timeCondition, this is not the "final" target (the WETH contract)
          ZERO_ADDRESS, // referrer address that may collect some fee because they brought the user into the Autonomy ecosystem

          callData.data, // callData to pass to the TimeCondition smart-contract: executeAt(notBefore, notAfter, target, params)

          ONE_ETHER.add(GAS_PRICE.mul(GAS_LIMIT)), // initEthSent: total amount of eth sent = ethForCall + gas for later execution
          ONE_ETHER, // ethForCall: value to forward
          
          false, // verifyUser
          false, // insertFeeAmount
          false, // payWithAUTO
          false, // isAlive
        ],
        10_000,
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.be.equal(1);

      const balanceAfter = await WETH.balanceOf(timeConditions.address);
      expect(balanceAfter).to.be.equal('1000000000000000000');
    });

  });
});


