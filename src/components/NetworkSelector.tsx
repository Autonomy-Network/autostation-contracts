
import React, { FunctionComponent } from 'react';

import { Select } from '@autonomy-station/ui/Select';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { Network, networkNames, networks } from '@autonomy-station/lib/networks';


interface NetworkSelectorProps {};

export const NetworkSelector: FunctionComponent<NetworkSelectorProps> = props => {

  const wallet = useWallet();

  const handleNetworkChange = (newNetwork: Network) => {
    wallet.actions.switchAppNetwork(newNetwork);
  };

  return(
    <>
      <Select
        onSelect={handleNetworkChange}
        placeholder="Select a Network"
        options={networks.map(network => ({ label: networkNames[network], value: network }))}
        value={wallet.state.appNetwork === wallet.state.walletNetwork ? wallet.state.appNetwork : undefined}
      />
      { wallet.state.appNetwork !== wallet.state.walletNetwork ? <p className="font-semibold text-center text-red-400">Unsupported Network</p> : '' }
    </>
  );
};
