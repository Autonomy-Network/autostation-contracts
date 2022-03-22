
import React, { FunctionComponent } from 'react';

import { DepositFunds } from '@autonomy-station/components/DepositFunds';
import { AutomationHistory } from '@autonomy-station/components/AutomationHistory';


interface ManageProps {};

export const Manage: FunctionComponent<ManageProps> = props => {

  return(
    <main className="min-h-full flex flex-col gap-4 pt-32 items-center text-autonomyBlack bg-gradient-to-br from-autonomyPrimary500 to-autonomySecondary500 ">
      <DepositFunds />
      <AutomationHistory />
    </main>
  );
};
