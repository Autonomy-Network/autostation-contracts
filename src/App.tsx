
import React, { useState } from 'react';

import { PopulatedTransaction } from 'ethers';

import { Select } from '@autonomy-station/ui/Select';
import { Network } from '@autonomy-station/lib/networks';
import { ExecuteSelector } from '@autonomy-station/components/ExecuteSelector';
import { ConditionSelector } from '@autonomy-station/components/ConditionSelector';


interface StationState {
  network: Network,
  step: 'execute' | 'condition',
  tx?: PopulatedTransaction,
}

function App() {

  const [state, setState] = useState<StationState>({ step: 'execute', network: 'homestead' });

  const handleNetworkChange = (newNetwork: Network) => {
    setState(s => ({ ...s, network: newNetwork }));
  };

  const handleExecuteSubmit = (tx?: PopulatedTransaction) => {
    setState(s => ({ ...s, step: !!tx ? 'condition' : 'execute', tx }));
  }

  return (
    <main className="min-h-full flex flex-col gap-4 items-center text-stone-600 bg-gradient-to-b from-stone-100 to-stone-300">
      
      <div className="fixed top-1 right-4">
        <Select
          value={state.network}
          onSelect={handleNetworkChange}
          options={[
            { label: 'Mainnet', value: 'homestead' },
            { label: 'Rinkeby', value: 'rinkeby' },
          ]}
        />
      </div>

      <section className="mt-32 mb-16 text-center">
        <h1 className="text-5xl font-semibold mb-4">Autonomy Station</h1>
        <h2 className="font-semibold">Automate blockchain transactions</h2>
      </section>

      <ExecuteSelector network={state.network} edit={state.step === 'execute'} onSubmit={handleExecuteSubmit} />
      
      {
        state.step === 'condition'
        ? <ConditionSelector />
        : ''
      }
    </main>
  );
}

export default App;
