import fundsRouterABI from '@autonomy-station/abis/fundsRouter.json';
import registryAbi from '@autonomy-station/abis/registry.json';
import timeConditionsAbi from '@autonomy-station/abis/timeConditions.json';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import {
  REGISTRY_ADDRESSES,
  FUNDS_ROUTER_ADDRESSES,
  Network,
  TIME_CONDITIONS_ADDRESSES
} from '@autonomy-station/lib/networks';
import { getContract } from '@autonomy-station/utils';
import { Contract } from '@ethersproject/contracts';
import { useMemo } from 'react';

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | Record<Network, string> | undefined,
  ABI: Record<Network, any> | any
): T | null {
  const wallet = useWallet();

  return useMemo(() => {
    const { appNetwork, signer } = wallet.state;
    if (!addressOrAddressMap || !ABI || !signer || !appNetwork) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[appNetwork];
    if (!address) return null;
    let abi: any;
    if (!Array.isArray(ABI) && Object.keys(ABI).length > 0) abi = ABI[appNetwork];
    else abi = ABI;
    if (!abi) return null;
    try {
      return getContract(address, abi, signer);
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [addressOrAddressMap, ABI, wallet]) as T;
}

export function useFundsRouterContract(): Contract | null {
  return useContract(FUNDS_ROUTER_ADDRESSES, fundsRouterABI);
}

export function useRegistryContract(): Contract | null {
  return useContract(REGISTRY_ADDRESSES, registryAbi);
}

export function useTimeConditionsContract(): Contract | null {
  return useContract(TIME_CONDITIONS_ADDRESSES, timeConditionsAbi);
}
