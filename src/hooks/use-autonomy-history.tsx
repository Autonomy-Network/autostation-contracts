import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { useRegistryContract } from '@autonomy-station/hooks/use-contract';
import { FUNDS_ROUTER_ADDRESSES, Network } from '@autonomy-station/lib/networks';
import { BigNumber } from 'ethers';
import Moralis from 'moralis';
import { useState, useEffect } from 'react';

interface MoralisInfo {
  serverURL: string;
  key: string;
}

// const serverURL = 'https://bthi18qjnrml.usemoralis.com:2053/server';
// const key = 'dpRncaRt3nboZFdVkl2zJUJoTs7MP6eCdvx7abtH';

export const MORALIS_INFO: Record<Network, MoralisInfo> = {
  56: {
    serverURL: '',
    key: ''
  },
  97: {
    serverURL: '',
    key: ''
  },
  43113: {
    serverURL: '',
    key: ''
  },
  43114: {
    serverURL: '',
    key: ''
  }
};

export function useAutomationHistory() {
  const wallet = useWallet();
  const registryContract = useRegistryContract();
  const [automations, setAutomations] = useState<any>([]);

  useEffect(() => {
    async function init() {
      const { appNetwork, address, signer } = wallet.state;
      const { key, serverURL } = MORALIS_INFO[appNetwork];

      if (!signer || !registryContract || !key || !serverURL) return;

      Moralis.initialize(key);
      Moralis.serverURL = serverURL;

      const fujiQuery = new Moralis.Query('RegistryRequests');
      fujiQuery.equalTo('user', address);

      const targetQuery = new Moralis.Query('RegistryRequests');
      targetQuery.equalTo('target', FUNDS_ROUTER_ADDRESSES[appNetwork]);

      const queryRequests = Moralis.Query.and(fujiQuery, targetQuery);
      queryRequests.limit(30000);

      const registryRequests = await queryRequests.find();
      const requestMap = await Promise.all(
        registryRequests.map(async request => {
          return {
            id: request.get('uid'),
            user: request.get('user'),
            target: request.get('target'),
            referer: request.get('referer'),
            callData: request.get('callData'),
            initEthSent: BigNumber.from(request.get('initEthSent')).toString(),
            ethForCall: BigNumber.from(request.get('ethForCall')).toString(),
            verifyUser: request.get('verifyUser'),
            insertFeeAmount: request.get('insertFeeAmount'),
            payWithAUTO: request.get('payWithAUTO'),
            label: request.get('label'),
            tx_hash: request.get('transaction_hash'),
            isAlive: request.get('isAlive'),
            hashed: await registryContract.getHashedReq(request.get('uid'))
          };
        })
      );
      setAutomations(
        requestMap.filter(x => x.hashed !== '0x0000000000000000000000000000000000000000000000000000000000000000')
      );
    }
    const interval = setInterval(init, 2000);
    return () => clearInterval(interval);
  }, [wallet, registryContract]);

  return automations;
}
