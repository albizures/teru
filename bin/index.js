#!/usr/bin/env node
'use strict';
const React = require('react');
const { render } = require('ink');
const meow = require('meow');

const { default: ui } = require('../dist/index.js');

const cli = meow(`
	Usage
	  $ teru <name> <starter>

	Examples
	  $ teru https://github.com/sindresorhus/meow
`);

const [name, starter] = cli.input;

render(React.createElement(ui, { name, starter }));
