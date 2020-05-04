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
