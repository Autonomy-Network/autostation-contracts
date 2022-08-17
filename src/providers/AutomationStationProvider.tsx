import React, { Dispatch, SetStateAction } from 'react';

type ConditionType = 'preset' | 'custom';

type Condition = {
  id: number;
  type: 'preset' | 'custom';
};

export type AutomationStationContextType = {
  conditions: Condition[];
  recurring: boolean;
  name: string;
  addCondition: (type: ConditionType) => void;
  removeCondition: (id: number) => void;
  toggleRecurring: () => void;
  setName: Dispatch<SetStateAction<string>>;
};

const defaultState = {
  conditions: [],
  recurring: false,
  name: '',
  addCondition: (type: ConditionType) => {},
  removeCondition: (id: number) => {},
  toggleRecurring: () => {},
  setName: () => {}
};

export const AutomationStationContext = React.createContext<AutomationStationContextType>(defaultState);

export default function AutomationStationProvider({ children }: { children: any }) {
  const [conditions, setConditions] = React.useState<Condition[]>([]);
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

  const toggleRecurring = () => setRecurring(!recurring);

  return (
    <AutomationStationContext.Provider
      value={{ conditions, recurring, name, addCondition, removeCondition, toggleRecurring, setName }}
    >
      {children}
    </AutomationStationContext.Provider>
  );
}
