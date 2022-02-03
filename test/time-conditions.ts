
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { TimeConditions } from '@autonomy-station/typechain-types/TimeConditions';
import { TimeConditions__factory } from '@autonomy-station/typechain-types/factories/TimeConditions__factory';

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe('TimeConditions contract', () => {

  let timeConditions: TimeConditions;

  beforeEach(async () => {
    const [ owner ] = await ethers.getSigners();
    
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

    // TODO WE SHOULD ALSO CHECK SENDING ETHERS AND CALLING A "REAL" CONTRACT
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

  // ? THIS IS HOW WE CAN FAST FORWARD IN THE FUTURE
  // await ethers.provider.send("evm_increaseTime", [3600*24]) // increase eth node time by some amount in seconds
  // await ethers.provider.send("evm_mine", []) // force mine a block so that block.timestamp is set as we wanted above

});


