module.exports = {
  plugins: ["custom"],
  rules: {
    "custom/comment-prefix": [
      "error",
      {
        lineRules: ["^TODO\\[PROJ-\\d+\\]:", "^FIXME\\[BUG-\\d+]:"],
        blockRules: ["^.{1,80}$"]
      }
    ]
  }
};
