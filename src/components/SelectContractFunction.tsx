
import React, { FunctionComponent, useState } from 'react';

import { Interface, FormatTypes, FunctionFragment } from 'ethers/lib/utils';

import { Select } from '@autonomy-station/ui/Select';

interface SelectContractFunctionProps {
  abi: Interface;
  onSelect: (fn: FunctionFragment) => void;
};

export const SelectContractFunction: FunctionComponent<SelectContractFunctionProps> = ({ abi, onSelect }) => {

  const options = Object.values(abi.functions)
    .filter(value => !value.constant)
    .map(value => ({ label: value.format(FormatTypes.full), value }));

  const [ state, setState ] = useState<{ fn?: FunctionFragment }>({});

  const handleChange = (newValue: FunctionFragment) => {
    setState(s => ({ ...s, fn: newValue }));
    onSelect(newValue);
  };

  return(
    <Select
      value={state.fn}
      onSelect={handleChange}
      options={options}
      className="font-mono"
      placeholder="Select a function..."
    />
  );
};
