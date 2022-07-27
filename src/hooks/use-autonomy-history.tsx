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

export const MORALIS_INFO: Record<Network, MoralisInfo> = {
  56: {
    serverURL: 'https://bthi18qjnrml.usemoralis.com:2053/server',
    key: 'dpRncaRt3nboZFdVkl2zJUJoTs7MP6eCdvx7abtH'
  },
  97: {
    serverURL: 'https://33tv1bd5t7fs.usemoralis.com:2053/server',
    key: '6jwa9LXW5JGEyN1NsJb8ZhlYu07o4rDJhfPvnFVe'
  },
  43113: {
    serverURL: 'https://xonzwsburhwj.usemoralis.com:2053/server',
    key: '8KvEXNIeyuiusYj9hoaizPXjc3pamHHWlkHbZO5Z'
  },
  43114: {
    serverURL: 'https://ietd1r5r9bs1.usemoralis.com:2053/server',
    key: '94CRrkmYxPCfdDQQd4L9gGiem3PKpZsv25fTSwDO'
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
      fujiQuery.equalTo('user', address.toLowerCase());

      const targetQuery = new Moralis.Query('RegistryRequests');
      targetQuery.equalTo('target', FUNDS_ROUTER_ADDRESSES[appNetwork].toLowerCase());

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
