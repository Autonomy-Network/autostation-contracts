import { getDefaultProvider } from 'ethers';

export const networks = [56, 97, 43113, 43114] as const;
export type Network = typeof networks[number];

export const FUNDS_ROUTER_ADDRESSES: Record<Network, string> = {
  56: '0x99A5F6658C6D4c117998345F6BAE104bDeDB2e75',
  97: '',
  43113: '0xe3F46f9039601C7D5511F85D3280A05a83E8d08b',
  43114: '0x887fDe9e7f1BDB3A862A43E2E028c3CEEF51c170'
};

export const REGISTRY_ADDRESSES: Record<Network, string> = {
  56: '0x18d087F8D22D409D3CD366AF00BD7AeF0BF225Db',
  97: '0x2d08DAAE7687f4516287EBF1bF6c3819f7517Ac9',
  43113: '0x68FCbECa74A7E5D386f74E14682c94DE0e1bC56b',
  43114: '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4'
};

type NetworkConfigRecord = Record<Network, string>;

export const networkNames: NetworkConfigRecord = {
  56: 'BSC Mainnet',
  97: 'BSC Testnet',
  43113: 'Avalanche Fuji Testnet',
  43114: 'Avalanche Mainnet'
};

export function isNetworkSupported(chainId: number): chainId is Network {
  return networks.includes(chainId as any);
}

export const DEFAULT_NETWORK: Network = 56;

interface EtherscanConfig {
  endpoints: NetworkConfigRecord;
  apiKey: NetworkConfigRecord;
  explorer: NetworkConfigRecord;
}

// ? MOST OF NETWORK INFO CAN BE COPIED FROM: https://chainid.network/chains.json

// ! URLs SHOULD NEVER END WITH A `/` !!!
export const etherscanConfig: EtherscanConfig = {
  endpoints: {
    56: 'https://api.bscscan.com',
    97: 'https://api-testnet.bscscan.com',
    43113: 'https://api-testnet.snowtrace.io',
    43114: 'https://api.snowtrace.io'
  },
  apiKey: {
    56: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    97: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    43113: process.env.REACT_APP_ETHERSCAN_API_KEY!,
    43114: process.env.REACT_APP_ETHERSCAN_API_KEY!
  },
  explorer: {
    56: 'https://bscscan.com',
    97: 'https://testnet.bscscan.com',
    43114: 'https://snowtrace.io',
    43113: 'https://testnet.snowtrace.io'
  }
};

export const chainRpcUrls: NetworkConfigRecord = {
  56: 'https://bsc-dataseed1.binance.org',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  43113: 'https://api.avax-test.network/ext/bc/C/rpc'
};

export const chainCurrency: Record<Network, { name: string; symbol: string }> = {
  56: { name: 'Binance Coin', symbol: 'BNB' },
  97: { name: 'Testnet Binance Coin', symbol: 'TBNB' },
  43113: { name: 'Avalanche', symbol: 'AVAX' },
  43114: { name: 'Avalanche', symbol: 'AVAX' }
};

export function getProvider(network: Network) {
  return getDefaultProvider(chainRpcUrls[network]);
}
