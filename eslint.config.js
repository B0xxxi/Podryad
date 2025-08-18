const globals = require("globals");
const eslintJs = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ["public/js/**"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["public/js/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  eslintJs.configs.recommended,
  prettierConfig,
];