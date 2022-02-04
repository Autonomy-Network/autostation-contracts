
import React, { FunctionComponent } from 'react';

import { Card } from '@autonomy-station/ui/Card';
import { Input } from '@autonomy-station/ui/Input';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';


interface ConditionSelectorProps {};

export const ConditionSelector: FunctionComponent<ConditionSelectorProps> = props => {

  return(
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-32">
      <h3 className="text-xl font-semibold">Conditions</h3>
      
      <p>Execute transaction after:</p>
      <DateInput onChange={console.log} />
      <p>but before:</p>
      <DateInput onChange={console.log} />

      {/* // TODO implement a tabs ui component */}
      <p>-----------------------------------------------</p>
      <p>OR <span className="italic text-sm">(todo: make a tabs component to separate both conditions)</span></p>
      <p>-----------------------------------------------</p>

      <p>Execute transaction now, and then every:</p>
      <div className="flex flex-row justify-between flex-wrap gap-2">
        <span className="flex flex-col">
          <label>Days</label>
          <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
        </span>
        <span className="flex flex-col">
          <label>Hours</label>
          <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
        </span>
        <span className="flex flex-col">
          <label>Minutes</label>
          <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
        </span>
        <span className="flex flex-col">
          <label>Seconds</label>
          <Input type="text" value='' onChange={console.log} className="w-16">0</Input>
        </span>
      </div>


      <span className="flex flex-row justify-center">
        <Button>Next Step</Button>
      </span>
    </Card>
  );
};
