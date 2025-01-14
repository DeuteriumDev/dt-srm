// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

const config = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // tseslint.config({
  //   settings: {
  //     parser: '@typescript-eslint/parser',
  //   },
  // }),
  eslintConfigPrettier,
);

console.log(config);

export default config;
