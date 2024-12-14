"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const micromatch_1 = __importDefault(require("micromatch"));
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
const ticketPrefix = "\[[a-zA-Z0-9]{2,5}-\d+\]";
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
};
const rule = {
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
        const options = { ...defaultOptions, ...(context.options[0] || {}) };
        const filePath = context.physicalFilename;
        const isIncluded = micromatch_1.default.isMatch(filePath, options.include || []);
        const isExcluded = micromatch_1.default.isMatch(filePath, options.exclude || []);
        if (!isIncluded || isExcluded)
            return {};
        const lineRegexes = options.lineRules.map((rule) => new RegExp(rule));
        const lineIgnoreRegexes = options.lineIgnoreRules.map((rule) => new RegExp(rule));
        const blockRegexes = options.blockRules.map((rule) => new RegExp(rule));
        const blockIgnoreRegexes = options.blockIgnoreRules.map((rule) => new RegExp(rule));
        return {
            Program() {
                const sourceCode = context.sourceCode;
                const comments = sourceCode.getAllComments();
                comments.forEach((comment) => {
                    if (comment.loc == null)
                        return;
                    const commentValue = comment.value.trim();
                    if (eslintCommentRules.some((regex) => regex.test(commentValue)))
                        return;
                    if (tsCommentPatterns.some((regex) => regex.test(commentValue)))
                        return;
                    if (biomeCommentPatterns.some((regex) => regex.test(commentValue)))
                        return;
                    if (comment.type === "Line") {
                        if (lineIgnoreRegexes.some((regex) => regex.test(commentValue)))
                            return;
                        const isValid = lineRegexes.some((regex) => regex.test(commentValue));
                        if (!isValid) {
                            context.report({
                                loc: comment.loc,
                                message: `Line comment "${commentValue}" does not match any of the user-defined line rules.`
                            });
                        }
                    }
                    else if (comment.type === "Block") {
                        if (blockIgnoreRegexes.some((regex) => regex.test(commentValue)))
                            return;
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
exports.default = rule;
