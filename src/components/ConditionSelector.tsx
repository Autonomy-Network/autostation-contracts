
import React, { FunctionComponent } from 'react';

import { Card } from '@autonomy-station/ui/Card';
import { Tabs } from '@autonomy-station/ui/Tabs';
import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';


interface ConditionSelectorProps {};

export const ConditionSelector: FunctionComponent<ConditionSelectorProps> = props => {

  return(
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-32">
      
      <h3 className="text-xl font-semibold">Conditions</h3>

      <Tabs
        tabs={[
          {
            title: 'At Date',
            content: <>
              <p className="my-2">Execute transaction after:</p>
              <DateInput onChange={console.log} />
              <p className="my-2">but before:</p>
              <DateInput onChange={console.log} />
            </>
          },
          {
            title: 'Recurring',
            content: <>
              <p className="my-2">Execute transaction now, and then every:</p>
              <div className="flex flex-row flex-wrap gap-2">
                <span className="flex flex-col">
                  <label className="text-stone-400">Days</label>
                  <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
                </span>
                <span className="flex flex-col">
                  <label className="text-stone-400">Hours</label>
                  <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
                </span>
                <span className="flex flex-col">
                  <label className="text-stone-400">Minutes</label>
                  <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
                </span>
                <span className="flex flex-col">
                  <label className="text-stone-400">Seconds</label>
                  <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
                </span>
              </div>
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
