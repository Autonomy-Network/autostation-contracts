
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
      className={`cursor-pointer mt-6 px-4 py-3 bg-gradient-to-r from-autonomyAcent500 to-autonomySecondary500 hover:from-pink-400 hover:to-autonomyAcent500 shadow-inner p-2 rounded-lg border border-white ${className}`}
    >
      { !!placeholder ? <option>{placeholder}</option> : '' }
      {
        options.map((opt, index) => <option key={index} value={index}>{opt.label}</option>)
      }
    </select>
  );
};
