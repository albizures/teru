<h1 align="center" style="font-size: 4em">
  # teru
</h1>

Teru is an easy to use project generator

## How to start a project?

```bash
npx teru my-app albizures/teru-node-starter
# or using a full url
npx teru my-app https://github.com/albizures/teru-node-starter
```

## How to create a starter

Basically any git repository is a teru starter, however is possible to modify how a starter behaves using `token`s (which is just a fancy name for variables) and [ejs](https://github.com/mde/ejs).

Let's assume a basic node project:

    .
    ├── package.json
    └── index.js

Using ejs, the `package.json` file can be modified when the new project is being created:

```json
{
	"name": "<%= tokens.name %>",
	"version": "0.0.0",
	"main": "src/index.js",
	"author": "<%= tokens.author %> <<%= tokens.email %>>",
	"license": "MIT"
}
```

Where `name`, `author` and `email` are tokens and their values are going to be requested.

And the last step is to run:

```
npx teru starter analyze
```

This command is going to check the whole project and it's going to create a `teru.starter.js` file with something similar to this:

```js
module.exports = {
	tokens: {
		author: {},
		name: {},
		email: {},
	},
	files: ['package.json'],
};
```

For now there is no need to change anything here. You can check more about this file [here](#using-teru-starter-js-file)

And that's it!
Now the starter is ready to be published in any git hosting service and use it 🔥

## Using `teru.starter.js` file

### Token customization

The starter file describes the tokens that are being used in the starter and the files where they are being used, additional to this, teru allows to customize how they are going to be requested, for example:

```js
module.exports = {
	tokens: {
		author: {
			message: "What's your name",
		},
		name: {
			defaultValue: nameGenerator(),
		},
		email: {
			message: "What's your email?",
		},
	},
	files: ['package.json'],
};
```

### Conditional files

Teru allows to have conditional files using the token values, for example:

```js
module.exports = {
	tokens: {
		author: {},
		name: {},
		email: {},
		prettier: {
			message: 'Do you want to use Prettier?',
			// a default value is needed to let teru know the
			// starter is going to ask for a boolean value
			defaultValue: true,
		},
	},
	files: [
		'package.json',
		{
			onlyWhen: { prettier: true },
			filename: 'prettier.config.js',
		},
	],
};
```

> Assuming the the starter already have the `prettier.config.js` file

Using this starter config the `prettier.config.js` file is going to be added only when `prettier` is `true`.
