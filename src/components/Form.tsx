import React from 'react';
import * as Ink from 'ink';
import Field, { FieldDescriptor } from './Field';
import { Value } from '../types';

interface Item extends Partial<FieldDescriptor> {
	title: string;
	id: string;
	value: Value;
}

interface PropTypes {
	onFinish: (value: Record<string, Value>) => void;
	items: Item[];
}

interface DefaultLabelPropTypes {
	title: string;
}

const DefaultLabel: React.FC<DefaultLabelPropTypes> = ({ title }) => {
	return (
		<>
			Enter the value for <Ink.Text bold>{title}</Ink.Text>
		</>
	);
};

const getLabel = (item: Item) => {
	return item.label ? item.label : <DefaultLabel title={item.title} />;
};

const Form: React.FC<PropTypes> = (props) => {
	const { items, onFinish } = props;
	const [values, setValue] = React.useState<[string, Value][]>([]);
	const [index, setIndex] = React.useState(0);
	const item = items[index];

	const label = getLabel(item);
	const onSubmit = (rawValue: string, value: Value) => {
		setValue(values.concat([[rawValue, value]]));
		if (index >= items.length - 1) {
			onFinish(
				values.reduce((map, [, value], index) => {
					const item = items[index];
					map[item.id] = value;
					return map;
				}, {} as Record<string, Value>),
			);
		} else {
			setIndex(index + 1);
		}
	};

	return (
		<Ink.Box>
			<Ink.Static>
				{items.slice(0, index).map((item, index) => {
					const label = getLabel(item);

					return (
						<Ink.Box key={index}>
							{label}: {values[index][0]}
						</Ink.Box>
					);
				})}
			</Ink.Static>
			<Field label={label} defaultValue={item.value} onSubmit={onSubmit} />
		</Ink.Box>
	);
};

export default Form;
