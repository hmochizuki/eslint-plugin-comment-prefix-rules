import customPlugin from "./dist/index.js"; // コンパイル後のファイルを読み込む

export default [
  {
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
