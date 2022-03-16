
// TODO USE CHAIN ID INSTEAD OF NETWORK NAME
export const networks = [
  'homestead',
  'rinkeby',
  'ropsten',
  'avax',
  'bsc',
  'fuji'
] as const;

export type Network = typeof networks[number];

export function isNetworkSupported(chainId: any): chainId is Network {
  return networks.includes(chainId as any);
}

export const DEFAULT_NETWORK: Network = 'fuji';


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
    avax: 'https://api.snowtrace.io',
    bsc: 'https://api.bscscan.com/',
    fuji: 'https://api-testnet.snowtrace.io/'

  },
  apiKey: {
    homestead: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    rinkeby: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    ropsten: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    avax: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    bsc: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    fuji: process.env.REACT_APP_ETHERSCAN_API_KEY!
  }
};