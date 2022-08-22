import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import React, { createContext, FunctionComponent, ReactFragment, useContext, useEffect, useState } from 'react';
import { BigNumber, PopulatedTransaction, providers, Signer } from 'ethers';

import { TxModal } from '@autonomy-station/components/TxModal';
import {
  chainCurrency,
  chainRpcUrls,
  DEFAULT_NETWORK,
  etherscanConfig,
  isNetworkSupported,
  Network,
  networkNames
} from '@autonomy-station/lib/networks';

export interface Transaction {
  title?: string;
  description?: string;
  txRequest?: PopulatedTransaction;
  txResponse?: TransactionResponse;
  txReceipt?: TransactionReceipt;
  error?: ReactFragment;
}

interface WalletState {
  address: string;
  signer?: Signer;
  /** the app current network, this can be only supported networks such as Mainnet or Rinkeby */
  appNetwork: Network;
  /** the user's wallet network, this can be anything */
  walletNetwork: number;
  transaction?: Transaction;
  loaded: boolean;
}

interface WalletActions {
  getAddress: () => Promise<string | undefined>;
  connect: () => Promise<string[]>;
  switchAppNetwork: (newNetwork: Network) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (populatedTransaction: PopulatedTransaction) => Promise<void>;
  cancelTransaction: () => Promise<void>;
}

interface WalletContext {
  state: WalletState;
  actions: WalletActions;
}

function initWalletState(): WalletState {
  return {
    address: '',
    appNetwork: DEFAULT_NETWORK,
    walletNetwork: DEFAULT_NETWORK,
    loaded: false
  };
}

function initWalletContext(): WalletContext {
  return {
    state: initWalletState(),
    actions: {
      getAddress: async () => '',
      connect: async () => [],
      switchAppNetwork: async (newNetwork: Network) => undefined,
      signMessage: async (message: string) => '',
      sendTransaction: async (populatedTransaction: PopulatedTransaction) => undefined,
      cancelTransaction: async () => undefined
    }
  };
}

const walletContext = createContext<WalletContext>(initWalletContext());

const useWalletSetUp = (): WalletContext => {
  const [state, setState] = useState(initWalletState());

  // ensure code only run on the Browser, to avoid window is undefined error
  useEffect(() => {
    const init = async () => {
      const isConnected = async () => {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        return accounts.length > 0;
      };

      const connected = await isConnected();
      if (connected) {
        const [address] = await (window as any).ethereum?.request({ method: 'eth_requestAccounts' });
        const provider = new providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        setState(s => ({ ...s, address, signer }));
      }

      const chainId: string = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const walletNetwork = BigNumber.from(chainId).toNumber();
      setState(s => ({ ...s, walletNetwork }));

      const supported = isNetworkSupported(walletNetwork);
      if (supported) setState(s => ({ ...s, appNetwork: walletNetwork }));

      setState(s => ({ ...s, loaded: true }));
    };
    init();

    // Listeners
    (window as any).ethereum?.on('accountsChanged', (accounts: string[]) => {
      const [address] = accounts;
      if (!address) {
        setState(s => ({ ...s, address: '', signer: undefined }));
      } else {
        const provider = new providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        setState(s => ({ ...s, address, signer }));
      }
    });

    (window as any).ethereum?.on('chainChanged', (chainId: any) => {
      const walletNetwork = BigNumber.from(chainId).toNumber();
      setState(s => ({ ...s, walletNetwork }));

      const supported = isNetworkSupported(walletNetwork);
      if (supported) setState(s => ({ ...s, appNetwork: walletNetwork }));
    });
  }, []);

  const getAddress = async () => {
    let userAddress = state.address;
    if (!userAddress) {
      try {
        const accounts = await connect();
        if (accounts[0]?.length === 42) userAddress = accounts[0];
        else return;
      } catch (err) {
        console.error(err);
        return;
      }
    }
    return userAddress;
  };

  const connect = () => {
    return (window as any).ethereum?.request({ method: 'eth_requestAccounts' });
  };

  const switchAppNetwork = async (newNetwork: Network) => {
    // if network is supported, ask metamask to switch
    //  - if metamask says ok, effectively update appNetwork
    //  - else don't update appNetwork
    // else do nothing/throw an error, this shouldn't happen

    const supported = isNetworkSupported(newNetwork);
    if (supported) {
      const chainId = `0x${newNetwork.toString(16)}`;
      try {
        await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
      } catch (error: any) {
        if (error.code === 4902) {
          // MetaMask doesn't recognized this network: ask the user to add it
          const chainName = networkNames[newNetwork];
          const nativeCurrency = { ...chainCurrency[newNetwork], decimals: 18 };
          const blockExplorerUrls = [etherscanConfig.explorer[newNetwork]];
          const rpcUrls = [chainRpcUrls[newNetwork]];
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId, chainName, nativeCurrency, blockExplorerUrls, rpcUrls }]
          });
        } else console.warn(error);
      }
    } else {
      throw new Error(
        `Unsupported Network: You tried to switch the app to #${newNetwork}, but this network is not supported.`
      );
    }
  };

  /** String message signature, this is not the same as transaction signature! */
  const signMessage = async (message: string) => {
    if (!state.signer) throw new Error(`Your wallet must be connected in order to sign messages!`);

    return state.signer.signMessage(message);
  };

  const sendTransaction = async (populatedTransaction: PopulatedTransaction) => {
    if (!state.signer) throw new Error(`Your wallet must be connected in order to send transactions!`);

    setState(s => ({ ...s, transaction: { txRequest: populatedTransaction } }));

    try {
      // waiting for user approval
      const response = await state.signer.sendTransaction(populatedTransaction);
      setState(s => ({ ...s, transaction: { ...s.transaction, txResponse: response } }));

      // waiting for tx to be included
      const receipt = await response.wait();
      setState(s => ({ ...s, transaction: { ...s.transaction, txReceipt: receipt } }));
    } catch (error: any) {
      if (error?.code === 4001)
        setState(s => ({ ...s, transaction: { ...s.transaction, error: <>You denied the transaction!</> } }));
      setState(s => ({
        ...s,
        transaction: { ...s.transaction, error: <>The transaction failed, please try agin!</> }
      }));
      console.warn(error);
    }
  };

  const cancelTransaction = async () => {
    setState(s => ({ ...s, transaction: undefined }));
  };

  return {
    state,
    actions: {
      getAddress,
      connect,
      switchAppNetwork,
      signMessage,
      sendTransaction,
      cancelTransaction
    }
  };
};

export const WalletProvider: FunctionComponent = ({ children }) => {
  const wallet = useWalletSetUp();

  return (
    <walletContext.Provider value={wallet}>
      {children}
      {!!wallet.state.transaction ? (
        <TxModal
          transaction={wallet.state.transaction}
          onClose={wallet.actions.cancelTransaction}
          onSuccess={wallet.actions.cancelTransaction}
        ></TxModal>
      ) : (
        ''
      )}
    </walletContext.Provider>
  );
};

export const useWallet = () => {
  const wallet = useContext(walletContext);
  return wallet;
};
