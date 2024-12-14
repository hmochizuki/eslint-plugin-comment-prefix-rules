"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const eslint_1 = require("eslint");
const comment_prefix_1 = __importDefault(require("./comment-prefix"));
const getInvalidMessage_1 = require("./getInvalidMessage");
const trimCommentPrefix = (comment) => {
    if (comment.startsWith("// ")) {
        return comment.slice(3).trim();
    }
    if (comment.startsWith("/*")) {
        return comment.replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "").trim();
    }
    return comment.trim();
};
(0, vitest_1.describe)("code-comments-rule", () => {
    const ruleTester = new eslint_1.RuleTester({
        languageOptions: { ecmaVersion: 2020, sourceType: "module" },
    });
    (0, vitest_1.describe)("デフォルトの設定では、", () => {
        const validComments = [
            "// TODO[TASK-123]: これを実装する",
            "// FIXME[BUG-456]: 修正する必要がある",
            "// NOTE: 実装に関する説明",
            "// WIP: 未実装部分",
            "// HACK: 後でリファクタリング",
            "// eslint-disable",
            "// ts-ignore",
            "// @biome-disable-next-line",
            "/** ブロックコメント */",
            `/*
        複数行コメントも許可
      */`,
        ];
        const invalidComments = [
            "// 間違ったコメント",
            "// TODO: チケット番号が不足",
        ];
        (0, vitest_1.it)("有効なコメントがエラーにならない", () => {
            ruleTester.run("comment-prefix", comment_prefix_1.default, {
                valid: validComments.map((comment) => ({
                    code: comment,
                    filename: "test-file.js",
                })),
                invalid: [],
            });
        });
        (0, vitest_1.it)("無効なコメントにはエラーが発生する", () => {
            ruleTester.run("comment-prefix", comment_prefix_1.default, {
                valid: [],
                invalid: invalidComments.map((comment) => ({
                    code: comment,
                    filename: "test.ts",
                    errors: [
                        {
                            message: (0, getInvalidMessage_1.getInvalidMessage)("Line", trimCommentPrefix(comment)),
                        },
                    ],
                })),
            });
        });
    });
    (0, vitest_1.describe)("ユーザーオプションによるカスタマイズされたルールのテスト", () => {
        (0, vitest_1.it)("カスタム lineRules が正しく適用される", () => {
            const customRule = "^CUSTOM\\[[A-Z]{3}-\\d+\\]:";
            const customValidComment = "// CUSTOM[ABC-123]: カスタムルールにマッチ";
            const customInvalidComment = "// INVALID: このコメントはカスタムルールにマッチしない";
            ruleTester.run("comment-prefix", comment_prefix_1.default, {
                valid: [
                    {
                        code: customValidComment,
                        filename: "custom-file.js",
                        options: [
                            {
                                lineRules: [customRule],
                            },
                        ],
                    },
                ],
                invalid: [
                    {
                        code: customInvalidComment,
                        filename: "custom-file.js",
                        options: [
                            {
                                lineRules: [customRule],
                            },
                        ],
                        errors: [
                            {
                                message: (0, getInvalidMessage_1.getInvalidMessage)("Line", trimCommentPrefix(customInvalidComment)),
                                line: 1,
                                column: 1,
                            },
                        ],
                    },
                ],
            });
        });
        (0, vitest_1.it)("カスタム blockRules が正しく適用される", () => {
            const customRule = "^BLOCK\\[\\d+\\]: .*";
            const customValidBlockComment = "/* BLOCK[456]: カスタムルールにマッチ */";
            const customInvalidBlockComment = "/* 不正なブロックコメント */";
            ruleTester.run("comment-prefix", comment_prefix_1.default, {
                valid: [
                    {
                        code: customValidBlockComment,
                        filename: "block-file.js",
                        options: [
                            {
                                blockRules: [customRule],
                            },
                        ],
                    },
                ],
                invalid: [
                    {
                        code: customInvalidBlockComment,
                        filename: "block-file.js",
                        options: [
                            {
                                blockRules: [customRule],
                            },
                        ],
                        errors: [
                            {
                                message: (0, getInvalidMessage_1.getInvalidMessage)("Block", trimCommentPrefix(customInvalidBlockComment)),
                                line: 1,
                                column: 1,
                            },
                        ],
                    },
                ],
            });
        });
        (0, vitest_1.it)("カスタム lineIgnoreRules が適用される", () => {
            const customIgnoreRule = "^SKIP:";
            const ignoreValidComment = "// SKIP: このコメントは無視される";
            const ignoreInvalidComment = "// MISSING: このコメントはエラー";
            ruleTester.run("comment-prefix", comment_prefix_1.default, {
                valid: [
                    {
                        code: ignoreValidComment,
                        filename: "ignore-file.js",
                        options: [
                            {
                                lineIgnoreRules: [customIgnoreRule],
                            },
                        ],
                    },
                ],
                invalid: [
                    {
                        code: ignoreInvalidComment,
                        filename: "ignore-file.js",
                        options: [
                            {
                                lineIgnoreRules: [customIgnoreRule],
                            },
                        ],
                        errors: [
                            {
                                message: (0, getInvalidMessage_1.getInvalidMessage)("Line", trimCommentPrefix(ignoreInvalidComment)),
                                line: 1,
                                column: 1,
                            },
                        ],
                    },
                ],
            });
        });
        (0, vitest_1.it)("ファイルパスが include/exclude ルールに従う", () => {
            const excludedComment = "// TODO[PROJ-123]: このファイルはルール違反でもエラーにならない";
            const includedComment = "// TODO: このファイルはルールに従うためエラーになる";
            ruleTester.run("comment-prefix", comment_prefix_1.default, {
                valid: [
                    {
                        code: excludedComment,
                        filename: "excluded-file.js",
                        options: [
                            {
                                exclude: ["**/excluded-*.js"],
                            },
                        ],
                    },
                ],
                invalid: [
                    {
                        code: includedComment,
                        filename: "included-file.js",
                        options: [
                            {
                                include: ["included-*.js"],
                            },
                        ],
                        errors: [
                            {
                                message: (0, getInvalidMessage_1.getInvalidMessage)("Line", trimCommentPrefix(includedComment)),
                                line: 1,
                                column: 1,
                            },
                        ],
                    },
                ],
            });
        });
    });
});
