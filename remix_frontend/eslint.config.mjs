import { config as defaultConfig } from '@epic-web/config/eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import("eslint").Linter.Config[]} */
export default [...defaultConfig, eslintConfigPrettier];
