
import { HardhatUserConfig } from 'hardhat/types/config';

import '@typechain/hardhat';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';

import { config as dotenv } from 'dotenv';

dotenv({ path: './.env.development.local' });

if (!process.env.ALCHEMY_URL) {
  throw new Error(`Environment Variable Not Found: "ALCHEMY_URL"!
Please add this variable to your '.env.development.local' file.
We use this variable in order to connect to the Alchemy API to run smart-contract unit-tests against a fork of Mainnet.
`)
}

const config: HardhatUserConfig = {
  solidity: '0.8.11',
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_URL
      }
    }
  }
};

export default config;