
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { Input } from '@autonomy-station/ui/Input';

/** Get todays date as string formatted in `'MM/DD/YYYY'` */
function defaultDate() {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

/** Get current time plus 1 hour in format `'HH:MM'` */
function defaultTime() {
  const date = new Date();
  return `${date.getHours() + 1}:${date.getMinutes()}`
}

function isDateInTheFuture(date: Date) {
  const now = new Date()
  now.setHours(0, 0, 0);
  now.setMilliseconds(0);

  return date.getTime() >= now.getTime();
}

function isTimeInTheFuture(date: Date) {
  const now = new Date()
  now.setSeconds(0);
  now.setMilliseconds(0);

  return date.getTime() >= now.getTime();
}

function isValidDate(date: string, time: string) {
  const timestamp = new Date(`${date} ${time}`).getTime();
  return timestamp && !isNaN(timestamp) && isFinite(timestamp);
}

/** Convert date/time to ETH timestamp (remove milliseconds) */
function dateToTimestamp(date: string, time: string) {
  return new Date(`${date} ${time}`).getTime() / 1000;
}


interface DateInputProps {
  onChange: (timestamp?: number) => void;
};

export const DateInput: FunctionComponent<DateInputProps> = ({ onChange }) => {

  const [ state, setState ] = useState({ date: defaultDate(), time: defaultTime(), error: '' });

  // emit default values when the component is mounted
  useEffect(() => {
    onChange(dateToTimestamp(defaultDate(), defaultTime()));
  }, []);
  
  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    
    // validate value
    let error = isDateInTheFuture(date) ? '' : 'Date must be in the future!';
    const valid = isValidDate(event.target.value, state.time);
    if (!valid) error = 'Invalid Date';
    
    // emit values
    onChange(!!error ? undefined : dateToTimestamp(event.target.value, state.time));
    
    setState(s => ({ ...s, date: event.target.value, error }));
  }; 
  
  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = new Date(`${state.date} ${event.target.value}`);
    
    // validate value
    let error = isTimeInTheFuture(date) ? '' : 'Date must be in the future!';
    const valid = isValidDate(state.date, event.target.value);
    if (!valid) error = 'Invalid Date';

    // emit values
    onChange(!!error ? undefined : dateToTimestamp(state.date, event.target.value));

    setState(s => ({ ...s, time: event.target.value, error }));
  };

  return(
    <div className="w-full">
      <div className="flex flex-row flex-wrap gap-2 items-center">
        <Input onChange={handleDateChange} value={state.date} type="text" className="grow">MM/DD/YYYY</Input>
        <Input onChange={handleTimeChange} value={state.time} type="text" className="grow">HH:MM</Input>
      </div>
      <p className="italic text-center text-red-400">{state.error}</p>
    </div>
  );
};
