export default [
  {
    plugins: {
      custom: require("./src/index.ts") // プラグインを正しいパスでインポート
    },
    rules: {
      "custom/comment-prefix": [
        "error",
        {
          lineRules: ["^TODO\\[PROJ-\\d+\\]:", "^FIXME\\[BUG-\\d+]:"],
          blockRules: ["^.{1,80}$"]
        }
      ]
    }
  }
];
