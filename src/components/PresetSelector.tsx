
import React, { FunctionComponent, useState } from 'react';

import { ethers, PopulatedTransaction } from 'ethers';

import { Card } from '@autonomy-station/ui/Card';
import { Tabs } from '@autonomy-station/ui/Tabs';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { RecurringInput } from '@autonomy-station/ui/RecurringInput';

// TODO: MOVE ABI's TO A BETTER DIRECTORY
import timeConditions from '@autonomy-station/abis/timeConditions.json';

// TODO: MOVE ADDRESS TO A GLOBAL FILE
const TIME_CONDITIONS = '0xCA26b5976E512E6d8eE9056d94EDe8Fd3beaffFD';

interface PresetState {
  period?: number;
  start?: number;
  timeAfter?: number;
  timeBefore?: number;
};

function initialState(): PresetState {
  const date = new Date();
  const defaultDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  const defaultTime = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

  return {
    period: 0,
    start:  new Date(`${defaultDate} ${defaultTime}`).getTime() / 1000,
    timeAfter: new Date(`${defaultDate} ${defaultTime}`).getTime() / 1000,
    timeBefore: new Date(`${defaultDate} ${defaultTime}`).getTime() / 1000,
  };
}


interface PresetSelectorProps {
  // TODO: BETTER TYPE CHECK FOR CALLDATA - POTENTIALLY REMOVE TX AND ADDRESS
  onSubmit: (tx: PopulatedTransaction, address: string, callData: any[]) => void;
};

export const PresetSelector: FunctionComponent<PresetSelectorProps> = ({ onSubmit }) => {

  const wallet = useWallet();

  const [selected, setSelected] = useState(0);
  const [state, setState] = useState<PresetState>(initialState());

  const handleClick = async() => {
    // TODO THIS SHOULD BE HANDLED INSIDE THE WALLET
		let userAddress = wallet.state.address;
		if (!userAddress) {
			try {
				const accounts = await wallet.actions.connect();
				if (accounts[0]?.length === 42) userAddress = accounts[0];
				else return;
			} catch (err) {
				console.error(err);
				return;
			}
		}

    // TODO: CALLDATA NEEDS TO GET AN EXTRA 2 INPUTS FROM THE USER, ethForCall and verifyUser - https://github.com/Autonomy-Network/autonomy-station/blob/0ce19546618da6a58bc886bba9bdd712c91672ff/contracts/FundsRouter.sol#L94
    let timeContract = new ethers.Contract(TIME_CONDITIONS, timeConditions);
    
    // TODO: FIND A BETTER WAY TO DIFFERENTIATE BETWEEN TABS - FOR FUTURE WE NEED TO BE ABLE TO ADD MORE TABS
    if (selected === 0 || selected === undefined) {
      // Recurring
      let callId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      let recurring =  await timeContract.populateTransaction.everyTimePeriod(userAddress, callId, state.start, state.period);
      let callData = [TIME_CONDITIONS, recurring.data, 0, true]
      onSubmit(recurring, TIME_CONDITIONS, callData);  
    } else {
      // one time
      let oneTime =  await timeContract.populateTransaction.betweenTimes(state.timeAfter, (state.timeAfter ?? 0) + ((state.timeBefore ?? 0) - (state.timeAfter ?? 0)));
      let callData = [TIME_CONDITIONS, oneTime.data, 0, false]
      onSubmit(oneTime, TIME_CONDITIONS, callData);  
    }
  };

  // TODO: DO SOME VALIDATION TO MAKE SURE USER IS SELECTING CORRECT TIMES
  const handlePeriodChange = (period?: number) => {
    setState({ ...state,  period});
  };

  const handleStartChange = (start?: number) => {
    setState({ ...state,  start});
    return state;
  };

  const handleAfterChange = (timeAfter?: number) => {
    setState({ ...state, timeAfter});
  };

  const handleBeforeChange = (timeBefore?: number) => {
    setState({ ...state, timeBefore});
  };


  const handleSelected = (index: number) => {
    setSelected(index);
  };

  // TODO: NEXT BUTTON SHOULD GIVE USER FEEDBACK THAT IT HAS BEEN PRESSED
  return(
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8">
      
      <h3 className="text-xl font-semibold">Conditions</h3>

      <Tabs
        tabs={[
          {
            title: 'Recurring',
            content: <>
              <p className="my-2">Execute transaction at:</p>
              <DateInput onChange={handleStartChange} key="recurring"/>
              <p className="my-2 mt-4">and then every:</p>
              <RecurringInput onChange={handlePeriodChange}/>
            </>
          },
          {
            title: 'One time',
            content: <>
              <p className="my-2">Execute transaction after:</p>
              <DateInput onChange={handleAfterChange} key="oneTimeStart"/>
              <p className="my-2">Execute transaction before:</p>
              <DateInput onChange={handleBeforeChange} key="oneTimeEnd"/>
            </>
          },
        ]}
        onSelected={handleSelected}
      />

      <span className="flex flex-row justify-center">
        <Button onClick={handleClick}>Next</Button>
      </span>
    </Card>
  );
};
