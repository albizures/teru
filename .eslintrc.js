module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'react', 'react-hooks'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/ban-types': 'warn',
		'@typescript-eslint/ban-ts-comment': 'warn',
		'no-mixed-spaces-and-tabs': 'off',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'react/jsx-uses-react': 'error',
		'react/jsx-uses-vars': 'error',
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
};
