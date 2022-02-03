
import { HardhatUserConfig } from 'hardhat/types/config';

import '@typechain/hardhat';
import "@nomiclabs/hardhat-solhint";

const config: HardhatUserConfig = {
  solidity: '0.8.11',
};

export default config;