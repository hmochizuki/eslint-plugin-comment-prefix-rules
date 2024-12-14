import { describe, it, expect } from "vitest";
import { RuleTester } from "eslint";
import rule from "./comment-prefix";
import { getInvalidMessage } from "./getInvalidMessage";

const trimCommentPrefix = (comment: string): string => {
  if (comment.startsWith("// ")) {
    return comment.slice(3).trim();
  }
  if (comment.startsWith("/*")) {
    return comment.replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "").trim();
  }
  return comment.trim();
}

describe("code-comments-rule", () => {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2020, sourceType: "module" },
  });
  describe("デフォルトの設定では、", () => {
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

    it("有効なコメントがエラーにならない", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: validComments.map((comment) => ({
          code: comment,
          filename: "test-file.js",
        })),
        invalid: [],
      });
    });

    it("無効なコメントにはエラーが発生する", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: [],
        invalid: invalidComments.map((comment) => ({
          code: comment,
          filename: "test.ts",
          errors: [
            {
              message: getInvalidMessage("Line", trimCommentPrefix(comment)),
            },
          ],
        })),
      });
    });
  });

  describe("ユーザーオプションによるカスタマイズされたルールのテスト", () => {
    it("カスタム lineRules が正しく適用される", () => {
      const customRule = "^CUSTOM\\[[A-Z]{3}-\\d+\\]:"
      const customValidComment = "// CUSTOM[ABC-123]: カスタムルールにマッチ";
      const customInvalidComment = "// INVALID: このコメントはカスタムルールにマッチしない";
      ruleTester.run("comment-prefix", rule, {
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
                message: getInvalidMessage("Line", trimCommentPrefix(customInvalidComment)),
                line: 1,
                column: 1,
              },
            ],
          },
        ],
      });
    });
  
    it("カスタム blockRules が正しく適用される", () => {
      const customRule = "^BLOCK\\[\\d+\\]: .*"
      const customValidBlockComment = "/* BLOCK[456]: カスタムルールにマッチ */";
      const customInvalidBlockComment = "/* 不正なブロックコメント */";

      ruleTester.run("comment-prefix", rule, {
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
                message: getInvalidMessage("Block", trimCommentPrefix(customInvalidBlockComment)),
                line: 1,
                column: 1,
              },
            ],
          },
        ],
      });
    });
  
    it("カスタム lineIgnoreRules が適用される", () => {
      const customIgnoreRule = "^SKIP:"
      const ignoreValidComment = "// SKIP: このコメントは無視される";
      const ignoreInvalidComment = "// MISSING: このコメントはエラー";

      ruleTester.run("comment-prefix", rule, {
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
                message: getInvalidMessage("Line", trimCommentPrefix(ignoreInvalidComment)),
                line: 1,
                column: 1,
              },
            ],
          },
        ],
      });
    });
    it("ファイルパスが include/exclude ルールに従う", () => {
      const excludedComment = "// TODO[PROJ-123]: このファイルはルール違反でもエラーにならない";
      const includedComment = "// TODO: このファイルはルールに従うためエラーになる";

      ruleTester.run("comment-prefix", rule, {
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
                message: getInvalidMessage("Line", trimCommentPrefix(includedComment)),
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
