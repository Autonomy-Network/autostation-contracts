
import React, { FunctionComponent } from 'react';

import { Card } from '@autonomy-station/ui/Card';
import { Tabs } from '@autonomy-station/ui/Tabs';
import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';
import { RecurringInput } from '@autonomy-station/ui/RecurringInput';


interface ConditionSelectorProps {};

export const ConditionSelector: FunctionComponent<ConditionSelectorProps> = props => {

  return(
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-32">
      
      <h3 className="text-xl font-semibold">Conditions</h3>

      <Tabs
        tabs={[
          {
            title: 'Recurring',
            content: <>
              <p className="my-2">Execute transaction at:</p>
              <DateInput onChange={console.log} />
              <p className="my-2 mt-4">and then every:</p>
              <RecurringInput onChange={console.log}/>
            </>
          },
          {
            title: 'One time',
            content: <>
              <p className="my-2">Execute transaction at:</p>
              <DateInput onChange={console.log} />
            </>
          },
        ]}
      />


      <span className="flex flex-row justify-center">
        <Button>Next Step</Button>
      </span>
    </Card>
  );
};
