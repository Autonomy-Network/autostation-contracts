
import React, { FunctionComponent } from 'react';

import { GlobalContext, useGlobalState } from './hook';


interface GlobalStateProviderProps {};

export const GlobalStateProvider: FunctionComponent<GlobalStateProviderProps> = props => {

	const stateAndActions = useGlobalState();

	return (
		<GlobalContext.Provider value={ stateAndActions }>
			{ props.children }
		</GlobalContext.Provider>
	);
}