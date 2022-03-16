import { parseEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import fundsRouterABI from '@autonomy-station/abis/fundsRouter.json';

const FUNDS_ROUTER = "0x887fDe9e7f1BDB3A862A43E2E028c3CEEF51c170";
const fundsRouter = new Contract(FUNDS_ROUTER, fundsRouterABI);


export async function connectMetaMask() {

	if (!(window as any).ethereum || !(window as any).ethereum.isMetaMask) return;

	await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

	const provider = new Web3Provider((window as any).ethereum, 'any');

	provider.on('network', (_, oldNetwork) => {
	if (oldNetwork) window.location.reload();
	});

	const network = await provider.getNetwork();
	const signer = provider.getSigner();

	return { signer , network: network.name };
}

export async function silentMetaMaskInit() {
	if (!(window as any).ethereum || !(window as any).ethereum.isMetaMask) return;

	const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
	if (!accounts.length) return;

	const provider = new Web3Provider((window as any).ethereum, 'any');

	provider.on('network', (_, oldNetwork) => {
	if (oldNetwork) window.location.reload();
	});

	const network = await provider.getNetwork();
	const signer = provider.getSigner();

	return { signer , network: network.name };
}

export async function depositRequest(amount: number, signer: Signer) {

	const funds = parseEther(`${amount}`);
	let userAddress = await signer.getAddress();
	const connectedRouter = fundsRouter.connect(signer); 
	const fundingTx = await connectedRouter.depositETH(userAddress, {value: funds });
	const receipt = await fundingTx.wait();

	return receipt;
}

export async function withdrawRequest(amount: number, signer: Signer) {

	const funds = parseEther(`${amount}`);
	let userAddress = await signer.getAddress();
	const connectedRouter = fundsRouter.connect(signer); 
	const withdrawingTx = await connectedRouter.withdrawETH(userAddress, funds);
	const receipt = await withdrawingTx.wait();

	return receipt;
}