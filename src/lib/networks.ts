
// TODO USE CHAIN ID INSTEAD OF NETWORK NAME
export const networks = [
  'homestead',
  'rinkeby',
  'ropsten',
] as const;

export type Network = typeof networks[number];


type EtherscanConfigRecord = Record<Network, string>;

interface EtherscanConfig {
  endpoints: EtherscanConfigRecord;
  apiKey: EtherscanConfigRecord;
};

export const etherscanConfig: EtherscanConfig = {
  endpoints: {
    homestead: 'https://api.etherscan.io',
    rinkeby: 'https://api-rinkeby.etherscan.io',
    ropsten: 'https://api-ropsten.etherscan.io',
  },
  apiKey: {
    homestead: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    rinkeby: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    ropsten: process.env.REACT_APP_ETHERSCAN_API_KEY!,
  }
};