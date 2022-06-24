import { parseEther } from 'ethers/lib/utils';
import { BigNumber, constants, Contract } from 'ethers';

import fundsRouterABI from '@autonomy-station/abis/fundsRouter.json';
import { FUNDS_ROUTER_ADDRESSES, getProvider, Network } from '@autonomy-station/lib/networks';

const _fundsRouter = new Contract(constants.AddressZero, fundsRouterABI);

function getInstance(network: Network) {
  const provider = getProvider(network);
  const address = FUNDS_ROUTER_ADDRESSES[network];

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
