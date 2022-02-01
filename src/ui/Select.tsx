
import React, { ChangeEvent, ReactFragment } from 'react';

interface SelectProps<T> {
  value?: T;
  options: { label: ReactFragment, value: T }[];
  onSelect: (newValue: T) => void;
  className?: string;
  placeholder?: string;
};

export const Select = <T,>({ options, onSelect, value, placeholder, className = '' }: SelectProps<T>) => {

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    const { value } = options[index] ?? { value: undefined };
    if (!value || !onSelect) return;
    onSelect(value);
  };

  const valueIndex = options.findIndex(opt => JSON.stringify(opt.value) === JSON.stringify(value));

  return(
    <select
      value={valueIndex}
      onChange={handleChange}
      className={`cursor-pointer bg-stone-100 shadow-inner p-2 rounded-lg border border-stone-600 border-opacity-40 ${className}`}
    >
      { !!placeholder ? <option>{placeholder}</option> : '' }
      {
        options.map((opt, index) => <option key={index} value={index}>{opt.label}</option>)
      }
    </select>
  );
};
