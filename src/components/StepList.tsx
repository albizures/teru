import React from 'react';
import { Box, Text } from 'ink';
import { Step, StepStatus } from '../types';

interface PropTypes {
	steps: Step[];
}

const getColor = (status: StepStatus) => {
	if (status === StepStatus.Done) {
		return { bgGreen: true };
	}
	if (status === StepStatus.Fail) {
		return { bgRed: true };
	}
	if (status === StepStatus.Skip) {
		return { bgWhite: true };
	}
};

const StepList: React.FC<PropTypes> = (props) => {
	const { steps } = props;

	return (
		<>
			{steps.map((step, index) => {
				return (
					<Box marginLeft={2} marginBottom={1} key={index}>
						<Text {...getColor(step.status)} color="black">
							{' '}
							{step.status}{' '}
						</Text>{' '}
						<Text>{step.name}</Text>
					</Box>
				);
			})}
		</>
	);
};

export default StepList;
