import { Rule } from "eslint";
import micromatch from "micromatch";
import { getInvalidMessage } from "./getInvalidMessage.js";

const eslintCommentRules = [
  /^eslint-disable/,
  /^eslint-enable/,
  /^eslint-disable-line/,
  /^eslint-disable-next-line/,
];
const tsCommentPatterns = [
  /^ts-ignore/,
  /^ts-expect-error/,
];
const biomeCommentPatterns = [
  /^@biome-ignore$/,
  /^@biome-disable$/,
  /^@biome-disable-next-line$/,
];
const ticketPrefix = "\\[[a-zA-Z0-9]{2,5}-\\d+\\]"
const defaultLineRules = [
  "^MEMO:", // NOTE: 仕様に関するコメント. 例: こういう理由でこういう降るまいにしている.
  "^NOTE:", // NOTE: 実装に関するコメント. 例: こういう理由でこういう実装にしている.
  "^WIP:", // WIP: 未実装だがリリースまでに対応しなければないない箇所. 例: WIP: APIをコールする
  "^HACK:", // HACK: 可能であればリファクタリングをしたい箇所(チケットを作るほどでもない) 例: こういう理由でこういう実装に変えたい
  `^TODO${ticketPrefix}:`, // TODO: 将来的に追加機能が決まっている箇所または将来的にやった方が良いリファクタリング.チケットなどと紐付けたい. 例: TODO[PROJ-123]: {将来的な機能の説明}また、そのためにどんな実装が必要か
  `^FIXME${ticketPrefix}:`, // FIXME: 既知のバグが見つかっている箇所.チケットなどと紐づけたい. 例: FIXME[BUG-123]: {バグの説明}
];

const defaultOptions = {
  lineRules: defaultLineRules,
  lineIgnoreRules: [],
  blockRules: [],
  blockIgnoreRules: [],
  include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.mjsx"],
  exclude: ["node_modules/**", "dist/**"],
};
type Options = typeof defaultOptions;

const properties = {
  lineRules: {
    type: "array",
    items: { type: "string" },
    minItems: 1
  },
  lineIgnoreRules: {
    type: "array",
    items: { type: "string" },
    minItems: 1
  },
  blockRules: {
    type: "array",
    items: { type: "string" },
    minItems: 1
  },
  blockIgnoreRules: {
    type: "array",
    items: { type: "string" },
    minItems: 1
  },
  include: {
    type: "array",
    items: { type: "string" },
    minItems: 1
  },
  exclude: {
    type: "array",
    items: { type: "string" },
    minItems: 1
  },
} as const satisfies Record<keyof typeof defaultOptions, unknown>

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
        properties,
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options: Options = { ...defaultOptions, ...(context.options[0] || {}) };

    const filePath = context.physicalFilename;
    const isIncluded = micromatch.isMatch(filePath, options.include || []);
    const isExcluded = micromatch.isMatch(filePath, options.exclude || []);
    if (!isIncluded || isExcluded) return {};
    
    const lineRegexes = options.lineRules.map((rule) => new RegExp(rule));
    const lineIgnoreRegexes = options.lineIgnoreRules.map((rule) => new RegExp(rule));
    const blockRegexes = options.blockRules.map((rule) => new RegExp(rule));
    const blockIgnoreRegexes = options.blockIgnoreRules.map((rule) => new RegExp(rule));
    return {
      Program() {
        const sourceCode = context.sourceCode;
        const comments = sourceCode.getAllComments();
        
        comments.forEach((comment) => {
          if (comment.loc == null) return;
          const commentValue = comment.value.trim();
          if (eslintCommentRules.some((regex) => regex.test(commentValue))) return;
          if (tsCommentPatterns.some((regex) => regex.test(commentValue))) return;
          if (biomeCommentPatterns.some((regex) => regex.test(commentValue))) return;

          if (comment.type === "Line") {
            if(lineRegexes.length === 0) return;
            if(lineIgnoreRegexes.some((regex) => regex.test(commentValue))) return;
            if(lineRegexes.some((regex) => regex.test(commentValue))) return;
            context.report({
              loc: comment.loc,
              message: getInvalidMessage(comment.type, commentValue)
            });
          } else if (comment.type === "Block") {
            if(blockRegexes.length === 0) return;
            if(blockIgnoreRegexes.some((regex) => regex.test(commentValue))) return;
            if(blockRegexes.some((regex) => regex.test(commentValue))) return;
            context.report({
              loc: comment.loc,
              message: getInvalidMessage(comment.type, commentValue)
            });
          }
        });
      }
    };
  }
};

export default rule;
