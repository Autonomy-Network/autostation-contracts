
import React, { ChangeEvent, useState, useContext } from 'react';

import { PopulatedTransaction } from 'ethers';

import { Select } from '@autonomy-station/ui/Select';
import { Network } from '@autonomy-station/lib/networks';
import { GlobalStateProvider } from '@autonomy-station/state/provider';
import { DepositFunds } from '@autonomy-station/components/DepositFunds';
import { ExecuteSelector, ExecuteState } from '@autonomy-station/components/ExecuteSelector';
import { ConditionSelector } from '@autonomy-station/components/ConditionSelector';
import { SelectorContext } from './state/selector';
import { Button } from './ui/Button';
import { ethers } from 'ethers';
import registryAbi from '@autonomy-station/abis/registry.json';
import fundsRouter from '@autonomy-station/abis/fundsRouter.json';
import { GlobalContext } from '@autonomy-station/state/hook';
// TODO: FIND A BETTER WAY TO CONNECT THE WALLET SO THIS DECLAR VAR WINDO CAN BE REMOVED
declare var window: any


// TODO: MOVE ADDRESSES TO A GLOBAL FILE
const AUTONOMY_REGISTRY  = '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4';
const FUNDS_ROUTER = "0x887fDe9e7f1BDB3A862A43E2E028c3CEEF51c170";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface StationState {
  network: Network,
  step: 'execute' | 'condition',
  // Lifted state
  tx?: PopulatedTransaction,
  contractData?: ExecuteState,
  address?: string
  callData?: Array<any>
}
// TODO: FIX BUG WHEN CARD IS SELECTED BEFORE NETWORK SELECTION
function App() {

  const [state, setState] = useState<StationState>({ step: 'execute', network: 'homestead' });
  // TODO: TOO MANY STATES AND THEY ARE NOT ALL NECESSARY, BETTER TYPES
  const [conditionList, setConditionList] = useState<any>([]);
  const [multiState, setMultiState] = useState<any>([]);
  const [recurring, setRecurring] = useState<boolean>(true);

  const handleNetworkChange = (newNetwork: Network) => {
    setState(s => ({ ...s, network: newNetwork }));
  };

  const handleExecuteSubmit = (tx?: PopulatedTransaction, address?: string, callData?: Array<any>) => {
    setState(s => ({ ...s, step: !!tx ? 'condition' : 'execute', tx, address }));
    setMultiState((prevState: Array<any>) => [...prevState, {tx, address, callData}]);
  }

  const handleConditionSubmit = (tx?: PopulatedTransaction, address?: string, callData?: Array<any>) => {
    setState(s => ({ ...s, tx: tx, address: address}));
    setMultiState((prevState: Array<any>) => [...prevState, {tx, address, callData}]);
  }
  
  // TODO: CONDITION LIST SHOULD BE LIMITED TO ONE PRE-DEFINED TIME CONDITION AND UNLIMITED CUSTOM CONDITIONS
  const handleAdd = (type: string) => {
    if (type === 'custom'){
      setConditionList((prevState: Array<any>) => [...prevState, (<ExecuteSelector key={conditionList.length + 1} id={conditionList.length + 1} network={state.network} edit={true} onSubmit={handleExecuteSubmit} />)]);
    } else if (type === 'preset') {
      setConditionList((prevState: Array<any>) => [...prevState, (<ConditionSelector key={conditionList.length + 1} id={conditionList.length + 1} params={['something']} onSubmit={handleConditionSubmit} />)]);
    }
}
// WISHLIST: ALLOW TO REMOVE ARBITRARY CARD.
  const handleRemove = () => {
    setConditionList((prevState: Array<any>) => prevState.slice(0, prevState.length - 1));
}

const toggleChange = () => {
  setRecurring(!recurring);
}

const handleClick = async() => {
  // TODO HANDLE THIS BETTER
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let userAddress = await signer.getAddress()
  let fundsContract = new ethers.Contract(FUNDS_ROUTER, fundsRouter);
  let registry = new ethers.Contract(AUTONOMY_REGISTRY, registryAbi);

  let callArray: any = []
  multiState.forEach((x: any)=> {
  // TODO: REMOVE CALLDATA WHEN USER REMOVE A CARD
      // let callData = [x.address, x.tx.data, 0, false] - deciding if callData should be built here or on their respective classes
      callArray.push(x.callData);
  });
  let fundsRouting = await fundsContract.populateTransaction.forwardCalls(userAddress, 0, callArray);
  const connectRegistry = registry.connect(signer);
  let tx = await connectRegistry.newReq(FUNDS_ROUTER, ZERO_ADDRESS, fundsRouting.data, 0, true, true, recurring);  
  const receipt = await tx.wait();
};

// TODO FIX THE BUTTON LAYOUT PRESET, CUSTOM AND REMOVE
  return (

  <GlobalStateProvider>
    <SelectorContext.Provider value={{execute: state.contractData, executeTx: state.tx}}>
    <main className="min-h-full flex flex-col gap-4 items-center text-stone-600 bg-gradient-to-b from-stone-100 to-stone-300">
      
      <div className="fixed top-1 right-4">
        <Select
          value={state.network}
          onSelect={handleNetworkChange}
          options={[
            { label: 'Mainnet', value: 'homestead' },
            { label: 'Ropsten', value: 'ropsten' },
            { label: 'Rinkeby', value: 'rinkeby' },
            { label: 'AVAX', value: 'avax'},
            { label: 'BSC', value: 'bsc'},
            { label: 'Fuji', value: 'fuji'}
          ]}
        />
      </div>

      <section className="mt-32 mb-16 text-center">
        <h1 className="text-5xl font-semibold mb-4">Auto Station</h1>
        <h2 className="font-semibold">Automate blockchain transactions with Autonomy Network</h2>
      </section>
      <DepositFunds network={state.network}/>
      {conditionList}
      <span className='flex flex-row space-x-2 justify-center'>
        <Button className='-mt-4' onClick={() => handleAdd('preset')}>Add Preset</Button>
        <Button className='-mt-4' onClick={() => handleAdd('custom')}>Add Custom</Button>
        <Button className='-mt-4' onClick={handleRemove}>Remove Action</Button>
      </span>
      <span className='flex flex-row space-x-2 justify-center'>
        <Button className='mr-6' onClick={handleClick}>Automate</Button>
        <label>
          <input type="checkbox" defaultChecked={recurring} onChange={toggleChange} />
          Recurring
        </label>
      </span>
    </main>
    </SelectorContext.Provider>
  </GlobalStateProvider>
  );
}

export default App;
