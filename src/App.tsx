import path from 'path';
import React from 'react';
import Spinner from 'ink-spinner';
import { Text, Color, Box } from 'ink';
import { clone, gitSetup, installDeps, replaceTokens } from './steps';
import { States, ProjectConfig, StepStatus, Step } from './types';
import StepList from './components/StepList';
import TextInput from 'ink-text-input';

interface PropTypes {
	name: string;
	starter: string;
}

const getSpinnerMessage = (state: States) => {
	if (state === States.Idle) {
		return 'Loading...';
	}

	if (state === States.Cloning) {
		return 'Cloning...';
	}

	if (state === States.GitInit) {
		return 'Initializing git...';
	}

	if (state === States.InstallingDeps) {
		return 'Installing dependencies...';
	}

	return '';
};

const isSpinnerNeeded = (state: States) => {
	return (
		state === States.Idle ||
		state === States.Cloning ||
		state === States.GitInit ||
		state === States.InstallingDeps
	);
};

const wait = () =>
	new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, 1000);
	});

const App: React.FC<PropTypes> = (props) => {
	const { name, starter } = props;
	const configRef = React.useRef<ProjectConfig>();
	const [steps, setSteps] = React.useState<Step[]>([]);
	const [state, setState] = React.useState(States.Idle);
	const [currentToken, setCurrentToken] = React.useState(0);
	const [tokenValue, setTokenValue] = React.useState('');

	const pushStep = (name: string, status: StepStatus) =>
		setSteps((steps) =>
			steps.concat({
				name,
				status,
			}),
		);

	React.useEffect(() => {
		const { current: config } = configRef;

		if (!config || state === States.Idle) {
			return;
		}

		const run = async () => {
			if (state === States.Cloning) {
				await clone(config);
				pushStep(clone.stepName, StepStatus.Done);

				if (config.tokens.length > 0) {
					setState(States.TokenValues);
					setCurrentToken(0);
				} else {
					pushStep(replaceTokens.stepName, StepStatus.Skip);
					setState(States.GitInit);
				}
				return;
			}

			if (state === States.ReplaceTokens) {
				await replaceTokens(config);
				pushStep(
					replaceTokens.stepName + ` (${config.tokens.length} tokens)`,
					StepStatus.Done,
				);
				setState(States.GitInit);
			}

			if (state === States.GitInit) {
				await wait();
				// await gitSetup(projectDir);
				pushStep(gitSetup.stepName, StepStatus.Done);

				setState(States.InstallingDeps);
			}

			if (state === States.InstallingDeps) {
				await wait();
				// await installDeps(projectDir);
				pushStep(installDeps.stepName, StepStatus.Done);

				setState(States.Finished);
			}
		};

		run().catch((error: Error) => {
			setState(States.Error);
		});
	}, [state]);

	React.useEffect(() => {
		const currentDir = process.cwd();
		const projectDir = path.join(currentDir, name);
		configRef.current = {
			name,
			files: [],
			projectDir,
			starter,
			tokens: [],
		};

		setState(States.Cloning);
	}, []);

	const spinnerMessage = getSpinnerMessage(state);

	const onChange = (value: string) => {
		setTokenValue(value);
	};

	const onSubmit = () => {
		const { current: config } = configRef;

		if (!config) {
			return;
		}

		const token = config.tokens[currentToken];
		token.value = tokenValue || token.value;

		if (!token.value) {
			return;
		}

		if (currentToken === config.tokens.length - 1) {
			setState(States.ReplaceTokens);
		} else {
			setTokenValue('');
			setCurrentToken(currentToken + 1);
		}
	};

	if (isSpinnerNeeded(state)) {
		return (
			<>
				<Box marginTop={1}>
					<Color green>
						<Spinner type="dots" />
					</Color>{' '}
					{spinnerMessage}
				</Box>
			</>
		);
	}

	if (state === States.TokenValues && configRef.current) {
		const { current: config } = configRef;
		const { name, value } = config.tokens[currentToken];
		const oldValue =
			value !== '' && tokenValue === '' ? <Color gray>({value}) </Color> : '';

		return (
			<>
				<StepList steps={steps} />
				<Box>
					Enter the value for <Text bold>{name}</Text>: {oldValue}
					<TextInput
						value={tokenValue}
						onChange={onChange}
						onSubmit={onSubmit}
					/>
				</Box>
			</>
		);
	}

	if (state === States.Error || !configRef.current) {
		return <Color red>Something bad happend :(</Color>;
	}

	const { projectDir } = configRef.current;
	return (
		<>
			<StepList steps={steps} />
			<Box marginTop={1}>
				All set up at <Text underline>{projectDir}</Text>
			</Box>
			<Color green>Happy coding :)</Color>
		</>
	);
};
export default App;
