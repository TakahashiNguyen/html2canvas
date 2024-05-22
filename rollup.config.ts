import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import * as pkg from './package.json';

const banner = `/*!
 * ${pkg.title} ${pkg.version} <${pkg.homepage}>
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.url}>
 * Released under ${pkg.license} License
 */`;

export default {
	input: `src/index.ts`,
	output: [
		{file: pkg.main, name: pkg.name, format: 'umd', banner, sourcemap: false},
		{file: pkg.module, format: 'esm', banner, sourcemap: false}
	],
	external: [],
	watch: {
		include: 'src/**'
	},
	plugins: [
		// Allow node_modules resolution, so you can use 'external' to control
		// which external modules to include in the bundle
		// https://github.com/rollup/rollup-plugin-node-resolve#usage
		resolve(),
		// Allow json resolution
		json(),
		// Compile TypeScript files
		typescript({sourceMap: false, inlineSources: true}),
		// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
		commonjs({
			include: 'node_modules/**'
		})
	]
};
