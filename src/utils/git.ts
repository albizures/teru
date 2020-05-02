import execa from 'execa';
import path from 'path';
import fs from 'fs-extra';
import hostedGitInfo from 'hosted-git-info';
import { spawn, spawnWithArgs } from './spawn';

const cloneRepo = async (
	starter: string,
	projectDir: string,
): Promise<void> => {
	const hostInfo = hostedGitInfo.fromUrl(starter);

	if (!hostInfo) {
		throw new Error('Invalid starter: ${starter}');
	}
	let url: string;

	// Let people use private repos accessed over SSH.
	if (hostInfo.getDefaultRepresentation() === 'sshurl') {
		url = hostInfo.ssh({ noCommittish: true });
		// Otherwise default to normal git syntax.
	} else {
		url = hostInfo.https({ noCommittish: true, noGitPlus: true });
	}

	const branch = hostInfo.committish ? ['-b', hostInfo.committish] : [];

	const args = [
		'clone',
		...branch,
		url,
		projectDir,
		'--recursive',
		'--depth=1',
	].filter(Boolean);

	await spawnWithArgs('git', args);

	await fs.remove(path.join(projectDir, '.git'));
};

const gitInit = async (cwd: string): Promise<execa.ExecaReturnBase<string>> =>
	await spawn('git init', { cwd });

export { gitInit, cloneRepo };
