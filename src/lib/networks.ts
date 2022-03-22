
import { getDefaultProvider } from 'ethers';


export const networks = [1, 3, 4, 56, 43113, 43114] as const;
export type Network = typeof networks[number];

type NetworkConfigRecord = Record<Network, string>;


export const networkNames: NetworkConfigRecord = {
  1: 'Ethereum Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',

  56: 'BSC Mainnet',
  43113: 'Avalanche Fuji Testnet',
  43114: 'Avalanche Mainnet',
};

export function isNetworkSupported(chainId: number): chainId is Network {
  return networks.includes(chainId as any);
}

export const DEFAULT_NETWORK: Network = 43113;

interface EtherscanConfig {
  endpoints: NetworkConfigRecord;
  apiKey: NetworkConfigRecord;
  explorer: NetworkConfigRecord;
};


// ? MOST OF NETWORK INFO CAN BE COPIED FROM: https://chainid.network/chains.json

// ! URLs SHOULD NEVER END WITH A `/` !!!
export const etherscanConfig: EtherscanConfig = {
  endpoints: {
    1: 'https://api.etherscan.io',
    4: 'https://api-rinkeby.etherscan.io',
    3: 'https://api-ropsten.etherscan.io',
    43114: 'https://api.snowtrace.io',
    56: 'https://api.bscscan.com',
    43113: 'https://api-testnet.snowtrace.io'
  },
  apiKey: {
    1: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    4: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    3: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    43114: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    56: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    43113: process.env.REACT_APP_ETHERSCAN_API_KEY!
  },
  explorer: {
    1: 'https://etherscan.io',
    4: 'https://rinkeby.etherscan.io',
    3: 'https://ropsten.etherscan.io',
    43114: 'https://snowtrace.io',
    56: 'https://bscscan.com',
    43113: 'https://testnet.snowtrace.io'
  }
};

export const chainRpcUrls: NetworkConfigRecord = {
  // ! default networks are already included in MetaMask, those values will never be used
  1: '',
  4: '',
  3: '',

  // for extra network, we might provide the user RPC urls to add to MetaMask
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  56: 'https://bsc-dataseed1.binance.org',
  43113: 'https://api.avax-test.network/ext/bc/C/rpc',
};

export const chainCurrency: Record<Network, { name: string, symbol: string }> = {
  // ! default networks are already included in MetaMask, those values will never be used
  1: { name: 'Ether', symbol: 'ETH' },
  4: { name: 'Rinkeby Ether', symbol: 'ETH' },
  3: { name: 'Ropsten Ether', symbol: 'ETH' },

  // for extra network, we might provide the user currency info to add to MetaMask
  43114: { name: 'Avalanche', symbol: 'AVAX' },
  56: { name: 'Binance Chain Native Token', symbol: 'BNB' },
  43113: { name: 'Avalanche', symbol: 'AVAX' },
};


export function getProvider(network: Network) {
  // ethers supports default networks
  if (network === 1 || network === 3 || network === 4) return getDefaultProvider(network);

  // for custom networks we must specify the rpc url
  return getDefaultProvider(chainRpcUrls[network]);
}