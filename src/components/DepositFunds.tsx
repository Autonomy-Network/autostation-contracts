
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';

import { formatEther } from 'ethers/lib/utils';

import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { chainCurrency } from '@autonomy-station/lib/networks';
import { depositRequest, getBalances, withdrawRequest } from '@autonomy-station/lib/fund-router';

interface FundsState {
	amount: number,
	deposit?: string,
}

interface DepositFundsProps { };

// TODO: VALIDITY CHECKERS
export const DepositFunds: FunctionComponent<DepositFundsProps> = props => {

	const wallet = useWallet();
	const [state, setState] = useState<FundsState>({ amount: 0.1 });

	useEffect(() => {
		const init = async () => {
			try {
				const balance = await getBalances(wallet.state.appNetwork, wallet.state.address);
				const deposit = formatEther(balance);
				setState(s => ({ ...s, deposit }));
			} catch (err) {
				console.log(err);
			}
		};

		if (!!wallet.state.address && wallet.state.loaded) init();

	}, [wallet]);

	const handleConnect = () => {
		wallet.actions.connect();
	};

	const handleFundsChange = (e: ChangeEvent<HTMLInputElement>) => {
		setState(s => ({ ...s, amount: e.target.valueAsNumber }));
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

		const populatedTx = await depositRequest(wallet.state.appNetwork, state.amount, userAddress);
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
		const populatedTx = await withdrawRequest(wallet.state.appNetwork, state.amount, userAddress);
		wallet.actions.sendTransaction(populatedTx);
	};


	return (
		<Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
			<h3 className="text-xl font-semibold text-center">Deposit Funds</h3>

			{
				!wallet.state.address
					? <>
						<p>
							<button className="underline" onClick={handleConnect}>Connect Wallet</button>
							<span>&nbsp;to see your deposit balance</span>
						</p>
					</>
					: ''
			}

			{
				!!wallet.state.address && state.deposit
					? <>
						<span className='flex flex-row space-x-2'>
							<p className='font-semibold'>Deposit balance:</p>
							<p className='font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-autonomyAcent500 to-autonomySecondary500'>{state.deposit} { chainCurrency[wallet.state.appNetwork].symbol }</p>
            </span>
					</>
					: ''
			}

			<div>
				<p className='font-semibold'>Manage your deposit:</p>
				<div className="flex flex-row items-center space-x-4">
					<Input type="number" value={state.amount} onChange={handleFundsChange} className="w-1/2 mt-2 h-16 text-center font-semibold">0</Input>
					<Button onClick={handleDeposit} className="inline-block ml-4 mt-2 border-2 border-white">Deposit</Button>
					<Button onClick={handleWithdraw} className="inline-block ml-4 mt-2 border-2 border-white">Withdraw</Button>
				</div>
			</div>

			<p className="text-center mr-1 mt-2 text-sm text-autonomyBlack font-semibold">(Only native chain currency allowed currently)</p>
		</Card>
	);
};
