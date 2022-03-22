
import React, { FunctionComponent } from 'react';


const variants = {
  primary: 'bg-gradient-to-r from-autonomyAcent500 to-autonomySecondary500 hover:from-pink-400 hover:to-autonomyAcent500',
  // 'bg-gradient-to-r from-autonomySecondary500 to-autonomySecondary500 text-white hover:shadow-md border border-autonomyPrimary500 hover:bg-autonomyPrimary500',
  disabled: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 cursor-not-allowed border-2 border-autonomyPrimary500',
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
