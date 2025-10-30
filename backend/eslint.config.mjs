import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended, // non-type-checked defaults

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      "@typescript-eslint/no-explicit-any": "off",
    },
    ignores: ['dist', 'coverage', 'node_modules'],
  }
);
