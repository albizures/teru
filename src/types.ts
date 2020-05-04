export interface Token {
	id: string;
	title: string;
	value: string | boolean | number;
	message?: string;
}

export type TokenValues = Record<string, unknown>;

export interface ProjectConfig {
	name: string;
	files: string[];
	projectDir: string;
	starter: string;
	tokens: Token[];
	starterConfig?: StarterConfig;
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
	title?: string;
	message?: string;
	defaultValue?: StaterTokenValue;
}

export interface StarterFileConfig {
	filename: string;
	onlyWhen?: Record<string, unknown>;
}

export type StarterFile = StarterFileConfig | string;
export type TokeConfig =
	| StarterToken
	| ((config: ProjectConfig) => StarterToken);
export type TokenConfigs = Record<string, TokeConfig>;

export interface StarterConfig {
	tokens: TokenConfigs;
	files: StarterFile[];
}
