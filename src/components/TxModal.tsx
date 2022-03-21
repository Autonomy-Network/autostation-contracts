
import React, { FunctionComponent } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { Button } from '@autonomy-station/ui/Button';
import { Spinner } from '@autonomy-station/ui/Spinner';
import { ModalBase } from '@autonomy-station/ui/modal/ModalBase';
import { getExplorerLink } from '@autonomy-station/lib/etherscan';
import { Transaction, useWallet } from '@autonomy-station/hooks/use-wallet';


const steps = [ 'waiting', 'confirm', 'pending', 'mined', 'error' ] as const;
type Step = typeof steps[number];

function transactionToStep(transaction: Transaction): Step {
  if (!!transaction.error) return 'error';
  if (!transaction.txRequest) return 'waiting';
  if (!transaction.txResponse) return 'confirm';
  if (!transaction.txReceipt) return 'pending';
  return 'mined';
}


interface TxModalProps {
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction;
};

export const TxModal: FunctionComponent<TxModalProps> = ({ transaction, onClose, onSuccess }) => {

  const wallet = useWallet();
  const step = transactionToStep(transaction);

  return(
    <ModalBase title={transaction.title ?? 'Sending Transaction'} onClose={onClose}>
      <div className="flex flex-col items-center">
        {
          step === 'error'
            ? <>
                <p>An unexpected error occurred:</p>
                <p className="text-red-500">{transaction.error}</p>
              </>
            : ''
        }

        {
          step === 'waiting'
            ? <Spinner />
            : ''
        }

        {
          step === 'confirm'
            ? <>
                <Spinner />
                <p>Please confirm the transaction in MetaMask.</p>
              </>
            : ''
        }

        {
          step === 'pending'
            ? <>
                <Spinner />
                <p>Transaction pending...</p>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                  href={getExplorerLink(wallet.state.appNetwork, transaction.txResponse!.hash)}
                >
                  View it on explorer
                </a>
              </>
            : ''
        }

        {
          step === 'mined'
            ? <>
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" size="2x" />
                <p>Transaction Confirmed!</p>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                  href={getExplorerLink(wallet.state.appNetwork, transaction.txResponse!.hash)}
                >
                  View it on explorer
                </a>
              </>
            : ''
        }
        <Button onClick={ step === 'mined' && transaction.txReceipt?.status === 1 ? onSuccess : onClose } className="mt-4">Close</Button>
      </div>
    </ModalBase>
  );
};
