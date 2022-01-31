
import React, { FunctionComponent } from 'react';

import { utils } from 'ethers';

import { Select } from '@autonomy-station/ui/Select';
import { useState } from 'react';

interface SelectContractFunctionProps {
  abi: utils.Interface;
};

export const SelectContractFunction: FunctionComponent<SelectContractFunctionProps> = ({ abi }) => {

  const options = Object.values(abi.functions)
    .filter(value => !value.constant)
    .map(value => value.format(utils.FormatTypes.full))
    .map(value => ({ label: value, value }));

  const [ state, setState ] = useState({ fn: '' });

  const handleChange = (newValue: string) => {
    setState(s => ({ ...s, fn: newValue }))
  };

  return(
    <Select
      value={state.fn}
      onSelect={handleChange}
      options={options}
    />
  );
};
