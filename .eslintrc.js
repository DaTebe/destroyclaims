module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    "jest/globals": true,
  },
  extends: ["airbnb-base", "eslint:recommended", "prettier"],
  plugins: ["prettier", "jest"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-console": 1, // Means warning
    "prettier/prettier": 2, // Means error
  },
};
