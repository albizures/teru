import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import hostedGitInfo from 'hosted-git-info';
import App from './index';
import Starter from './Starter';

const cli = meow(
	`
	Usage
		$ teru <name> <starter>
		$ teru starter analyze
		
	Options
		--verbose, -v

	Examples
	  $ teru my-app https://github.com/albizures/teru-node-starter
	  $ teru my-app albizures/teru-node-starter
`,
	{
		flags: {
			verbose: {
				type: 'boolean',
				alias: 'v',
			},
		},
	},
);

const run = () => {
	const [name, starter] = cli.input;

	if (name === 'starter' && starter === 'analyze') {
		render(React.createElement(Starter, { ...cli.flags }));
		return;
	}

	const isValidStarter = Boolean(hostedGitInfo.fromUrl(starter));

	if (name && starter && isValidStarter) {
		render(
			React.createElement(App, {
				name,
				starter,
				verbose: Boolean(cli.flags.verbose),
			}),
		);
		return;
	}

	console.log(cli.help);
};

export { run };
