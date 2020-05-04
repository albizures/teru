// @ts-ignore
import yarnOrNpm from 'yarn-or-npm';
import path from 'path';
import to from 'await-to-js';
import fs from 'fs-extra';
import { ProjectConfig, StarterConfig } from '../types';
import { spawn } from './spawn';

type Action = (config: ProjectConfig) => Promise<unknown>;

class StepError extends Error {
	stepName: string;
	constructor(message: string, stepName: string) {
		super(message);

		this.stepName = stepName;
	}
}

const createStep = (name: string, fn: Action) => {
	const step = async (config: ProjectConfig) => {
		const [error] = await to(fn(config));

		if (error) {
			throw new StepError(`Error in step: ${name}`, name);
		}
	};

	step.stepName = name;

	return step;
};

const install = async (projectDir: string): Promise<void> => {
	const prevDir = process.cwd();
	const pkgManager = yarnOrNpm();

	process.chdir(projectDir);

	await to(fs.remove(pkgManager === 'npm' ? 'package-lock.json' : 'yarn.lock'));
	await to(spawn(`${pkgManager} install`, { cwd: projectDir }));

	process.chdir(prevDir);
};

const getStarterConfigFile = (projectDir: string) =>
	path.join(projectDir, 'teru.starter.js');

const defaultStaterConfig: StarterConfig = {
	tokens: {
		name(config: ProjectConfig) {
			return {
				defaultValue: config.name,
			};
		},
	},
	files: [],
};

const getStarterConfig = (projectDir: string): StarterConfig => {
	const configFile = getStarterConfigFile(projectDir);
	if (!fs.existsSync(configFile)) {
		// TODO: analyze starter
		return defaultStaterConfig;
	}
	const config = require(configFile);

	if (!config) {
		return defaultStaterConfig;
	}

	if (!config.tokens) {
		config.tokens = defaultStaterConfig.tokens;
	}

	if (!config.tokens.name || !config.tokens.name.defaultValue) {
		config.tokens.name = defaultStaterConfig.tokens.name;
	}

	return config;
};

const deleteStarterConfigfile = (projectDir: string) => {
	const configFile = getStarterConfigFile(projectDir);
	if (!fs.existsSync(configFile)) {
		return;
	}

	fs.unlinkSync(configFile);
};

export { createStep, install, deleteStarterConfigfile, getStarterConfig };
