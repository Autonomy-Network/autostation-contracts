import React, { ChangeEvent, FunctionComponent, useState } from 'react';

import { Input } from '@autonomy-station/ui/Input';

function isValidDay(day: number) {	
	return day <= 365 && day >= 0;
}

function isValidHour(hour: number) {	
	return hour < 24 && hour >= 0;
}

function isValidMinuteSecond(time: number) {	
	return time < 60 && time >=0;
}

function getTimeStamp(day: number, hour: number, minute: number, second: number) {
	day = day * 24 * 60 * 60;
	hour = hour * 60 * 60;
	minute = minute * 60;
	return day + hour + minute + second;
}

interface RecurringInputProps {
	onChange: (timestamp?: number) => void;
};

export const RecurringInput: FunctionComponent<RecurringInputProps> = ({ onChange }) => {

	const [ state, setState ] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, error: '' });
	
	const handleDayChange = (event: ChangeEvent<HTMLInputElement>) => {
		const day = event.target.valueAsNumber;

		// validate value
		let error = isValidDay(day) ? '' : 'Only 365 days available!';

		// emit values
		onChange(!!error ? undefined : getTimeStamp(event.target.valueAsNumber, state.hours, state.minutes, state.seconds));

		if(isValidDay(day)){
			setState(s => ({ ...s, days: event.target.valueAsNumber, error }));
		} else {
			setState(s => ({ ...s, days: 0, error }));
		}
	}; 
	
	const handleHourChange = (event: ChangeEvent<HTMLInputElement>) => {
		const hour = event.target.valueAsNumber;

		// validate value
		let error = isValidHour(hour) ? '' : 'Only 23 hours available!';

		// emit values
		onChange(!!error ? undefined : getTimeStamp(state.days, event.target.valueAsNumber, state.minutes, state.seconds));

		if(isValidHour(hour)){
			setState(s => ({ ...s, hours: event.target.valueAsNumber, error }));
		} else {
			setState(s => ({ ...s, hours: 0, error }));
		}
	};

	const handleMinuteChange = (event: ChangeEvent<HTMLInputElement>) => {
		const minute = event.target.valueAsNumber;
		
		// validate value
		let error = isValidMinuteSecond(minute) ? '' : 'Only 59 minutes available!';

		// emit values
		onChange(!!error ? undefined : getTimeStamp(state.days, state.hours, event.target.valueAsNumber, state.seconds));

		if(isValidMinuteSecond(minute)){
			setState(s => ({ ...s, minutes: event.target.valueAsNumber, error }));
		} else {
			setState(s => ({ ...s, minutes: 0, error }));
		}
	};

	const handleSecondChange = (event: ChangeEvent<HTMLInputElement>) => {
		const second = event.target.valueAsNumber;
		
		// validate value
		let error = isValidMinuteSecond(second) ? '' : 'Only 59 seconds available!';

		// emit values
		onChange(!!error ? undefined : getTimeStamp(state.days, state.hours, state.minutes, event.target.valueAsNumber));

		if(isValidMinuteSecond(second)){
			setState(s => ({ ...s, seconds: event.target.valueAsNumber, error }));
		} else {
			setState(s => ({ ...s, seconds: 0, error }));
		}
	}

	return(
		<div className="w-full">
			<div className="flex flex-row flex-wrap gap-2">
				<span className='flex flex-col'>
					<label className="text-stone-400">Days</label>
					<Input onChange={handleDayChange} value={state.days} type="number" className="w-24">0</Input>
				</span>
				<span className='flex flex-col'>
					<label className="text-stone-400">Hours</label>
					<Input onChange={handleHourChange} value={state.hours} type="number" className="w-24">0</Input>
				</span>
				<span className='flex flex-col'>
					<label className="text-stone-400">Minutes</label>
					<Input onChange={handleMinuteChange} value={state.minutes} type="number" className="w-24">0</Input>
				</span>
				<span className='flex flex-col'>
					<label className="text-stone-400">Seconds</label>
					<Input onChange={handleSecondChange} value={state.seconds} type="number" className="w-24">0</Input>
				</span>
			</div>
			<p className="italic text-center text-red-400">{state.error}</p>
		</div>

		
	);
};