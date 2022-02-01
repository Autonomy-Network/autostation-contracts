
import React, { ChangeEvent, FunctionComponent } from 'react';

interface TextAreaProps {
  value: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
};

export const TextArea: FunctionComponent<TextAreaProps> = ({ value, placeholder, onChange }) => {

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e.target.value);
  };

  return(
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="bg-stone-100 px-4 py-2 rounded-lg shadow-inner border border-stone-600 border-opacity-40"
    ></textarea>
  );
};
