import { Rule } from "eslint";
import { AST } from "eslint";

interface Options {
  lineRules: string[]; // Line コメントの正規表現
  blockRules: string[]; // Block コメントの正規表現
}

const defaultOptions: Options = {
  lineRules: ["^TODO\\[PROJ-\\d+\\]:", "^FIXME\\[BUG-\\d+\\]:"],
  blockRules: []
};

const eslintCommentPatters = [
  /^eslint-disable/,
  /^eslint-enable/,
  /^eslint-disable-line/,
  /^eslint-disable-next-line/,
];

const tsCommentPatterns = [
  /^ts-ignore/,
  /^ts-expect-error/,
];

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce specific rules for line and block comments",
      category: "Best Practices",
      recommended: false
    },
    schema: [
      {
        type: "object",
        properties: {
          lineRules: {
            type: "array",
            items: { type: "string" },
            minItems: 1
          },
          blockRules: {
            type: "array",
            items: { type: "string" },
            minItems: 1
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    // ユーザ設定を取得し、デフォルトを補完
    const options: Options = { ...defaultOptions, ...(context.options[0] || {}) };

    // ルール用の正規表現を生成
    const lineRegexes = options.lineRules.map((rule) => new RegExp(rule));
    const blockRegexes = options.blockRules.map((rule) => new RegExp(rule));

    return {
      Program() {
        const sourceCode = context.sourceCode;
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          // 無視するコメントをスキップ
          if (eslintCommentPatters.some((regex) => regex.test(comment.value))) return;
          if (tsCommentPatterns.some((regex) => regex.test(comment.value))) return;

          // loc が null または undefined の場合はスキップ
          if (comment.loc == null) return;
          const commentValue = comment.value.trim();

          if (comment.type === "Line") {
            // Line コメントに対するルール
            const isValid = lineRegexes.some((regex) => regex.test(commentValue));
            if (!isValid) {
              context.report({
                loc: comment.loc,
                message: `Line comment "${commentValue}" does not match any of the user-defined line rules.`
              });
            }
          } else if (comment.type === "Block") {
            // Block コメントに対するルール
            const isValid = blockRegexes.some((regex) => regex.test(commentValue));
            if (!isValid) {
              context.report({
                loc: comment.loc,
                message: `Block comment "${commentValue}" does not match any of the user-defined block rules.`
              });
            }
          }
        });
      }
    };
  }
};

export default rule;
