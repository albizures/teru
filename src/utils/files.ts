import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import glob from 'glob';
import prettier from 'prettier';
import {
	StarterConfig,
	StarterFile,
	StarterFileConfig,
	TokenConfigs,
	TokeConfig,
	TokenValues,
	ProjectConfig,
} from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function () {};

const compileFile = async (file: string, tokens: Record<string, unknown>) => {
	const str = await ejs.renderFile(
		file,
		{
			tokens,
			file: noop,
		},
		{ async: true },
	);

	await fs.promises.writeFile(file, str);
};

const getProjectFiles = (projectDir: string): Promise<string[]> =>
	new Promise((resolve, reject) => {
		glob(
			path.join('**', '*'),
			{
				cwd: projectDir,
				dot: true,
				nodir: true,
				ignore: ['.git/**', 'teru.starter.js'],
			},
			(error, files) => {
				if (error) {
					return reject(error);
				}

				resolve(files);
			},
		);
	});

const replaceTokens = async (
	config: ProjectConfig,
	files: string[],
	tokens: TokenValues,
) => {
	await Promise.all(
		files.map((file) => {
			return compileFile(path.join(config.projectDir, file), tokens);
		}),
	);
};

const analyzeFile = async (filename: string) => {
	const tokens = new Set<string>();
	let config: unknown;
	const handler = {
		get(obj: unknown, prop: string) {
			tokens.add(prop);
			return '';
		},
	};
	const file = (fileConfig: StarterFileConfig) => {
		config = fileConfig;
	};

	await ejs.renderFile(
		filename,
		{
			file,
			tokens: new Proxy({}, handler),
		},
		{ async: true },
	);

	return {
		file: config
			? {
					...(config as StarterFileConfig),
					filename,
			  }
			: filename,
		tokens: Array.from(tokens),
	};
};

const analyzeProject = async (projectDir: string) => {
	const projectFiles = await getProjectFiles(projectDir);

	const { files, tokens } = (
		await Promise.all(projectFiles.map((filename) => analyzeFile(filename)))
	).reduce(
		(value, data) => {
			if (
				(data.tokens && data.tokens.length > 0) ||
				typeof data.file === 'object'
			) {
				value.files.push(data.file);
			}
			data.tokens.forEach((token) => value.tokens.add(token));

			return value;
		},
		{
			tokens: new Set<string>(),
			files: [] as StarterFile[],
		},
	);

	return {
		tokens: Array.from<string>(tokens).reduce((tokens, tokenName) => {
			tokens[tokenName] = {};

			return tokens;
		}, {} as Record<string, TokeConfig>),
		files,
	};
};

const serializeConfig = (config: StarterConfig) => {
	return prettier.format(`module.exports = ${JSON.stringify(config)}`, {
		parser: 'babel',
		trailingComma: 'all',
		useTabs: true,
		tabWidth: 2,
		semi: true,
		printWidth: 40,
		jsxSingleQuote: false,
		singleQuote: true,
		bracketSpacing: true,
		jsxBracketSameLine: false,
		arrowParens: 'always',
	});
};

const getFilename = (file: StarterFile) => {
	if (typeof file === 'object') {
		return file.filename;
	}

	return file;
};

// change the currentConfig to configFromStarterFile
// to make it clearer
const mergeStarterConfigs = (
	currentConfig: StarterConfig,
	newConfig: StarterConfig,
) => {
	const tokens: TokenConfigs = Object.assign({}, currentConfig.tokens);

	Object.keys(newConfig.tokens).forEach((key) => {
		if (!tokens[key]) {
			tokens[key] = {};
		}
	});

	// just cloning
	const oldFiles = ([] as StarterFile[]).concat(currentConfig.files);
	const files = newConfig.files.reduce((result, newFile) => {
		const newFilename = getFilename(newFile);

		for (let index = 0; index < oldFiles.length; index++) {
			const oldFile = oldFiles[index];
			const oldFilename = getFilename(oldFile);
			if (oldFilename === newFilename) {
				// this loop is going to be stopped, so there is not problem
				// changing the array since it's going start all over again
				// and that way we avoing unnecessary checks
				oldFiles.splice(index, 1);

				if (typeof oldFile === 'object') {
					if (typeof newFile === 'object') {
						// the config needs to be merged
						return result.concat({
							...newFile,
							...oldFile,
						});
					} else {
						// TODO: this could mean that, the file doesn't need a config
						// anymore, so asking for confirmation to actually keep the
						// config or remove it, it's the right path here
						return result.concat(oldFile);
					}
				}
				return result.concat(newFile);
			}
		}

		return result.concat(newFile);
	}, [] as StarterFile[]);

	return {
		tokens,
		files: files.concat(oldFiles.filter((file) => typeof file !== 'string')),
	};
};

const writeStarterConfig = async (
	projectDir: string,
	config: StarterConfig,
) => {
	const filename = path.join(projectDir, 'teru.starter.js');
	if (!fs.existsSync(filename)) {
		await fs.promises.writeFile(serializeConfig(config), 'utf8');
	}

	const currentConfig = require(path.join(projectDir, 'teru.starter.js'));

	const mergedConfig = mergeStarterConfigs(currentConfig, config);

	await fs.promises.writeFile(filename, serializeConfig(mergedConfig), 'utf8');
};

const deleteFile = (projectDir: string, file: string) => {
	fs.unlink(path.join(projectDir, file));
};

export {
	deleteFile,
	replaceTokens,
	compileFile,
	analyzeFile,
	getProjectFiles,
	analyzeProject,
	writeStarterConfig,
};
