
import React, { useState } from 'react';

import { Contract, PopulatedTransaction, providers } from 'ethers';

import { Button } from '@autonomy-station/ui/Button';
import registryAbi from '@autonomy-station/abis/registry.json';
import fundsRouter from '@autonomy-station/abis/fundsRouter.json';
import { DepositFunds } from '@autonomy-station/components/DepositFunds';
import { ExecuteSelector} from '@autonomy-station/components/ExecuteSelector';
import { WalletProvider, useWallet } from '@autonomy-station/hooks/use-wallet';
import { NetworkSelector } from '@autonomy-station/components/NetworkSelector';
import { ConditionSelector } from '@autonomy-station/components/ConditionSelector';


// TODO: MOVE ADDRESSES TO A GLOBAL FILE
const AUTONOMY_REGISTRY  = '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4';
const FUNDS_ROUTER = "0x887fDe9e7f1BDB3A862A43E2E028c3CEEF51c170";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


// TODO: FIX BUG WHEN CARD IS SELECTED BEFORE NETWORK SELECTION
function App() {

  const wallet = useWallet();

  // TODO: TOO MANY STATES AND THEY ARE NOT ALL NECESSARY, BETTER TYPES
  const [conditionList, setConditionList] = useState<any>([]);
  const [multiState, setMultiState] = useState<any>([]);
  const [recurring, setRecurring] = useState<boolean>(true);


  const handleExecuteSubmit = (tx?: PopulatedTransaction, address?: string, callData?: Array<any>) => {
    setMultiState((prevState: Array<any>) => [...prevState, {tx, address, callData}]);
  }

  const handleConditionSubmit = (tx?: PopulatedTransaction, address?: string, callData?: Array<any>) => {
    setMultiState((prevState: Array<any>) => [...prevState, {tx, address, callData}]);
  }
  
  // TODO: CONDITION LIST SHOULD BE LIMITED TO ONE PRE-DEFINED TIME CONDITION AND UNLIMITED CUSTOM CONDITIONS
  const handleAdd = (type: string) => {
    if (type === 'custom'){
      setConditionList((prevState: Array<any>) => [...prevState, (<ExecuteSelector key={conditionList.length + 1} id={conditionList.length + 1} network={wallet.state.appNetwork} edit={true} onSubmit={handleExecuteSubmit} />)]);
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
  const provider = new providers.Web3Provider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let userAddress = await signer.getAddress()
  let fundsContract = new Contract(FUNDS_ROUTER, fundsRouter);
  let registry = new Contract(AUTONOMY_REGISTRY, registryAbi);

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
    <WalletProvider>
      <main className="min-h-full flex flex-col gap-4 items-center text-stone-600 bg-gradient-to-b from-stone-100 to-stone-300">
        
        <div className="fixed top-1 right-4">
          <NetworkSelector />
        </div>

        <section className="mt-32 mb-16 text-center">
          <h1 className="text-5xl font-semibold mb-4">Auto Station</h1>
          <h2 className="font-semibold">Automate blockchain transactions with Autonomy Network</h2>
        </section>

        <DepositFunds />

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
      <div id="modal-container" className="fixed top-0 left-0 z-10 w-full h-full pointer-events-none" ></div>
    </WalletProvider>
  );
}

export default App;
