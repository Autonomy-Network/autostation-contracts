import React, { ChangeEvent, FunctionComponent, ReactFragment, useContext, useEffect, useState } from 'react';

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
import { AutomationStationContext } from '@autonomy-station/providers/AutomationStationProvider';

export interface CustomState {
  error: ReactFragment;
  loading: boolean;
  autoFetch: boolean;
  contract: {
    address: string;
    name: string;
    abi?: Interface;
    selectedFunction?: FunctionFragment;
    instance?: Contract;
  };
}

function initialState(): CustomState {
  return {
    error: <></>,
    loading: false,
    autoFetch: true,
    contract: {
      address: '',
      name: ''
    }
  };
}

interface CustomSelectorProps {
  id: number;
  network: Network;
}

export const CustomSelector: FunctionComponent<CustomSelectorProps> = ({ id, network }) => {
  useEffect(() => {
    setState(initialState());
  }, [network]);

  const { addMultiState, removeCondition, removeMultiState } = useContext(AutomationStationContext);
  const [state, setState] = useState<CustomState>(initialState());
  const [editor, setEditor] = useState<boolean>(true);
  const [advanced, setAdvanced] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<string>('hidden');
  const [verify, setVerify] = useState<boolean>(false);
  const [fee, setFee] = useState<number>(0);

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
        setState(s => ({ ...s, contract: { ...s.contract, instance } }));
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
    const callData = [fnAddress, tx.data, fee, verify];

    addMultiState({ id, tx, address: fnAddress, callData });
    setEditor(false);
  };

  const toggleChange = () => {
    setAdvanced(!advanced);
    if (!!visibility) {
      setVisibility('');
    } else {
      setVisibility('hidden');
    }
  };

  const handleVerify = () => {
    setVerify(true);
  };

  const handleFee = () => {
    // TODO: HANDLE FEE
    setFee(0);
  };

  // TODO: TEST THAT EDITING WORKS FINE
  const handleEdit = () => {
    setEditor(true);
  };

  const handleRemove = () => {
    removeCondition(id);
    removeMultiState(id);
  };

  return (
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
      <div className="flex flex-row relative justify-center">
        <h3 className="text-xl font-semibold ">Custom Automation</h3>
        <h3 className="text-xl font-semibold absolute right-0 cursor-pointer" onClick={handleRemove}>
          &times;
        </h3>
      </div>
      {editor ? (
        <>
          {/* ------------ ADDRESS ------------ */}
          <p className="font-semibold">Contract address to automate:</p>
          <div>
            <Input type="text" value={state.contract.address} onChange={handleContractAddressChange} className="w-full">
              0x...
            </Input>
            <span className="flex flex-row justify-end">
              <p className="inline-block mr-1 text-sm mt-1 text-autonomyBlack font-semibold">
                Fetch contract ABI automatically
              </p>
              <input className="mt-2" type="checkbox" checked={state.autoFetch} onChange={handleAutoFetchChange} />
            </span>
          </div>

          <span className="flex flex-row justify-center">{state.loading ? <Spinner size={42} /> : ''}</span>

          {/* ------------ ABI ------------ */}
          {!state.loading && /^0x[a-fA-F0-9]{40}$/.test(state.contract.address) && !state.contract.abi ? (
            <>
              <p>Can't retrieve the ABI for this contract.</p>
              <InputAbi onAbiChange={handleABIChange} />
            </>
          ) : (
            ''
          )}

          {/* ---------------- FUNCTION & INPUTS ----------------- */}
          {!state.loading && /^0x[a-fA-F0-9]{40}$/.test(state.contract.address) && !!state.contract.abi ? (
            <>
              <p>
                <strong>Contract</strong>: {state.contract.name ?? 'Unknown'}
              </p>
              <SelectContractFunction abi={state.contract.abi} onSelect={handleSelectedFunctionChange} />
              <span className="flex flex-row justify-end">
                <p className="inline-block mr-1 text-sm mt-1 text-autonomyBlack font-semibold">Advanced settings</p>
                <input className="mt-2 h-4" type="checkbox" checked={advanced} onChange={toggleChange} />
              </span>
              <div className={visibility}>
                <span className="flex flex-row justify-end">
                  <p className="inline-block mr-1 text-sm mt-1 text-autonomyPrimary500">Verify User</p>
                  <input className="mt-2" type="checkbox" checked={advanced} onChange={handleVerify} />
                  <p className="inline-block mr-1 text-sm mt-1 ml-2 text-autonomyPrimary500">Fee Amount</p>
                  <input
                    className="w-1/12 rounded-lg"
                    type="number"
                    checked={advanced}
                    onChange={handleFee}
                    value="0"
                    placeholder="00"
                  />
                </span>
              </div>
              {!!state.contract.selectedFunction ? (
                <>
                  <InputFunctionParams
                    params={state.contract.selectedFunction.inputs}
                    onSubmit={handleSubmitTransaction}
                  />
                </>
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}

          <p className="text-center text-red-400">{state.error}</p>
        </>
      ) : (
        <>
          <p className="ml-4">{state.contract.selectedFunction?.name}</p>
          <p className="font-semibold">on contract</p>
          <p className="ml-4">{!!state.contract.name ? state.contract.name : state.contract.address}</p>

          <button
            onClick={handleEdit}
            className="absolute top-1 right-2 rounded-full px-1 hover:bg-stone-300 hover:text-stone-500 hover:shadow-md"
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </>
      )}
    </Card>
  );
};