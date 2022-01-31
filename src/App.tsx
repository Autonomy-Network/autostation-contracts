
import React, { ChangeEvent, ReactFragment, useState } from 'react';

import { utils } from 'ethers';

import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Select } from '@autonomy-station/ui/Select';
import { Spinner } from '@autonomy-station/ui/Spinner';
import { getContractInfo } from '@autonomy-station/lib/etherscan';
import { SelectContractFunction } from './components/SelectContractFunction';


interface StationState {
  network: 'homestead' | 'ropsten',
  error: ReactFragment,
  loading: boolean,
  contract: {
    address: string,
    name: string,
    abi: string | utils.Interface,
  },
}


function App() {

  const [ state, setState ] = useState<StationState>({
    network: 'ropsten',
    error: <></>,
    loading: false,
    contract: {
      address: '',
      name: '',
      abi: '',
    },
  });

  const handleNetworkChange = (newNetwork: 'homestead' | 'ropsten') => {
    setState(s => ({ ...s, network: newNetwork }));
  };

  const handleContractChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setState(s => ({ ...s, contract: { ...s.contract, address: value }, loading: true }));

    const validAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    if (!validAddress) {
      setState(s => ({ ...s, error: <>Invalid address!</>, loading: false }));
      return;
    }

    try {
      const result = await getContractInfo(value);
      console.log(result);

      setState(s => ({ ...s, error: <></>, loading: false, contract: { ...s.contract, name: result.ContractName, abi: result.ABI } }));
    } catch (error) {
      setState(s => ({ ...s, error: <>{error}</>, loading: false }));
    }
  };

  return (
    <main className="h-full flex flex-col gap-4 items-center text-stone-600 bg-gradient-to-b from-stone-100 to-stone-300">
      
      <div className="fixed top-1 right-4">
        <Select
          value={state.network}
          onSelect={handleNetworkChange}
          options={[
            { label: 'Mainnet', value: 'homestead' },
            { label: 'Ropsten', value: 'ropsten' },
          ]}
        />
      </div>

      <section className="mt-32 mb-16 text-center">
        <h1 className="text-5xl font-semibold mb-4">Autonomy Station</h1>
        <h2 className="font-semibold">Automate blockchain transactions</h2>
      </section>

      <Card className="w-1/3">
        <h3 className="text-xl font-semibold">Transaction</h3>
        <Input type="text" value={state.contract.address} onChange={handleContractChange}>ETH Address</Input>
        <span className="flex flex-row justify-center">{ state.loading ? <Spinner size={42} /> : '' }</span>
        
        {
          !state.loading && state.contract.abi === 'Contract source code not verified'
            ? <>
                <p>Can't retrieve the ABI for this contract.</p>
              </>
            : ''
        }

        {
          !state.loading && state.contract.abi !== 'Contract source code not verified'
            ? <>
                <p>{state.contract.name}</p>
                <SelectContractFunction abi={state.contract.abi as utils.Interface} />
              </>
            : ''
        }

        <p className="text-center text-red-400">{state.error}</p>
      </Card>
      
    </main>
  );
}

export default App;
