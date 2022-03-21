import { createContext, useEffect, useState } from 'react';

import { Signer } from '@ethersproject/abstract-signer';

import { connectMetaMask, silentMetaMaskInit, depositRequest, withdrawRequest } from '@autonomy-station/state/service';
import { ExecuteState } from '@autonomy-station/components/ExecuteSelector';
import { Interface } from 'ethers/lib/utils';

// TODO: CHECK CORRECT NETWORK IS SELECTED ON THE SELECTOR

interface GlobalState {
	loading: boolean;
	signer?: Signer;
	error: string;
	network?: string;
	contractData?: ExecuteState;
};

/* const initialFunctionState: ExecuteState = {
		error: <></>,
		loading: false,
		autoFetch: true,
		contract: {
			address: '',
			name: '',
		},
}; */

const initialState: GlobalState = {
	loading: false,
	signer: undefined,
	error: '',
	network: undefined,
};

export interface IGlobalContext {
	state: GlobalState;

	login: () => void;
	depositETH: (amount: number) => void;
	withdrawETH: (amount: number) => void;
	// executeTx: (user: string, fcnAddress: string, fcnAbi: Interface, fcnData?: string , start: any, period: any, )

};

export const GlobalContext = createContext<IGlobalContext>({
	state: initialState,

	login: () => {},
	depositETH: (amount: number) => {},
	withdrawETH: (amount: number) => {},
});


export const useGlobalState = (): IGlobalContext => {

	const [ state, setState ] = useState(initialState);
	// const [ selectedFunction, setSelectedFunction] = useState('');

	useEffect(() => {
		const init = async () => {
			const connection = await silentMetaMaskInit();
			setState(s => ({ ...s, signer: connection?.signer, network: connection?.network }));
    };
    init();
	}, []);

	const login = async () => {
		if (state.signer) return;
		setState(s => ({ ...s, loading: true }));
		try {
			const connection = await connectMetaMask();
			if (!connection) throw new Error('Please install MetaMask!');
			setState(s => ({ ...s, loading: false, signer: connection.signer, network: connection.network }));
			return connection.signer;
		} catch (error: any) {
			console.error(error);
			setState(s => ({ ...s, loading: false, error: `${error.message}` }));
		}
	};

	const depositETH = async (amount: number) => {
		const signer = state.signer ? state.signer : await login();
		setState(s => ({ ...s, loading: true }));
		try {
			await depositRequest( amount, signer!);
			setState(s => ({ ...s, loading: false }));
		} catch (error: any) {
			console.error(error);
			setState(s => ({ ...s, loading: false, error: `${error.message}` }));
		}
	};

	const withdrawETH = async (amount: number) => {
		const signer = state.signer ? state.signer : await login();
		setState(s => ({ ...s, loading: true }));
		try {
			await withdrawRequest( amount, signer!);
			setState(s => ({ ...s, loading: false }));
		} catch (error: any) {
			console.error(error);
			setState(s => ({ ...s, loading: false, error: `${error.message}` }));
		}
	};

	return {
		state,

		login,
		depositETH,
		withdrawETH
	};
};