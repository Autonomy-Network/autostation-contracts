// TODO: RENAME TO CUSTOMSELECTOR
import React, { ChangeEvent, FunctionComponent, ReactFragment, useEffect, useState } from 'react';

import { Contract, PopulatedTransaction } from 'ethers';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Spinner } from '@autonomy-station/ui/Spinner';
import { Network } from '@autonomy-station/lib/networks';
import { InputAbi } from '@autonomy-station/components/InputAbi';
import { getContractInfo } from '@autonomy-station/lib/etherscan';
import { InputFunctionParams } from '@autonomy-station/components/InputFunctionParams';
import { SelectContractFunction } from '@autonomy-station/components/SelectContractFunction';


export interface ExecuteState {
  error: ReactFragment,
  loading: boolean,
  autoFetch: boolean,
  contract: {
    address: string,
    name: string,
    abi?: Interface,
    selectedFunction?: FunctionFragment,
    instance?: Contract;
  },
}

function initialState(): ExecuteState {
  return {
    error: <></>,
    loading: false,
    autoFetch: true,
    contract: {
      address: '',
      name: '',
    },
  };
}


interface ExecuteSelectorProps {
  id: number;
  edit: boolean;
  network: Network;
    // TODO: BETTER TYPECHECK FOR CALLDATA - POTENTIALLY REMOVE TX AND ADDRESS
  onSubmit: (tx?: PopulatedTransaction, address?: string, callData?: Array<any>) => void;
};

export const ExecuteSelector: FunctionComponent<ExecuteSelectorProps> = ({ id, edit, network, onSubmit }) => {

  useEffect(() => {
    setState(initialState());
  }, [ network ]);

  const [ state, setState ] = useState<ExecuteState>(initialState());
  const [ editor, setEditor ] = useState<boolean>(edit);

  const handleContractAddressChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setState(s => ({ ...s, contract: { ...s.contract, address: value }, error: <></> }));

    const validAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    if (!validAddress) {
      setState(s => ({ ...s, contract: { ...s.contract, name: '', abi: undefined }, error: <>Invalid address!</> }));
      return;
    }

    if (!state.autoFetch) return;

    setState(s => ({ ...s, loading: true }));
    try {
      const result = await getContractInfo(network, value);
      setState(s => ({ ...s, contract: { ...s.contract, name: result.ContractName, abi: result.ABI } }));

      if (!!result.ABI) {
        const instance = new Contract(value, result.ABI);
        setState(s => ({ ...s, contract: { ...s.contract, instance }}));
      }
    } catch (error) {
      setState(s => ({ ...s, error: <>{error}</> }));
    }
    setState(s => ({ ...s, loading: false }));
  };

  const handleAutoFetchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState(s => ({ ...s, autoFetch: e.target.checked }));
  };

  const handleABIChange = (abi: Interface) => {
    const instance = new Contract(state.contract.address, abi);
    setState(s => ({ ...s, contract: { ...s.contract, abi, instance }, error: <></> }));
  };

  const handleSelectedFunctionChange = (newValue: FunctionFragment) => {
    setState(s => ({ ...s, contract: { ...s.contract, selectedFunction: newValue } }));
  };

  const handleSubmitTransaction = async (inputs: unknown[]) => {
    const fnName = state.contract.selectedFunction!.name;
    const fnAddress = state.contract.address;
    const tx = await state.contract.instance!.populateTransaction[fnName](...inputs);
    // TODO: 0 and false inputs here might need to be changed depending on contract
    // TODO: CALLDATA NEEDS TO GET AN EXTRA 2 INPUTS FROM THE USER, ethForCall and verifyUser - https://github.com/Autonomy-Network/autonomy-station/blob/0ce19546618da6a58bc886bba9bdd712c91672ff/contracts/FundsRouter.sol#L94
    let callData = [fnAddress, tx.data, 0, false];
    onSubmit(tx, fnAddress, callData);
    setEditor(false);
  };
  // TODO: TEST THAT EDITING WORKS FINE
  const handleEdit = () => {
    setEditor(true);
    onSubmit();
  };

  return(
      <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
        <h3 className="text-xl font-semibold text-center ">Smart contract automation {id}</h3>
        {
          editor
            ? <>
                {/* ------------
                    ADDRESS
                ------------ */}
                <p>Contract address to automate:</p>
                <div>
                  <Input type="text" value={state.contract.address} onChange={handleContractAddressChange} className="w-full">0x...</Input>
                  <span className="flex flex-row justify-end">
                    <p className="inline-block mr-1 text-sm text-stone-400">Fetch contract ABI automatically</p>
                    <input className="mt-1" type="checkbox" checked={state.autoFetch} onChange={handleAutoFetchChange} />
                  </span>
                </div>

                <span className="flex flex-row justify-center">{ state.loading ? <Spinner size={42} /> : '' }</span>


                {/* ------------
                      ABI
                ------------ */}
                {
                  !state.loading
                  && /^0x[a-fA-F0-9]{40}$/.test(state.contract.address)
                  && !state.contract.abi 
                    ? <>
                        <p>Can't retrieve the ABI for this contract.</p>
                        <InputAbi onAbiChange={handleABIChange} />
                      </>
                    : ''
                }

                {/* ----------------
                  FUNCTION & INPUTS
                ----------------- */}
                {
                  !state.loading
                  && /^0x[a-fA-F0-9]{40}$/.test(state.contract.address)
                  && !!state.contract.abi
                    ? <>
                        <p><strong>Contract</strong>: {state.contract.name ?? 'Unknown'}</p>
                        <SelectContractFunction abi={state.contract.abi} onSelect={handleSelectedFunctionChange} />

                        {
                          !!state.contract.selectedFunction
                            ? <>
                                <InputFunctionParams params={state.contract.selectedFunction.inputs} onSubmit={handleSubmitTransaction} />
                              </>
                            : ''
                        }

                      </>
                    : ''
                }

                <p className="text-center text-red-400">{state.error}</p>
              </>
            : <>
                <p className="ml-4">{state.contract.selectedFunction?.name}</p>
                <p className="font-semibold">on contract</p>
                <p className="ml-4">{ !!state.contract.name ? state.contract.name : state.contract.address }</p>
                
                <button
                  onClick={handleEdit}
                  className="absolute top-1 right-2 rounded-full px-1 hover:bg-stone-300 hover:text-stone-500 hover:shadow-md"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              </>
        }
      </Card>
  );
};
