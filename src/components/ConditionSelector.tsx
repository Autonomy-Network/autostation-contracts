
import React, { FunctionComponent } from 'react';

import { Card } from '@autonomy-station/ui/Card';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';
import { Input } from '@autonomy-station/ui/Input';


interface ConditionSelectorProps {};

export const ConditionSelector: FunctionComponent<ConditionSelectorProps> = props => {

  return(
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-32">
      <h3 className="text-xl font-semibold">Conditions</h3>
      
      <p>Execute transaction after:</p>
      <DateInput onChange={console.log} />
      <p>but before:</p>
      <DateInput onChange={console.log} />

      {/* TODO implement a tabs ui component */}
      <span>OR</span>

      <p>Execute transaction now, and then every:</p>
      <div className="flex flex-row flex-wrap gap-2">
        <span className="flex flex-col grow">
          <label>Days</label>
          <Input type="text" value='' onChange={console.log} className="">0</Input>
        </span>
        <span className="flex flex-col grow">
          <label>Hours</label>
          <Input type="text" value='' onChange={console.log} className="">0</Input>
        </span>
        <span className="flex flex-col grow">
          <label>Minutes</label>
          <Input type="text" value='' onChange={console.log} className="">0</Input>
        </span>
        <span className="flex flex-col grow">
          <label>Seconds</label>
          <Input type="text" value='' onChange={console.log} className="">0</Input>
        </span>
      </div>


      <span className="flex flex-row justify-center">
        <Button>Next Step</Button>
      </span>
    </Card>
  );
};
