import { PopulatedTransaction } from 'ethers';
import React, { Dispatch, SetStateAction } from 'react';

type ConditionType = 'preset' | 'custom';

type Condition = {
  id: number;
  type: 'preset' | 'custom';
};

type MultiState = {
  id: number;
  tx: PopulatedTransaction;
  address: string;
  callData: any[];
};

export type AutomationStationContextType = {
  conditions: Condition[];
  multiStates: MultiState[];
  recurring: boolean;
  name: string;
  addCondition: (type: ConditionType) => void;
  removeCondition: (id: number) => void;
  addMultiState: (state: MultiState) => void;
  removeMultiState: (id: number) => void;
  toggleRecurring: () => void;
  setName: Dispatch<SetStateAction<string>>;
};

const defaultState = {
  conditions: [],
  multiStates: [],
  recurring: false,
  name: '',
  addCondition: (type: ConditionType) => {},
  removeCondition: (id: number) => {},
  addMultiState: (state: MultiState) => {},
  removeMultiState: (id: number) => {},
  toggleRecurring: () => {},
  setName: () => {}
};

export const AutomationStationContext = React.createContext<AutomationStationContextType>(defaultState);

export default function AutomationStationProvider({ children }: { children: any }) {
  const [conditions, setConditions] = React.useState<Condition[]>([]);
  const [multiStates, setMultiStates] = React.useState<MultiState[]>([]);
  const [recurring, setRecurring] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');

  const addCondition = (type: ConditionType) => {
    const id = Date.now();
    if (type === 'custom' || conditions.filter(c => c.type === 'preset').length === 0) {
      setConditions([...conditions, { type, id }]);
    }
  };

  const removeCondition = (id: number) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const addMultiState = (state: MultiState) => {
    if (!multiStates.find(ms => ms.id === state.id)) {
      setMultiStates([...multiStates, state]);
    }
  };

  const removeMultiState = (id: number) => {
    setMultiStates(multiStates.filter(ms => ms.id !== id));
  };

  const toggleRecurring = () => setRecurring(!recurring);

  return (
    <AutomationStationContext.Provider
      value={{
        conditions,
        multiStates,
        recurring,
        name,
        addCondition,
        removeCondition,
        addMultiState,
        removeMultiState,
        toggleRecurring,
        setName
      }}
    >
      {children}
    </AutomationStationContext.Provider>
  );
}
