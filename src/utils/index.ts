// @ts-ignore
import yarnOrNpm from 'yarn-or-npm';
import glob from 'glob';
import path from 'path';
import to from 'await-to-js';
import fs from 'fs-extra';
import { ProjectConfig } from '../types';
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

const getProjectFiles = (projectDir: string): Promise<string[]> =>
	new Promise((resolve, reject) => {
		glob(
			path.join(projectDir, '**', '*'),
			{
				dot: true,
				nodir: true,
			},
			(error, files) => {
				if (error) {
					return reject(error);
				}

				resolve(files);
			},
		);
	});

export { createStep, install, getProjectFiles };
