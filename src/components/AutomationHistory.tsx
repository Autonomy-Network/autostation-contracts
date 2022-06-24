import { Card } from '@autonomy-station/ui/Card';
import { Button } from '@autonomy-station/ui/Button';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { useAutomationHistory } from '@autonomy-station/hooks/use-autonomy-history';
import { useRegistryContract } from '@autonomy-station/hooks/use-contract';
import { FunctionComponent } from 'react';

interface AutomationProps {}

export const AutomationHistory: FunctionComponent<AutomationProps> = props => {
  const wallet = useWallet();
  const automations = useAutomationHistory();
  const registryContract = useRegistryContract();

  if (!wallet.state.signer) wallet.actions.connect();

  const handleCancel = async (auto: any) => {
    if (!registryContract) return;
    let tx = await registryContract.cancelHashedReq(auto.id, [
      auto.user,
      auto.target,
      auto.referer,
      auto.callData,
      auto.initEthSent,
      auto.ethForCall,
      auto.insertFeeAmount,
      auto.verifyUser,
      auto.payWithAUTO,
      auto.isAlive
    ]);
    await tx.wait();
  };

  return (
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8 relative">
      <h3 className="text-xl font-semibold text-center">Automation History</h3>
      <div>
        {automations.map((auto: any, index: number) => (
          <div className="flex flex-row justify-between" key={index}>
            {!!auto.label ? (
              <>
                <Card className="w-11/12 mt-2 font-semibold text-center border border-white mb-1">{auto.label}</Card>
                <Button
                  onClick={() => handleCancel(auto)}
                  className="w-1/4 mt-2 ml-2 text-l border border-white font-extrabold"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Card className="w-11/12 mt-2 font-semibold text-center border border-white mb-1">
                  {auto.tx_hash.substring(0, 10)}
                </Card>
                <Button
                  onClick={() => handleCancel(auto)}
                  className="w-1/4 mt-2 ml-2 border border-white font-extrabold"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
