import yn from 'yn';
import React from 'react';
import * as Ink from 'ink';
import TextInput from 'ink-text-input';
import { Value } from '../types';

const getDefaultValueLabel = (value: Value, currentValue: string) => {
	if (typeof value === 'boolean') {
		return value ? ' Y/n' : ' y/N';
	}

	return value !== '' && currentValue === '' ? (
		<Ink.Text color="gray"> ({value})</Ink.Text>
	) : (
		''
	);
};

export interface FieldDescriptor {
	label: React.ReactNode;
	defaultValue?: Value;
}

interface PropTypes extends FieldDescriptor {
	onSubmit: (rawValue: string, value: Value) => void;
}

const Field: React.FC<PropTypes> = (props) => {
	const { label, defaultValue = '', onSubmit: submit } = props;
	const [value, setValue] = React.useState<string>('');
	const defaultValueLabel = getDefaultValueLabel(defaultValue, value);

	const onChange = (value: string) => {
		setValue(value);
	};

	const onSubmit = () => {
		if (typeof defaultValue === 'boolean') {
			const newValue = yn(value, { default: defaultValue });
			submit(String(newValue), newValue);
			setValue('');
			return;
		}

		const newValue = value || defaultValue;
		if (newValue === '') {
			return;
		}
		setValue('');
		submit(String(newValue), newValue);
	};

	return (
		<Ink.Box>
			<Ink.Text>{label}</Ink.Text>
			<Ink.Text>{defaultValueLabel}: </Ink.Text>
			<TextInput
				value={value}
				onChange={onChange}
				onSubmit={onSubmit}
			/>
		</Ink.Box>
	);
};

export default Field;
