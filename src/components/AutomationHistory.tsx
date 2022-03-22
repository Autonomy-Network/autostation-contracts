
import React, { ChangeEvent, FunctionComponent, ReactFragment, useEffect, useState } from 'react';

import { Contract, ethers, PopulatedTransaction } from 'ethers';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Spinner } from '@autonomy-station/ui/Spinner';
import { Network, networkNames } from '@autonomy-station/lib/networks';
import { InputAbi } from '@autonomy-station/components/InputAbi';
import { getContractInfo } from '@autonomy-station/lib/etherscan';
import { InputFunctionParams } from '@autonomy-station/components/InputFunctionParams';
import { SelectContractFunction } from '@autonomy-station/components/SelectContractFunction';
import { Button } from '@autonomy-station/ui/Button';
import { depositRequest, withdrawRequest } from '@autonomy-station/lib/fund-router';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import Moralis from 'moralis';
import { request } from 'http';
import registryAbi from '@autonomy-station/abis/registry.json';
const AUTONOMY_REGISTRY  = '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4';
declare var window: any


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


interface AutomationProps {};

export const AutomationHistory: FunctionComponent<AutomationProps> = ({}) => {

	const wallet = useWallet();
	const [ visibility, setVisibility ] = useState<string>('hidden');
	const [ automations, setAutomations ] = useState<any>([])


	const handleVisibility = async() => {
		if(!!visibility){
			setVisibility('');
		} else {
			setVisibility('hidden');
		}
	};

	useEffect(() => {
		let userAddress = wallet.state.address;
		const serverURL = 'https://i4iy3hg46tts.usemoralis.com:2053/server';
		const key = 'XPlKsihjzHmCZz4ZspXUqLZf0uow9vU9h0KR0DdQ';
		async function init() {
			Moralis.initialize(key);
			Moralis.serverURL = serverURL;
			const fujiQuery = new Moralis.Query('RegistryRequests');
			fujiQuery.equalTo('user', userAddress.toLocaleLowerCase());
			let queryRequests = Moralis.Query.and(fujiQuery);
			let registryRequests = await queryRequests.find();
			let requestMap = registryRequests.map(function(request){
				return {
					user: request.get('user'),
					tx_hash: request.get('transaction_hash'),
					label: request.get('label'),
					target: request.get('target'),
					referer: request.get('referer'),
					callData: request.get('callData'),
					initEthSent: request.get('initEthSent').toString(),
					ethForCall: request.get('ethForCall').toString(),
					verifyUser: request.get('verifyUser'),
					insertFeeAmount: request.get('insertFeeAmount'),
					payWithAUTO: request.get('payWithAUTO'),
					isAlive: request.get('isAlive'),
					id: request.get('uid'),
				}
			});
			setAutomations(requestMap);
		}
		const interval = setInterval(init, 2000)
		return () => clearInterval(interval)
	}, [visibility, wallet])

	const handleCancel = async (auto: any) => {
		console.log("automations", automations)
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		let userAddress = wallet.state.address;
		let registryContract = new ethers.Contract(AUTONOMY_REGISTRY, registryAbi);

		const connectRegistry = registryContract.connect(signer);
		let tx = await connectRegistry.cancelHashedReq(userAddress, [auto.user, auto.target, auto.referer,
			auto.callData, auto.initEthSent, auto.verifyUser, auto.insertFeeAmount, auto.payWithAUTO]);
		let receipt = await tx.wait();
		console.log("cancelled", receipt)
	};

	return(
		<Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
			<button onClick={handleVisibility} className="text-xl font-semibold text-center">Automation History</button>
			<div className={visibility}>
				{automations.map((auto:any, index:number) => (
				auto.label ?
				<React.Fragment>
					<div className="flex flex-row justify-between" key={index}>
						<Card className="w-11/12 mt-2 font-semibold text-center border border-autonomyPrimary500 mb-1">{auto.label}</Card>
						<Button onClick={() => handleCancel({auto})} className="w-1/4 mt-2 ml-2 text-l border border-autonomyPrimary500">Cancel</Button>			
					</div>
				</React.Fragment> :	
				<React.Fragment>
				<div className="flex flex-row justify-between" key={index}>
					<Card className="w-11/12 mt-2 font-semibold text-center border border-autonomyPrimary500 mb-1">{auto.tx_hash.substring(0,10)}</Card>
					<Button onClick={() => handleCancel({auto})} className="w-1/4 mt-2 ml-2 border border-autonomyPrimary500">Cancel</Button>			
				</div>
				</React.Fragment>
				))}
			</div>
		</Card>
	);
};
