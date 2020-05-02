import { createStep, install, getProjectFiles } from './utils';
import { cloneRepo, gitInit } from './utils/git';
import {
	findTokens,
	replaceTokens as replaceTokensInFiles,
} from './utils/files';
import { ProjectConfig } from './types';

const clone = createStep('Create Project ', async (config: ProjectConfig) => {
	await cloneRepo(config.starter, config.projectDir);
	const files = await getProjectFiles(config.projectDir);

	let fileTokens: string[] = [];

	for (const file of files) {
		fileTokens = fileTokens.concat(await findTokens(file));
	}

	config.files = files;

	config.tokens = Array.from(new Set(fileTokens)).map((match) => {
		const name = match.replace(/\\/g, '');
		const id = name.replace('[teru:', '').replace(']', '');
		const configValue = config[id as keyof ProjectConfig];
		const value = typeof configValue === 'string' ? configValue : '';
		return {
			name,
			match: match.replace('[', '\\[').replace(']', '\\]'),
			value,
		};
	});
});

const replaceTokens = createStep(
	'Replace Tokens',
	async (config: ProjectConfig) => {
		await replaceTokensInFiles(config.files, config.tokens);
	},
);

const gitSetup = createStep('Setup Git ', (config: ProjectConfig) =>
	gitInit(config.projectDir),
);

const installDeps = createStep(
	'Install Dependencies',
	(config: ProjectConfig) => install(config.projectDir),
);

export { clone, gitSetup, installDeps, replaceTokens };
