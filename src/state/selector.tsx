import {createContext} from 'react'
import { ExecuteState } from '@autonomy-station/components/ExecuteSelector'
import { PopulatedTransaction } from 'ethers';


interface SelectorState {
	execute?: ExecuteState,
	executeTx?: PopulatedTransaction
};

function initialState(): SelectorState {
	return {
		execute: {
			error: <></>,
			loading: false,
			autoFetch: true,
			contract: {
			address: '',
			name: '',
			},
		},
		executeTx: undefined
	};
}


export const SelectorContext = createContext<SelectorState>(initialState());