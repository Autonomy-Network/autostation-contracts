
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';

import { ParamType } from 'ethers/lib/utils';

import { Input } from '@autonomy-station/ui/Input';


function getName(param: ParamType) {
  const isArray = param.baseType === 'array';
  if (isArray) return `${param.name}[ ]`;

  const isTuple = param.baseType === 'tuple';
  if (isTuple) return `${param.name}(${param.components.map(tupleParam => tupleParam.name).join(', ')})`;

  return param.name;
}

function getType(param: ParamType) {
  const isArray = param.baseType === 'array';
  if (isArray) return `${param.arrayChildren.baseType}[]`;

  const isTuple = param.baseType === 'tuple';
  if (isTuple) return `tuple(${param.components.map(tupleParam => `${tupleParam.baseType}`).join(', ')})`;
  
  return param.baseType;
}


interface InputParamProps {
  value: string;
  param: ParamType;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const InputParam: FunctionComponent<InputParamProps> = ({ value, param, onChange }) => {

  const name = getName(param);
  const type = getType(param);

  return (
    <>
      <p className="mb-1">{name}</p>
      <Input type="text" value={value} onChange={onChange} className="w-full font-mono">{type}</Input>
    </>
  );
};


interface InputFunctionParamsProps {
  params: ParamType[];
};

export const InputFunctionParams: FunctionComponent<InputFunctionParamsProps> = ({ params }) => {
  
  const [ state, setState ] = useState<string[]>(() => params.map(_ => ''));
  useEffect(() => {
    setState(params.map(_ => ''));
  }, [ params ]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    setState(s => {
      s[index] = e.target.value;
      return [...s];
    });
  };

  return(
    <>
      {
        params.map((param, index) => 
          <div key={index}>
            <InputParam value={state[index]} param={param} onChange={e => handleChange(index, e)} />
          </div>
        )
      }
    </>
  );
};
