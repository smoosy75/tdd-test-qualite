/* eslint-env node */
/* global module */
module.exports = {
  // On indique à Jest d'utiliser ts-jest pour transpiler TS/JS moderne
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: false,
      },
    ],
  },

  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  transformIgnorePatterns: [
    'node_modules/(?!.*)'
  ],
};
