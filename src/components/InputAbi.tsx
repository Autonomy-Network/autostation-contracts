
import React, { FunctionComponent, useState } from 'react';

import { Interface } from 'ethers/lib/utils';

import { TextArea } from '@autonomy-station/ui/TextArea';


interface InputAbiProps {
  onAbiChange: (abi: Interface) => void;
};

export const InputAbi: FunctionComponent<InputAbiProps> = ({ onAbiChange }) => {

  const [ state, setState ] = useState({ abi: '', error: <></>});

  const handleChange = (newValue: string) => {
    setState(s => ({ ...s, abi: newValue }));
    try {
      const abi = new Interface(newValue);
      onAbiChange(abi);
    } catch (_) {
      setState(s => ({ ...s, error: <>Invalid ABI!</>}));
    }
  };

  return(
    <>
      <TextArea value={state.abi} onChange={handleChange} placeholder="Enter contract ABI..." />
      <p className="italic text-center text-red-400">{state.error}</p>
    </>
  );
};
