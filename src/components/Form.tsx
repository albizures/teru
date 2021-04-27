import React from 'react';
import * as Ink from 'ink';
import Field, { FieldDescriptor } from './Field';
import { Value } from '../types';

interface Item extends Partial<FieldDescriptor> {
	title: string;
	id: string;
	value: Value;
	message?: string;
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
	return item.message ? (
		item.message
	) : (
		<DefaultLabel title={item.title} />
	);
};

const Form: React.FC<PropTypes> = (props) => {
	const { items, onFinish } = props;
	const [values, setValue] = React.useState<[string, Value][]>([]);
	const [index, setIndex] = React.useState(0);
	const item = items[index];

	const onSubmit = (rawValue: string, value: Value) => {
		setValue(values.concat([[rawValue, value]]));
		setIndex(index + 1);
	};

	React.useEffect(() => {
		if (!item) {
			onFinish(
				values.reduce((map, [, value], index) => {
					const item = items[index];
					map[item.id] = value;
					return map;
				}, {} as Record<string, Value>),
			);
		}
	}, [item, values, onFinish, items]);

	return (
		<Ink.Box>
			<Ink.Static items={items.slice(0, index)}>
				{(item, index) => {
					const label = getLabel(item);

					return (
						<Ink.Box key={index}>
							<Ink.Text color="grey">{label}</Ink.Text>:{' '}
							{values[index][0]}
						</Ink.Box>
					);
				}}
			</Ink.Static>
			{item && (
				<Field
					label={getLabel(item)}
					defaultValue={item.value}
					onSubmit={onSubmit}
				/>
			)}
		</Ink.Box>
	);
};

export default Form;
