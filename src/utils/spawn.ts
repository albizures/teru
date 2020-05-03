import execa from 'execa';

const spawnWithArgs = (
	file: string,
	args: string[],
	options?: execa.Options,
): execa.ExecaChildProcess =>
	execa(file, args, { preferLocal: false, ...options });

const spawn = (
	cmd: string,
	options?: execa.Options,
): execa.ExecaChildProcess => {
	const [file, ...args] = cmd.split(/\s+/);
	return spawnWithArgs(file, args, options);
};

export { spawn, spawnWithArgs };
