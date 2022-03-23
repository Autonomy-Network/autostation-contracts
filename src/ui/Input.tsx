
import React, { ChangeEvent, FunctionComponent } from 'react';

interface InputProps {
  type: 'text' | 'number';
  value: string | number;
  children?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export const Input: FunctionComponent<InputProps> = ({ type, value, onChange, className, children = "Default Text" }) => {
  return(
    <input
      type={type}
      value={value}
      placeholder={children}
      onChange={onChange}
      className={`bg-gradient-to-r from-autonomyAcent300 to-autonomySecondary300 hover:from-pink-400 hover:to-autonomyAcent500 px-4 py-2 text-autonomyBlack placeholder-gray-500 rounded-lg shadow-inner border border-white ${className}`}
    />
  );
};
