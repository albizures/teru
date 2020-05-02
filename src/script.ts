import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './index';
import hostedGitInfo from 'hosted-git-info';

const cli = meow(
	`
	Usage
		$ teru <name> <starter>
		
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
	const isValidStarter = Boolean(hostedGitInfo.fromUrl(starter));

	if (name && starter && isValidStarter) {
		render(React.createElement(App, { name, starter, ...cli.flags }));
		return;
	}

	console.log(cli.help);
};

export { run };
