// TODO: RENAME FILE TO PRESETSELECTOR
import React, { FunctionComponent, ChangeEvent, useState, useEffect } from 'react';
import { Card } from '@autonomy-station/ui/Card';
import { Tabs } from '@autonomy-station/ui/Tabs';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';
import { RecurringInput } from '@autonomy-station/ui/RecurringInput';
import { ethers, PopulatedTransaction } from 'ethers';
// TODO: MOVE ABI's TO A BETTER DIRECTORY
import timeConditions from '@autonomy-station/abis/timeConditions.json';
// TODO: MOVE ADDRESSE TO A GLOBAL FILE
const TIME_CONDITIONS = "0xCA26b5976E512E6d8eE9056d94EDe8Fd3beaffFD";
declare var window: any

interface ConditionSelectorProps {
  id: number;
  params: unknown[];
  // TODO: BETTER TYPECHECK FOR CALLDATA - POTENTIALLY REMOVE TX AND ADDRESS
  onSubmit: (tx: PopulatedTransaction, address: string, callData: Array<any>) => void;
};

export const ConditionSelector: FunctionComponent<ConditionSelectorProps> = ({ id, params, onSubmit }) => {

  // const selectedFunction = useContext(SelectorContext);

  const handleClick = async() => {
    // TODO HANDLE THIS BETTER
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    let userAddress = await signer.getAddress()
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
      let oneTime =  await timeContract.populateTransaction.betweenTimes(state.timeAfter, state.timeAfter + (state.timeBefore - state.timeAfter));
      let callData = [TIME_CONDITIONS, oneTime.data, 0, false]
      onSubmit(oneTime, TIME_CONDITIONS, callData);  
    }
  };

  const [state, setState] = useState({}) as any;
  const [selected, setSelected] = useState() as any;

  useEffect(() => {
    const date = new Date();
    let defaultDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    let defaultTime = `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`

    setState({
      period: 0,
      start:  new Date(`${defaultDate} ${defaultTime}`).getTime() / 1000,
      timeAfter: new Date(`${defaultDate} ${defaultTime}`).getTime() / 1000,
      timeBefore: new Date(`${defaultDate} ${defaultTime}`).getTime() / 1000
    })
  }, []);  
// TODO: DO SOME VALIDATION TO MAKE SURE USER IS SELECTING CORRECT TIMES
  const handlePeriodChange = (period: number | undefined) => {
    setState({ ...state,  period});
  };

  const handleStartChange = (start: number | undefined) => {
    setState({ ...state,  start});
    return state;
  };

  const handleAfterChange = (timeAfter: number | undefined) => {
    setState({ ...state, timeAfter});
  };

  const handleBeforeChange = (timeBefore: number | undefined) => {
    setState({ ...state, timeBefore});
  };


  const handleSelected = (index: number) => {
    setSelected({index});
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
