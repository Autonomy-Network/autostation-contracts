
import React, { FunctionComponent } from 'react';


const variants = {
  primary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-700 hover:shadow-md',
  disabled: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 cursor-not-allowed',
};

type Variant = keyof typeof variants;

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
};

export const Button: FunctionComponent<ButtonProps> = ({ className = '', onClick, variant = 'primary', disabled = false, children }) => {

  return(
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} px-4 py-2 font-semibold rounded-lg shadow-lg ${ disabled ? variants.disabled : variants[variant]}`}
    >
      {children}
    </button>
  );
};
