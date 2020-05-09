export type Value = string | boolean | number;

export interface Token {
	id: string;
	title: string;
	value: Value;
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

export type StaterTokenValue = Value;

export interface StarterToken {
	title?: string;
	message?: string;
	defaultValue?: StaterTokenValue;
}

export type OnlyWhen =
	| Record<string, unknown>
	| ((tokens: TokenValues, config: ProjectConfig) => boolean);

export interface StarterFileConfig {
	filename: string | string[];
	onlyWhen?: OnlyWhen;
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
