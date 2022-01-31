
import React, { ChangeEvent, FunctionComponent } from 'react';

interface InputProps {
  type: 'email' | 'password' | 'text';
  value: string;
  children?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export const Input: FunctionComponent<InputProps> = ({ type, value, onChange, className, children = "Entrez votre texte" }) => {
  return(
    <input
      type={type}
      value={value}
      placeholder={children}
      onChange={onChange}
      className={`bg-stone-100 px-4 py-2 rounded-lg shadow-inner border border-stone-600 border-opacity-40 ${className}`}
    />
  );
};
