
import React, { FunctionComponent, useEffect, useState } from 'react';

import Moralis from 'moralis';
import { BigNumber, ethers } from 'ethers';

import { Card } from '@autonomy-station/ui/Card';
import { Button } from '@autonomy-station/ui/Button';
import registryAbi from '@autonomy-station/abis/registry.json';
import { useWallet } from '@autonomy-station/hooks/use-wallet';


const AUTONOMY_REGISTRY  = '0xA0F25b796dD59E504077F87Caea1c0472Cd6b7b4';
declare var window: any


interface AutomationProps {};

export const AutomationHistory: FunctionComponent<AutomationProps> = props => {

	const wallet = useWallet();

	const [ automations, setAutomations ] = useState<any[]>([]);
	if (!wallet.state.signer) wallet.actions.connect();

	useEffect(() => {
		const serverURL = 'https://i4iy3hg46tts.usemoralis.com:2053/server';
		const key = 'XPlKsihjzHmCZz4ZspXUqLZf0uow9vU9h0KR0DdQ';
		async function init() {
			Moralis.initialize(key);
			Moralis.serverURL = serverURL;
			const fujiQuery = new Moralis.Query('RegistryRequests');
			fujiQuery.equalTo('user', wallet.state.address.toLocaleLowerCase());
			let queryRequests = Moralis.Query.and(fujiQuery);
			queryRequests.limit(30000);
			let registryRequests = await queryRequests.find();
			const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
			const signer = provider.getSigner();
			let registryContract = new ethers.Contract(AUTONOMY_REGISTRY, registryAbi);
			const connectRegistry = registryContract.connect(signer);
			let requestMap = await Promise.all(registryRequests.map(async request => {
				return {
					id: request.get('uid'),
					user: request.get('user'),
					target: request.get('target'),
					referer: request.get('referer'),
					callData: request.get('callData'),
					initEthSent: BigNumber.from(request.get('initEthSent')).toString(),
					ethForCall: BigNumber.from(request.get('ethForCall')).toString(),
					verifyUser: request.get('verifyUser'),
					insertFeeAmount: request.get('insertFeeAmount'),
					payWithAUTO: request.get('payWithAUTO'),
					label: request.get('label'),
					tx_hash: request.get('transaction_hash'),
					isAlive: request.get('isAlive'),
					hashed: await connectRegistry.getHashedReq(request.get('uid')),
				}
			}));
			let hashFilter = requestMap.filter(x => x.hashed !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
				x.target === "0x887fde9e7f1bdb3a862a43e2e028c3ceef51c170");
			setAutomations(hashFilter);
		}
		const interval = setInterval(init, 2000)
		return () => clearInterval(interval)
	}, [ wallet.state.address ])


	const handleCancel = async (auto: any) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		let registryContract = new ethers.Contract(AUTONOMY_REGISTRY, registryAbi);
		const connectRegistry = registryContract.connect(signer);
		let tx = await connectRegistry.cancelHashedReq(auto.id, [
			auto.user, auto.target, auto.referer,
			auto.callData, auto.initEthSent, auto.ethForCall,
			auto.insertFeeAmount, auto.verifyUser, auto.payWithAUTO, auto.isAlive
		]);
		await tx.wait(); 
	};

	return(
		<Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
			<h3 className="text-xl font-semibold text-center">Automation History</h3>
			<div>
				{
					automations.map((auto: any, index: number) =>
						<div className="flex flex-row justify-between" key={index}>{
							!!auto.label
								? <>
										<Card className="w-11/12 mt-2 font-semibold text-center border border-white mb-1">{auto.label}</Card>
										<Button onClick={() => handleCancel(auto)} className="w-1/4 mt-2 ml-2 text-l border border-white">Cancel</Button>			
									</>
								: <>
										<Card className="w-11/12 mt-2 font-semibold text-center border border-white mb-1">{auto.tx_hash.substring(0,10)}</Card>
										<Button onClick={() => handleCancel(auto)} className="w-1/4 mt-2 ml-2 border border-white">Cancel</Button>			
									</>
						}</div>
					)
				}
			</div>
		</Card>
	);
};

