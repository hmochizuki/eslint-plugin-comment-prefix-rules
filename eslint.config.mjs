import customPlugin from "./dist/index.js";

export default [
  {
    files: ["example/**/*.ts", "example/**/*.js"],
    plugins: {
      custom: customPlugin,
    },
    rules: {
      "custom/code-comments-rule": ["error"],
    },
  },
];
