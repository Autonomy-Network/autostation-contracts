
import React, { ChangeEvent, ReactFragment, useState } from 'react';

import { FunctionFragment, Interface } from 'ethers/lib/utils';

import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { Select } from '@autonomy-station/ui/Select';
import { Spinner } from '@autonomy-station/ui/Spinner';
import { TextArea } from '@autonomy-station/ui/TextArea';
import { getContractInfo } from '@autonomy-station/lib/etherscan';
import { InputFunctionParams } from '@autonomy-station/components/InputFunctionParams';
import { SelectContractFunction } from '@autonomy-station/components/SelectContractFunction';


interface StationState {
  network: 'homestead' | 'ropsten',
  error: ReactFragment,
  loading: boolean,
  autoFetch: boolean,
  contract: {
    address: string,
    name: string,
    abi: string | Interface,
    selectedFunction?: FunctionFragment,
  },
}


function App() {

  const [ state, setState ] = useState<StationState>({
    network: 'homestead',
    error: <></>,
    loading: false,
    autoFetch: true,
    contract: {
      address: '',
      name: '',
      abi: '',
    },
  });

  const handleNetworkChange = (newNetwork: 'homestead' | 'ropsten') => {
    setState(s => ({ ...s, network: newNetwork }));
  };

  const handleContractAddressChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setState(s => ({ ...s, contract: { ...s.contract, address: value }, loading: true }));

    const validAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    if (!validAddress) {
      setState(s => ({ ...s, error: <>Invalid address!</>, loading: false }));
      return;
    }

    if (!state.autoFetch) {
      setState(s => ({ ...s, error: <></>, loading: false }));
      return;
    }

    try {
      const result = await getContractInfo(value);
      console.log(result); // TODO : REMOVE DEBUG LOG

      setState(s => ({ ...s, error: <></>, loading: false, contract: { ...s.contract, name: result.ContractName, abi: result.ABI } }));
    } catch (error) {
      setState(s => ({ ...s, error: <>{error}</>, loading: false }));
    }
  };

  const handleAutoFetchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState(s => ({ ...s, autoFetch: e.target.checked }));
  };

  const handleContractABIChange = (newValue: string) => {
    setState(s => ({ ...s, contract: { ...s.contract, abi: newValue } }));
    try {
      const parsedABI = new Interface(newValue);
      console.log(parsedABI); // TODO : REMOVE DEBUG LOG

      setState(s => ({ ...s, contract: { ...s.contract, abi: parsedABI }, error: <></> }));
    } catch (error) {
      setState(s => ({ ...s, error: <>Invalid ABI.</> }));
    }
  };

  const handleSelectedFunctionChange = (newValue: FunctionFragment) => {
    setState(s => ({ ...s, contract: { ...s.contract, selectedFunction: newValue } }));
  };

  return (
    <main className="min-h-full flex flex-col gap-4 items-center text-stone-600 bg-gradient-to-b from-stone-100 to-stone-300">
      
      <div className="fixed top-1 right-4">
        <Select
          value={state.network}
          onSelect={handleNetworkChange}
          options={[
            { label: 'Mainnet', value: 'homestead' },
            // { label: 'Ropsten', value: 'ropsten' }, // TODO : HANDLE NETWORKS
          ]}
        />
      </div>

      <section className="mt-32 mb-16 text-center">
        <h1 className="text-5xl font-semibold mb-4">Autonomy Station</h1>
        <h2 className="font-semibold">Automate blockchain transactions</h2>
      </section>

      <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-32">
        <h3 className="text-xl font-semibold">Execute</h3>
        <p>ETH address</p>
        <div>
          <Input type="text" value={state.contract.address} onChange={handleContractAddressChange} className="w-full">0x...</Input>
          <span className="flex flex-row justify-end">
            <p className="inline-block mr-1 text-sm text-stone-400">Fetch contract ABI from Etherscan</p>
            <input className="mt-1" type="checkbox" checked={state.autoFetch} onChange={handleAutoFetchChange} />
          </span>
        </div>

        <span className="flex flex-row justify-center">{ state.loading ? <Spinner size={42} /> : '' }</span>
        
        {
          !state.loading && !!state.contract.address && typeof state.contract.abi === 'string'
            ? <>
                <p>Can't retrieve the ABI for this contract.</p>
                <TextArea value={state.contract.abi} onChange={handleContractABIChange} placeholder="Enter contract ABI..." />
              </>
            : ''
        }

        {
          !state.loading && !!state.contract.address && typeof state.contract.abi !== 'string'
            ? <>
                <p><strong>Contract</strong>: {state.contract.name}</p>
                <SelectContractFunction abi={state.contract.abi} onSelect={handleSelectedFunctionChange} />

                {
                  !!state.contract.selectedFunction
                    ? <>
                        <InputFunctionParams params={state.contract.selectedFunction.inputs} />
                        <span className="mt-6 flex flex-row justify-center">
                          <Button>Next Step</Button>
                        </span>
                      </>
                    : ''
                }

              </>
            : ''
        }

        <p className="text-center text-red-400">{state.error}</p>
      </Card>
      
    </main>
  );
}

export default App;
