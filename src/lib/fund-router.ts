
import { parseEther } from 'ethers/lib/utils';
import { BigNumber, constants, Contract } from 'ethers';

import fundsRouterABI from '@autonomy-station/abis/fundsRouter.json';
import { getProvider, Network } from '@autonomy-station/lib/networks';


const addresses: Record<Network, string> = {
	1: '', // TODO
	3: '', // TODO
	4: '', // TODO
	56: '0x99A5F6658C6D4c117998345F6BAE104bDeDB2e75',
	43113: '0x887fDe9e7f1BDB3A862A43E2E028c3CEEF51c170',
	43114: '', // TODO
};

const _fundsRouter = new Contract(constants.AddressZero, fundsRouterABI);

function getInstance(network: Network) {
	const provider = getProvider(network);
	const address = addresses[network];

	return _fundsRouter.attach(address).connect(provider);
}

export async function getBalances(network: Network, userAddress: string): Promise<BigNumber> {
	const fundsRouter = getInstance(network);
	return fundsRouter.balances(userAddress);
}

export async function depositRequest(network: Network, amount: number, userAddress: string) {
	const fundsRouter = getInstance(network);
	
	const funds = parseEther(`${amount}`);
	return await fundsRouter.populateTransaction.depositETH(userAddress, { value: funds });
	
}

export function withdrawRequest(network: Network, amount: number, userAddress: string) {
	const fundsRouter = getInstance(network);
	
	const funds = parseEther(`${amount}`);
	return fundsRouter.populateTransaction.withdrawETH(userAddress, funds);
}