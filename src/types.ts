export enum States {
	Idle,
	Cloning,
	GitInit,
	InstallingDeps,
	Finished,
	Error,
	TokenValues,
	ReplaceTokens,
}
export interface Token {
	name: string;
	value: string;
	match: string;
}

export interface ProjectConfig {
	name: string;
	files: string[];
	projectDir: string;
	starter: string;
	tokens: Token[];
}

export enum StepStatus {
	Skip = 'Skip',
	Done = 'Done',
	Fail = 'Fail',
}

export interface Step {
	name: string;
	status: StepStatus;
}

export type StaterTokenValue = string | boolean | number;

export interface StarterToken {
	defaultValue: StaterTokenValue;
}

export interface StarterConfig {
	tokens: Record<
		string,
		StarterToken | ((config: ProjectConfig) => StarterToken)
	>;
}
