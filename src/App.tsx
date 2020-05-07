import path from 'path';
import React from 'react';
import Spinner from 'ink-spinner';
import { Text, Color, Box } from 'ink';
import { clone, gitSetup, installDeps, compile } from './steps';
import { ProjectConfig, StepStatus, Step, Value } from './types';
import StepList from './components/StepList';
import Form from './components/Form';
import ErrorMessage from './components/ErrorMessage';

export enum States {
	Idle,
	Cloning,
	GitInit,
	InstallingDeps,
	Finished,
	TokenValues,
	Compile,
}

interface PropTypes {
	name: string;
	starter: string;
	verbose: boolean;
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

const App: React.FC<PropTypes> = (props) => {
	const { name, starter, verbose = false } = props;
	const configRef = React.useRef<ProjectConfig>();
	const [steps, setSteps] = React.useState<Step[]>([]);
	const [state, setState] = React.useState(States.Idle);
	const [currentError, setError] = React.useState<Error>();

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
				} else {
					pushStep(compile.stepName, StepStatus.Skip);
					setState(States.GitInit);
				}
				return;
			}

			if (state === States.Compile) {
				await compile(config);
				pushStep(
					compile.stepName + ` (${config.tokens.length} tokens)`,
					StepStatus.Done,
				);
				setState(States.GitInit);
			}

			if (state === States.GitInit) {
				await gitSetup(config);
				pushStep(gitSetup.stepName, StepStatus.Done);

				setState(States.InstallingDeps);
			}

			if (state === States.InstallingDeps) {
				await installDeps(config);
				pushStep(installDeps.stepName, StepStatus.Done);

				setState(States.Finished);
			}
		};

		run().catch((error: Error) => {
			setError(error);
		});
	}, [state, verbose]);

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
	}, [starter, name]);

	const spinnerMessage = getSpinnerMessage(state);

	if (isSpinnerNeeded(state)) {
		return (
			<>
				<Box>
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
		const onFinish = (values: Record<string, Value>) => {
			config.tokens.forEach((token) => {
				token.value = values[token.id];
			});
			setState(States.Compile);
		};

		return <Form items={config.tokens} onFinish={onFinish} />;
	}

	if (!configRef.current || currentError) {
		return (
			<ErrorMessage
				verbose={verbose}
				error={currentError || new Error('Missing config')}
			/>
		);
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
