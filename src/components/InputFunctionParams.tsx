import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';

import { ParamType, defaultAbiCoder } from 'ethers/lib/utils';

import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';

function getName(param: ParamType) {
  const isArray = param.baseType === 'array';
  if (isArray) return `${param.name}[ ]`;

  const isTuple = param.baseType === 'tuple';
  if (isTuple) return `${param.name}(${param.components.map(tupleParam => tupleParam.name).join(', ')})`;

  return param.name;
}

// TODO : handle recursive type: e.g. tuple( tuple(uint256 amount)[] params )[]
function getType(param: ParamType) {
  const isArray = param.baseType === 'array';
  if (isArray) return `${param.arrayChildren.baseType}[]`;

  const isTuple = param.baseType === 'tuple';
  if (isTuple) return `[${param.components.map(tupleParam => `${tupleParam.baseType}`).join(', ')}]`;

  return param.baseType;
}

function validate(value: string, param: ParamType) {
  try {
    const isArray = param.baseType === 'array';
    const isTuple = param.baseType === 'tuple';
    if (isArray || isTuple) {
      const formatted = JSON.parse(value) as unknown[];
      defaultAbiCoder.encode([param], [formatted]);
      return true;
    }

    defaultAbiCoder.encode([param], [value]);
    return true;
  } catch (_) {
    return false;
  }
}

interface InputParamProps {
  value: string;
  param: ParamType;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const InputParam: FunctionComponent<InputParamProps> = ({ value, param, onChange }) => {
  const name = getName(param);
  const type = getType(param);

  const [state, setState] = useState(<></>);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isValid = validate(newValue, param);
    if (isValid) setState(<></>);
    else setState(<>Invalid {type}!</>);

    onChange(e);
  };

  return (
    <>
      <p className="mb-1">{name}</p>
      <Input type="text" value={value} onChange={handleChange} className="w-full font-mono">
        {type}
      </Input>
      <p className="text-center italic text-red-400">{state}</p>
    </>
  );
};

interface InputFunctionParamsProps {
  params: ParamType[];
  onSubmit: (inputs: unknown[]) => void;
}

export const InputFunctionParams: FunctionComponent<InputFunctionParamsProps> = ({ params, onSubmit }) => {
  const [state, setState] = useState<string[]>(() => params.map(_ => ''));
  useEffect(() => {
    setState(params.map(_ => ''));
  }, [params]);

  const isValid = () => {
    try {
      const inputs = [...state];
      params.forEach((param, index) => {
        const isArray = param.baseType === 'array';
        const isTuple = param.baseType === 'tuple';
        if (isArray || isTuple) {
          const formatted = JSON.parse(inputs[index]) as unknown[];
          inputs[index] = formatted as any;
        }
      });
      defaultAbiCoder.encode(params, inputs);
      return inputs;
    } catch (err) {
      return false;
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    setState(s => {
      s[index] = e.target.value;
      return [...s];
    });
  };

  const handleClick = () => {
    const inputs = isValid();
    if (inputs) {
      onSubmit(inputs);
    }
  };

  return (
    <>
      {params.map((param, index) => (
        <div key={index}>
          <InputParam value={state[index]} param={param} onChange={e => handleChange(index, e)} />
        </div>
      ))}
      <span className="mt-6 flex flex-row space-x-2 justify-center">
        <Button onClick={handleClick} disabled={!isValid()}>
          Next
        </Button>
      </span>
    </>
  );
};
