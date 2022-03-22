
import { FunctionComponent, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

interface ModalPortalProps {};

export const ModalPortal: FunctionComponent<ModalPortalProps> = ({ children }) => {

  const [ mounted, setMounted ] = useState(false);

  useEffect(() => {
    if (!document.querySelector('#modal-container')) throw new Error(`Modal Container not found! Please add a div#modal-container to the DOM!`);
    setMounted(true);

    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(children, document.querySelector('#modal-container')!)
    : null
  ;
};
