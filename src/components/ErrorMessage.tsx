import React from 'react';
import * as Ink from 'ink';

interface PropTypes {
	error: Error;
	verbose?: boolean;
}

const ErrorMessage: React.FC<PropTypes> = (props) => {
	const { verbose = true, error } = props;
	return (
		<>
			<Ink.Text color="red">Something bad happend :(</Ink.Text>
			{verbose && (
				<Ink.Box marginLeft={2}>
					<Ink.Text color="red">{error.message}</Ink.Text>
					<Ink.Text color="red">{error.stack}</Ink.Text>
				</Ink.Box>
			)}
		</>
	);
};

export default ErrorMessage;
