import React from 'react';
import * as Ink from 'ink';
import Spinner from 'ink-spinner';
import { analyzeProject, writeStarterConfig } from './utils/files';
import ErrorMessage from './components/ErrorMessage';
import { StarterConfig } from './types';

enum States {
	Idle,
	Analyzing,
	ConfirmWrite,
	WritingToFile,
	Done,
}

interface PropTypes {
	verbose?: boolean;
}

const Starter: React.FC<PropTypes> = (props) => {
	const { verbose = true } = props;
	const { exit } = Ink.useApp();
	const [state, setState] = React.useState(States.Idle);
	const configRef = React.useRef<StarterConfig>();
	const [currentError, setError] = React.useState<Error>();

	Ink.useInput((input, key) => {
		if (state === States.ConfirmWrite && key.return) {
			setState(States.WritingToFile);
		}
	});

	React.useEffect(() => {
		const currentDir = process.cwd();

		analyzeProject(currentDir)
			.then((config) => {
				configRef.current = config;
				setState(States.ConfirmWrite);
			})
			.catch((error) => {
				setError(error);
			});
	}, []);

	React.useEffect(() => {
		const { current: config } = configRef;

		if (state === States.WritingToFile) {
			if (!config) {
				setError(new Error('Missing config'));
				return;
			}

			writeStarterConfig(process.cwd(), config)
				.then(() => {
					setState(States.Done);
				})
				.catch((error) => {
					setError(error);
				});
			return;
		}
	}, [state]);

	if (state === States.Idle || state === States.Analyzing) {
		return (
			<Ink.Box>
				<Spinner /> Analyzing... {state}
			</Ink.Box>
		);
	}

	if (currentError) {
		return <ErrorMessage verbose={verbose} error={currentError} />;
	}

	if (state === States.ConfirmWrite) {
		return (
			<Ink.Text>
				This action will modify <Ink.Text underline>ture.starter.js</Ink.Text>{' '}
				file, please save any changes before continue (Enter)
			</Ink.Text>
		);
	}

	if (state === States.Done) {
		// this is a workaround, until isActive option is available for useInput
		setTimeout(exit, 100);
	}

	return <Ink.Text>Done :)</Ink.Text>;
};

export default Starter;
