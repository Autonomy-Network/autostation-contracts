import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { CustomSelector } from '@autonomy-station/components/CustomSelector';
import { PresetSelector } from '@autonomy-station/components/PresetSelector';
import { Card } from '@autonomy-station/ui/Card';
import autonomyLogo from '@autonomy-station/autonomyLogo.png';
import { MORALIS_INFO } from '@autonomy-station/hooks/use-autonomy-history';
import { useRegistryContract, useFundsRouterContract } from '@autonomy-station/hooks/use-contract';
import { FUNDS_ROUTER_ADDRESSES } from '@autonomy-station/lib/networks';
import { AutomationStationContext } from '@autonomy-station/providers/AutomationStationProvider';
import { PopulatedTransaction } from 'ethers';
import { ChangeEvent, FunctionComponent, useContext, useState } from 'react';
import Moralis from 'moralis';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface HomeProps {}

export const Home: FunctionComponent<HomeProps> = props => {
  const wallet = useWallet();

  const { conditions, recurring, name, addCondition, removeCondition, toggleRecurring, setName } = useContext(
    AutomationStationContext
  );

  const [multiState, setMultiState] = useState<any>([]);
  const [finalStep, setFinalStep] = useState<boolean>(false);

  const fundsRouterContract = useFundsRouterContract();
  const registryContract = useRegistryContract();

  const handleExecuteSubmit = (tx?: PopulatedTransaction, address?: string, callData?: any[]) => {
    setMultiState((prevState: any[]) => [...prevState, { tx, address, callData }]);
  };

  const handleConditionSubmit = (tx?: PopulatedTransaction, address?: string, callData?: any[]) => {
    setMultiState((prevState: any[]) => [...prevState, { tx, address, callData }]);
  };

  const handleAutomate = async () => {
    if (!fundsRouterContract || !registryContract) return;
    const { address, appNetwork } = wallet.state;
    let callArray: any = [];
    multiState.forEach((x: any) => {
      // TODO: REMOVE CALLDATA WHEN USER REMOVE A CARD
      // let callData = [x.address, x.tx.data, 0, false] - deciding if callData should be built here or on their respective classes
      callArray.push(x.callData);
    });
    let fundsRouting = await fundsRouterContract.populateTransaction.forwardCalls(address, 0, callArray);
    let tx = await registryContract.newReq(
      FUNDS_ROUTER_ADDRESSES[appNetwork],
      ZERO_ADDRESS,
      fundsRouting.data,
      0,
      true,
      true,
      recurring
    );
    const receipt = await tx.wait();

    // Moralis
    const { serverURL, key } = MORALIS_INFO[appNetwork];
    Moralis.initialize(key);
    Moralis.serverURL = serverURL;

    const fujiQuery = new Moralis.Query('RegistryRequests');
    fujiQuery.equalTo('user', address.toLocaleLowerCase());

    const idQuery = new Moralis.Query('RegistryRequests');
    idQuery.equalTo('transaction_hash', receipt.transactionHash);
    let queryRequests = Moralis.Query.and(fujiQuery, idQuery);
    let registryRequests = await queryRequests.find();

    let request = registryRequests[registryRequests.length - 1];
    request.set('label', name);
    request.save();
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);

  return (
    <main className="min-h-full flex flex-col gap-4 items-center text-autonomyBlack bg-gradient-to-br from-autonomyPrimary500 to-autonomySecondary500 ">
      <section className="mt-32 mb-16 text-center">
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-autonomyAcent500 to-autonomySecondary500">
          Automation Station
        </h1>
        <h2 className="mt-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-autonomyAcent500 to-autonomySecondary500">
          Automate blockchain transactions with Autonomy Network
        </h2>
      </section>
      {conditions.map(c =>
        c.type === 'preset' ? (
          <PresetSelector key={c.id} id={c.id} onSubmit={handleConditionSubmit} onRemove={removeCondition} />
        ) : (
          <CustomSelector
            key={c.id}
            id={c.id}
            network={wallet.state.appNetwork}
            onRemove={removeCondition}
            onSubmit={handleExecuteSubmit}
          />
        )
      )}
      <div>
        <img src={autonomyLogo} alt="logo" className="h-64 w-64 mr-6" />
      </div>
      <label className="mr-1 mb-2 text-extrabold text-transparent bg-clip-text bg-gradient-to-br from-autonomyAcent300 to-autonomySecondary300 font-semibold text-lg">
        Click add custom or add preset to start
      </label>
      <span className="flex flex-row space-x-2 justify-center mb-8">
        <Button className="-mt-4 h-12" onClick={() => addCondition('preset')}>
          Add Preset
        </Button>
        <Button className="-mt-4" onClick={() => addCondition('custom')}>
          Add Custom
        </Button>
        <Button className="-mt-4 mr-4" onClick={() => setFinalStep(!finalStep)}>
          Final Step
        </Button>
      </span>

      <div className={`${finalStep ? '' : 'hidden'} mt-6`}>
        <Card>
          <span className="flex flex-row space-x-2 justify-start">
            <label className="mr-1 mb-1 text-black text-2xl font-bold">Recurring Function:</label>
            <input className="mt-1 w-8 h-6" type="checkbox" defaultChecked={recurring} onChange={toggleRecurring} />
          </span>
          <span className="flex flex-row space-x-2 justify-center">
            <label className="mr-1 mb-1 mt-2 text-black text-2xl font-bold">Name your automation:</label>
            <Input onChange={handleNameChange} value={name} type="text" className="w-40">
              name....
            </Input>
          </span>
          <span className="flex flex-row space-x-2 justify-center mt-8">
            <Button onClick={handleAutomate} className="w-48 h-20 border-2 border-white">
              Automate
            </Button>
          </span>
        </Card>
      </div>
    </main>
  );
};
