import {
	createStep,
	install,
	getStarterConfig,
	deleteStarterConfigfile,
} from './utils';
import { cloneRepo, gitInit } from './utils/git';
import {
	findTokens,
	getProjectFiles,
	replaceTokens as replaceTokensInFiles,
} from './utils/files';
import { ProjectConfig, StarterConfig } from './types';

const getTokenDefaultValue = (
	starterConfig: StarterConfig,
	tokenId: string,
	config: ProjectConfig,
) => {
	const token = starterConfig.tokens[tokenId];
	if (token) {
		return String(
			typeof token === 'function'
				? token(config).defaultValue
				: token.defaultValue,
		);
	}

	return '';
};

const clone = createStep('Create Project ', async (config: ProjectConfig) => {
	const { projectDir, starter } = config;
	await cloneRepo(starter, projectDir);

	const starterConfig = getStarterConfig(projectDir);

	deleteStarterConfigfile(projectDir);

	const files = await getProjectFiles(projectDir);
	let fileTokens: string[] = [];

	for (const file of files) {
		fileTokens = fileTokens.concat(await findTokens(file));
	}

	config.files = files;

	config.tokens = Array.from(new Set(fileTokens)).map((match) => {
		const name = match.replace(/\\/g, '');
		const id = name.replace('[teru:', '').replace(']', '');

		const value = getTokenDefaultValue(starterConfig, id, config);

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
