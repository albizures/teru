import {
	createStep,
	install,
	getStarterConfig,
	deleteStarterConfigfile,
} from './utils';
import { cloneRepo, gitInit } from './utils/git';
import { compileFiles, deleteFile } from './utils/files';
import {
	ProjectConfig,
	Token,
	TokeConfig,
	TokenValues,
	StarterFileConfig,
} from './types';

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
			value:
				typeof token.defaultValue === 'boolean'
					? token.defaultValue
					: token.defaultValue || '',
		});

		return tokens;
	}, [] as Token[]);

	config.starterConfig = starterConfig;
});

const getOnlyWhenResult = (
	file: StarterFileConfig,
	tokenValues: TokenValues,
	config: ProjectConfig,
) => {
	const { onlyWhen } = file;
	if (onlyWhen) {
		if (typeof onlyWhen === 'function') {
			return onlyWhen(tokenValues, config);
		}

		return Object.keys(onlyWhen).every((token) => {
			return onlyWhen[token] === tokenValues[token];
		});
	}
};

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
			.reduce((list, file) => {
				if (typeof file === 'string') {
					return list.concat(file);
				}

				const { onlyWhen, filename } = file;
				if (onlyWhen) {
					const toBeRemoved = !getOnlyWhenResult(file, tokenValues, config);

					if (toBeRemoved) {
						([] as string[]).concat(filename).forEach((filename: string) => {
							deleteFile(config.projectDir, filename);
						});
						return list;
					} else {
						return list.concat(filename);
					}
				}

				return list.concat(filename);
			}, [] as string[])
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
