
import React, { ChangeEvent, useState } from 'react';

import { Input } from '@autonomy-station/ui/Input';
import { Select } from '@autonomy-station/ui/Select';

function App() {

  const [ state, setState ] = useState({ contractAddress: '', network: 'ropsten' });

  const handleNetworkChange = (newNetwork: string) => {
    setState(s => ({ ...s, network: newNetwork }));
  };

  const handleContractChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState(s => ({ ...s, contractAddress: e.target.value }));
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

      <section className="bg-gradient-to-br from-white to-stone-200 px-8 py-4 rounded-lg shadow-lg flex flex-col gap-4 w-1/3 pb-8">
        <h3 className="text-xl font-semibold">Transaction</h3>
        <Input type="text" value={state.contractAddress} onChange={handleContractChange}>Contract Address or ENS name</Input>
      </section>
      
    </main>
  );
}

export default App;
