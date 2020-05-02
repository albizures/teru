import fs from 'fs-extra';
import { replaceInFile as replace } from 'replace-in-file';
import { Token } from '../types';

const findTokens = async (file: string): Promise<string[]> => {
	const text = await fs.promises.readFile(file, 'utf8');
	const tokens = [];

	for (const match of text.matchAll(/\[teru:\w*\]/g)) {
		tokens.push(match[0]);
	}

	return tokens;
};

const replaceTokens = async (files: string[], tokens: Token[]) => {
	const { to, from } = tokens.reduce(
		(result, { match, value }) => {
			result.from.push(new RegExp(match, 'g'));
			result.to.push(value);
			return result;
		},
		{ to: [] as string[], from: [] as RegExp[] },
	);

	await replace({
		to,
		from,
		files,
	});
};

export { findTokens, replaceTokens };
