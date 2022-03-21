
import { Interface } from 'ethers/lib/utils';

import { etherscanConfig, Network } from '@autonomy-station/lib/networks';

interface ContractSourceCodeResult {
  ABI?: Interface;
  ContractName: string;
}

interface Result {
  ABI: string;
  ContractName: string;
};

interface EtherscanResultSuccess {
  status: '1',
  message: string;
  result: Result[];
}

interface EtherscanResultError {
  status: '0',
  message: string;
  result: string;
}

type EtherscanResult = EtherscanResultSuccess | EtherscanResultError;



export async function getContractInfo(network: Network, address: string): Promise<ContractSourceCodeResult> {
  const apiKey = etherscanConfig.apiKey[network];
  const endpoints = etherscanConfig.endpoints[network];
  const url = `${endpoints}/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
  const apiResponse = await fetch(url);

  if (!apiResponse.ok) throw new Error(`An unexpected error as occurred, please try again!`);

  const body: EtherscanResult = await apiResponse.json();

  if (body.status === '0') throw new Error(`Etherscan Error: ${body.result}`);

  const [result] = body.result;

  if (result.ABI === 'Contract source code not verified') return { ...result, ABI: undefined };

  const contractInterface = new Interface(result.ABI);

  return { ...result, ABI: contractInterface };
}

export function getExplorerLink(network: Network, hash: string) {
  const baseUrl = etherscanConfig.explorer[network];
  return `${baseUrl}/tx/${hash}`;
}
