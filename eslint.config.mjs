import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true
			}
		},
		rules: {
			'no-console': 'off',
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{
					accessibility: 'no-public'
				}
			],
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-use-before-define': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/class-name-casing': 'off',
			//'prettier/prettier': 'error',
			'@typescript-eslint/ban-ts-comment': 'off',
			'no-empty': 'off',
			'@typescript-eslint/no-duplicate-enum-values': 'off',
			'no-empty-pattern': 'off',
			'no-case-declarations': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'no-debugger': 'off',
			'no-async-promise-executor': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'no-constant-condition': 'off'
		},
		files: ['**/*.ts', '**/*.tsx']
	},
	{
		ignores: ['**/rollup.config.ts', 'www/*', '**/*.js', 'dist/*', 'build/*', 'scripts/*']
	}
);
