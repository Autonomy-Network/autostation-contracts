
import React, { ChangeEvent, FunctionComponent, ReactFragment, useEffect, useState, useContext } from 'react';

import { PopulatedTransaction } from 'ethers';
import { Button } from '@autonomy-station/ui/Button';
import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Network } from '@autonomy-station/lib/networks';
import { GlobalContext } from '@autonomy-station/state/hook';

interface FundsState {
		error: ReactFragment,
		funds: number,
		user: string
}

function initialState(): FundsState {
	return {
		error: <></>,
		funds: 0,
		user: ""
	};
}

interface DepositFundsProps {
	network: Network;
};

// TODO: ALLOW TO CHANGE FUNDS ROUTER DEPENDING ON NETWORK
// TODO: VALIDITY CHECKERS
export const DepositFunds: FunctionComponent<DepositFundsProps> = ({ network }) => {

	const { depositETH, withdrawETH } = useContext(GlobalContext);
	const [ local, setLocal ] = useState<FundsState>(initialState());
	const [ visibility, setVisibility ] = useState<string>("hidden");

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

	const handleDeposit = async() => {
		depositETH(local.funds);
	};

	const handleWithdraw = () => {
		withdrawETH(local.funds);
	};

	useEffect(() => {
		setLocal(initialState());
	}, [ network ]);


	return(
		<Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
			<button onClick={handleVisibility} className="text-xl font-semibold text-center ">Deposit Funds</button>
			<>
			<div className={visibility}>
				<p className="mt-1">Deposit {network.toLocaleUpperCase()} funds for automation:</p>
					<div>
						<span>
							<Input type="number" value={local.funds} onChange={handleFundsChange} className="w-1/2 mt-2">0</Input>
							<Button onClick={handleDeposit} className="inline-block ml-4">Deposit</Button>
							<Button onClick={handleWithdraw} className="inline-block ml-4">Withdraw</Button>
						</span>
						<span className="flex flex-row justify-center">
							<p className="inline-block mr-1 mt-2 text-sm text-stone-400">(Only native chain currency allowed currently)</p>
						</span>
					</div>
			</div>
			</>
		</Card>
	);
};
