
import { Interface } from 'ethers/lib/utils';

interface ContractSourceCodeResult {
  ABI: string | Interface;
  ContractName: string;
}

type Result = ContractSourceCodeResult;

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



export async function getContractInfo(address: string): Promise<ContractSourceCodeResult> {
  const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
  const apiResponse = await fetch(url);

  if (!apiResponse.ok) throw new Error(`An unexpected error as occurred, please try again!`);

  const body: EtherscanResult = await apiResponse.json();

  if (body.status === '0') throw new Error(`Etherscan Error: ${body.result}`);

  const [result] = body.result;

  if (result.ABI === 'Contract source code not verified') return { ...result, ABI: '' };

  const contractInterface = new Interface(result.ABI as string);

  return { ...result, ABI: contractInterface };
}