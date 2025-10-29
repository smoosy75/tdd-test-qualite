module.exports = {
  // On indique à Jest d'utiliser ts-jest pour transpiler TS/JS moderne
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: false
      }
    ],
  },

  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // On ignore la transformation de node_modules sauf cas spécial => défaut standard
  transformIgnorePatterns: [
    "node_modules/(?!.*)", // on peut laisser ça simple ici
  ],
};
