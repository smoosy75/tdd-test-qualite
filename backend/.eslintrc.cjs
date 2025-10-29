module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: false, ecmaVersion: 2023, sourceType: "module" },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  env: { node: true, es2023: true, jest: true },
  ignorePatterns: ["dist/", "coverage/"],
};
