
import React, { FunctionComponent } from 'react';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ModalPortal } from '@autonomy-station/ui/modal/ModalPortal';

interface ModalBaseProps {
  title: string;
  onClose: () => void;
};

export const ModalBase: FunctionComponent<ModalBaseProps> = ({ title, onClose, children }) => {

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="w-full h-full pointer-events-auto"
      ></div>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center pointer-events-none bg-stone-300/70 backdrop-blur-sm">
        <article className="relative bg-gradient-to-br from-white to-stone-200 px-8 py-4 rounded-lg shadow-lg flex flex-col gap-4 pb-4 text-stone-600 pointer-events-auto">
          <p className="text-center text-xl font-semibold px-4">{title}</p>
          <button
            onClick={onClose}
            className="absolute right-2 top-4 border rounded-full leading-3 px-2.5 py-1.5 cursor-pointer border-transparent hover:border-yellow-400 hover:text-yellow-400"
          >
            <FontAwesomeIcon icon={faTimes}/>
          </button>
          {children}
        </article>
      </div>
    </ModalPortal>
  );
};
