import {
	createStep,
	install,
	getStarterConfig,
	deleteStarterConfigfile,
} from './utils';
import { cloneRepo, gitInit } from './utils/git';
import { compileFiles, deleteFile } from './utils/files';
import { ProjectConfig, Token, TokeConfig, TokenValues } from './types';

const getTokenConfig = (token: TokeConfig, config: ProjectConfig) => {
	return typeof token === 'function' ? token(config) : token;
};

const clone = createStep('Create Project ', async (config: ProjectConfig) => {
	const { projectDir, starter } = config;
	await cloneRepo(starter, projectDir);

	const starterConfig = getStarterConfig(projectDir);

	deleteStarterConfigfile(projectDir);

	config.tokens = Object.keys(starterConfig.tokens).reduce((tokens, key) => {
		const token = getTokenConfig(starterConfig.tokens[key], config);
		tokens.push({
			id: key,
			message: token.message,
			title: token.title || key,
			value: String(token.defaultValue || ''),
		});

		return tokens;
	}, [] as Token[]);
	config.starterConfig = starterConfig;
});

const compile = createStep(
	'Compile templates',
	async (config: ProjectConfig) => {
		const { tokens, starterConfig } = config;

		if (!starterConfig) {
			throw new Error('Missing starter config');
		}

		const tokenValues = tokens.reduce((values, token) => {
			values[token.id] = token.value;

			return values;
		}, {} as TokenValues);

		const files: string[] = starterConfig.files
			.map((file) => {
				if (typeof file === 'string') {
					return file;
				}

				const { onlyWhen, filename } = file;
				if (onlyWhen) {
					const toBeRemove = !Object.keys(onlyWhen).every((token) => {
						return (
							onlyWhen[token] ===
							//  === 'true' is a workaround until different value are supported
							(tokenValues[token] === 'true' || tokenValues[token])
						);
					});

					if (toBeRemove) {
						deleteFile(config.projectDir, filename);
						return '';
					}
				}
				return file.filename;
			})
			.filter((file) => file);

		await compileFiles(config, files, tokenValues);
	},
);

const gitSetup = createStep('Setup Git ', (config: ProjectConfig) =>
	gitInit(config.projectDir),
);

const installDeps = createStep(
	'Install Dependencies',
	(config: ProjectConfig) => install(config.projectDir),
);

export { clone, gitSetup, installDeps, compile };
