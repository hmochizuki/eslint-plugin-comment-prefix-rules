import customPlugin from "./dist/index.js";

export default [
  {
    files: ["example/**/*.ts", "example/**/*.js"],
    plugins: {
      custom: customPlugin,
    },
    rules: {
      "custom/comment-prefix": [
        "error",
        {
          lineRules: ["^TODO\\[PROJ-\\d+\\]:", "^FIXME\\[BUG-\\d+]:"],
          blockRules: ["^.{1,80}$"],
        },
      ],
    },
  },
];
