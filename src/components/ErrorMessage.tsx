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
			<Ink.Color red>Something bad happend :(</Ink.Color>
			{verbose && (
				<Ink.Box marginLeft={2}>
					<Ink.Color red>{error.message}</Ink.Color>
					<Ink.Color red>{error.stack}</Ink.Color>
				</Ink.Box>
			)}
		</>
	);
};

export default ErrorMessage;
