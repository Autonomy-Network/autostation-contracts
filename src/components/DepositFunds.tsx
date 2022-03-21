
import React, { ChangeEvent, FunctionComponent, ReactFragment, useState } from 'react';

import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { networkNames } from '@autonomy-station/lib/networks';
import { depositRequest, withdrawRequest } from '@autonomy-station/lib/fund-router';

interface FundsState {
		error: ReactFragment,
		funds: number,
		user: string
}

function initialState(): FundsState {
	return {
		error: <></>,
		funds: 0,
		user: '',
	};
}

interface DepositFundsProps {};

// TODO: VALIDITY CHECKERS
export const DepositFunds: FunctionComponent<DepositFundsProps> = props => {

	const wallet = useWallet();
	const [ local, setLocal ] = useState<FundsState>(initialState());
	const [ visibility, setVisibility ] = useState<string>('hidden');

	const handleVisibility = async() => {
		if(!!visibility){
			setVisibility('');
		} else {
			setVisibility('hidden');
		}
	};

	const handleFundsChange = (e: ChangeEvent<HTMLInputElement>) => {
		setLocal(s => ({ ...s, funds: e.target.valueAsNumber }));
	};

	const handleDeposit = async () => {
		// TODO THIS SHOULD BE HANDLED INSIDE THE WALLET
		let userAddress = wallet.state.address;
		if (!userAddress) {
			try {
				const accounts = await wallet.actions.connect();
				if (accounts[0]?.length === 42) userAddress = accounts[0];
				else return;
			} catch (err) {
				console.error(err);
				return;
			}
		}

		const populatedTx = await depositRequest(wallet.state.appNetwork, local.funds, userAddress);
		wallet.actions.sendTransaction(populatedTx);
	};

	const handleWithdraw = async () => {
		// TODO THIS SHOULD BE HANDLED INSIDE THE WALLET
		let userAddress = wallet.state.address;
		if (!userAddress) {
			try {
				const accounts = await wallet.actions.connect();
				if (accounts[0]?.length === 42) userAddress = accounts[0];
				else return;
			} catch (err) {
				console.error(err);
				return;
			}
		}
		const populatedTx = await withdrawRequest(wallet.state.appNetwork, local.funds, userAddress);
		wallet.actions.sendTransaction(populatedTx);
	};


	return(
		<Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
			<button onClick={handleVisibility} className="text-xl font-semibold text-center ">Deposit Funds</button>

			<div className={visibility}>
				<p className="mt-1">Deposit {networkNames[wallet.state.appNetwork]} funds for automation:</p>
				<div className="flex flex-row items-center justify-between">
					<Input type="number" value={local.funds} onChange={handleFundsChange} className="w-1/2 mt-2">0</Input>
					<Button onClick={handleDeposit} className="inline-block ml-4">Deposit</Button>
					<Button onClick={handleWithdraw} className="inline-block ml-4">Withdraw</Button>
				</div>
				<p className="text-center mr-1 mt-2 text-sm text-stone-400">(Only native chain currency allowed currently)</p>
			</div>
		</Card>
	);
};
