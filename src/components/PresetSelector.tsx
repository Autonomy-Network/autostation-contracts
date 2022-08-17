import React, { FunctionComponent, useState } from 'react';

import { ethers, PopulatedTransaction } from 'ethers';

import { Card } from '@autonomy-station/ui/Card';
import { Tabs } from '@autonomy-station/ui/Tabs';
import { Button } from '@autonomy-station/ui/Button';
import { DateInput } from '@autonomy-station/ui/DateInput';
import { useTimeConditionsContract } from '@autonomy-station/hooks/use-contract';
import { useWallet } from '@autonomy-station/hooks/use-wallet';
import { RecurringInput } from '@autonomy-station/ui/RecurringInput';

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const year = date
    .getFullYear()
    .toString()
    .padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0 indexed
  const day = date
    .getDate()
    .toString()
    .padStart(2, '0');
  const hours = date
    .getHours()
    .toString()
    .padStart(2, '0');
  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, '0');

  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

function formatPeriod(period: number) {
  const ONE_MINUTE = 60;
  const ONE_HOUR = ONE_MINUTE * 60;
  const ONE_DAY = ONE_HOUR * 24;

  let days = '';
  let hours = '';
  let minutes = '';
  let seconds = period;

  if (seconds / ONE_DAY > 0) {
    const amount = Math.floor(seconds / ONE_DAY);
    days = `${amount} day${amount !== 1 ? 's' : ''}`;
    seconds %= ONE_DAY;
  }

  if (seconds / ONE_HOUR > 0) {
    const amount = Math.floor(seconds / ONE_HOUR);
    hours = `${amount} hour${amount !== 1 ? 's' : ''}`;
    seconds %= ONE_HOUR;
  }

  if (seconds / ONE_MINUTE > 0) {
    const amount = Math.floor(seconds / ONE_MINUTE);
    minutes = `${amount} minute${amount !== 1 ? 's' : ''}`;
    seconds %= ONE_MINUTE;
  }

  return `${days} ${hours} ${minutes} ${seconds} second${seconds !== 1 ? 's' : ''}`;
}

interface PresetState {
  period?: number;
  start?: number;
  timeAfter?: number;
  timeBefore?: number;
  summary: boolean;
}

function initialState(): PresetState {
  const timestamp = new Date().getTime() / 1000;
  return {
    period: 0,
    start: timestamp,
    timeAfter: timestamp,
    timeBefore: timestamp,
    summary: false
  };
}

interface PresetSelectorProps {
  id: number;
  // TODO: BETTER TYPE CHECK FOR CALLDATA - POTENTIALLY REMOVE TX AND ADDRESS
  onSubmit: (tx: PopulatedTransaction, address: string, callData: any[]) => void;
  onRemove: (id: number) => void;
}

export const PresetSelector: FunctionComponent<PresetSelectorProps> = ({ id, onSubmit, onRemove }) => {
  const wallet = useWallet();
  // TODO: CALLDATA NEEDS TO GET AN EXTRA 2 INPUTS FROM THE USER, ethForCall and verifyUser - https://github.com/Autonomy-Network/autonomy-station/blob/0ce19546618da6a58bc886bba9bdd712c91672ff/contracts/FundsRouter.sol#L94
  const timeConditionsContract = useTimeConditionsContract();
  const [tabIndex, setTabIndex] = useState(0);
  const [state, setState] = useState<PresetState>(initialState());

  const handleClick = async () => {
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

    if (!timeConditionsContract) return;
    const { address } = timeConditionsContract;
    // TODO: FIND A BETTER WAY TO DIFFERENTIATE BETWEEN TABS - FOR FUTURE WE NEED TO BE ABLE TO ADD MORE TABS
    if (tabIndex === 0) {
      // Recurring
      const callId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      const recurring = await timeConditionsContract.populateTransaction.everyTimePeriod(
        userAddress,
        callId,
        state.start,
        state.period
      );
      const callData = [address, recurring.data, 0, true];
      onSubmit(recurring, address, callData);
    } else {
      // one time
      const oneTime = await timeConditionsContract.populateTransaction.betweenTimes(
        state.timeAfter,
        (state.timeAfter ?? 0) + ((state.timeBefore ?? 0) - (state.timeAfter ?? 0))
      );
      const callData = [address, oneTime.data, 0, false];
      onSubmit(oneTime, address, callData);
    }
    setState(s => ({ ...s, summary: true }));
  };

  // TODO: DO SOME VALIDATION TO MAKE SURE USER IS SELECTING CORRECT TIMES
  const handlePeriodChange = (period?: number) => {
    setState(s => ({ ...s, period }));
  };

  const handleStartChange = (start?: number) => {
    setState(s => ({ ...s, start }));
  };

  const handleAfterChange = (timeAfter?: number) => {
    setState(s => ({ ...s, timeAfter }));
  };

  const handleBeforeChange = (timeBefore?: number) => {
    setState(s => ({ ...s, timeBefore }));
  };

  const handleSelected = (index: number) => {
    setTabIndex(index);
  };

  return (
    <Card className="w-11/12 sm:w-9/12 md:w-1/2 xl:w-1/3 mb-8">
      <div className="flex flex-row relative justify-center">
        <h3 className="text-xl font-semibold">Preset Automation</h3>
        <h3 className="text-xl font-semibold absolute right-0 cursor-pointer" onClick={() => onRemove(id)}>
          &times;
        </h3>
      </div>

      {!state.summary ? (
        <>
          <Tabs
            tabs={[
              {
                title: 'Recurring',
                content: (
                  <>
                    <p className="my-2 font-semibold">Execute transaction at:</p>
                    <DateInput onChange={handleStartChange} key="recurring" />
                    <p className="my-2 mt-4 font-semibold">and then every:</p>
                    <RecurringInput onChange={handlePeriodChange} />
                  </>
                )
              },
              {
                title: 'One time',
                content: (
                  <>
                    <p className="my-2 font-semibold">Execute transaction after:</p>
                    <DateInput onChange={handleAfterChange} key="oneTimeStart" />
                    <p className="my-2 font-semibold">Execute transaction before:</p>
                    <DateInput onChange={handleBeforeChange} key="oneTimeEnd" />
                  </>
                )
              }
            ]}
            onSelected={handleSelected}
          />

          <div className="flex flex-row justify-center">
            <Button onClick={handleClick}>Next</Button>
          </div>
        </>
      ) : (
        ''
      )}

      {state.summary && tabIndex === 0 ? (
        <>
          <p>
            Execute transaction at {formatDate(state.start!)} and after that, every {formatPeriod(state.period!)}.
          </p>
        </>
      ) : (
        ''
      )}

      {state.summary && tabIndex === 1 ? (
        <>
          <p>
            Execute transaction as soon as possible after {formatDate(state.timeAfter!)}, and prevent it to be executed
            after {formatDate(state.timeBefore!)}
          </p>
        </>
      ) : (
        ''
      )}
    </Card>
  );
};
