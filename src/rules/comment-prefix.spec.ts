import { describe, it, expect } from "vitest";
import { RuleTester } from "eslint";
import rule from "./comment-prefix";

describe("code-comments-rule", () => {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2020, sourceType: "module" },
  });
  describe("デフォルトの設定では、", () => {
    
      it("TODO, FIXME 形式のコメントがエラーにならない", () => {
        ruleTester.run("comment-prefix", rule, {
          valid: [
            {
              code: "// TODO[TASK-123]: これを実装する",
              filename: "test-file.js",
            },
            {
              code: "// FIXME[BUG-456]: 修正する必要がある",
              filename: "test-file.ts",
            },
          ],
          invalid: [],
        });
      });
    
      it("NOTE, WIP, HACK のコメントがエラーにならない", () => {
        ruleTester.run("comment-prefix", rule, {
          valid: [
            {
              code: "// NOTE: 実装に関する説明",
              filename: "test-file.jsx",
            },
            {
              code: "// WIP: 未実装部分",
              filename: "test-file.tsx",
            },
            {
              code: "// HACK: 後でリファクタリング",
              filename: "test-file.mjs",
            },
          ],
          invalid: [],
        });
      });
    
      it("無視されるコメントがエラーにならない", () => {
        ruleTester.run("comment-prefix", rule, {
          valid: [
            {
              code: "// eslint-disable",
              filename: "test-file.js",
            },
            {
              code: "// ts-ignore",
              filename: "test-file.ts",
            },
            {
              code: "// @biome-disable-next-line",
              filename: "test-file.tsx",
            },
          ],
          invalid: [],
        });
      });
    
      it("ブロックコメントがエラーにならない", () => {
        ruleTester.run("comment-prefix", rule, {
          valid: [
            {
              code: "/** ブロックコメント */",
              filename: "test-file.js",
            },
            {
              code: `/*
                複数行コメントも許可
              */`,
              filename: "test-file.jsx",
            },
          ],
          invalid: [],
        });
      });
  
    it("ルールにマッチしないコメントにはエラーが発生する", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: [],
        invalid: [
          {
            code: "// 間違ったコメント",
            filename: "test.ts",
            errors: [
              {
                message: 'Line comment "間違ったコメント" does not match any of the user-defined line rules.',
              },
            ],
          },
          {
            code: "// TODO: チケット番号が不足",
            filename: "test.ts",
            errors: [
              {
                message: 'Line comment "TODO: チケット番号が不足" does not match any of the user-defined line rules.',
              },
            ],
          },
        ],
      });
    });
  });

  describe("ユーザーオプションによるカスタマイズされたルールのテスト", () => {
    it("カスタム lineRules が正しく適用される", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: [
          {
            code: "// CUSTOM[ABC-123]: カスタムルールにマッチ",
            filename: "custom-file.js",
            options: [
              {
                lineRules: ["^CUSTOM\\[[A-Z]{3}-\\d+\\]:"], // ユーザー定義のルール
              },
            ],
          },
        ],
        invalid: [
          {
            code: "// INVALID: このコメントはカスタムルールにマッチしない",
            filename: "custom-file.js",
            options: [
              {
                lineRules: ["^CUSTOM\\[[A-Z]{3}-\\d+\\]:"], // ユーザー定義のルール
              },
            ],
            errors: [
              {
                message: 'Line comment "INVALID: このコメントはカスタムルールにマッチしない" does not match any of the user-defined line rules.',
                line: 1,
                column: 1,
              },
            ],
          },
        ],
      });
    });
  
    it("カスタム blockRules が正しく適用される", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: [
          {
            code: "/* BLOCK[456]: カスタムルールにマッチ */",
            filename: "block-file.js",
            options: [
              {
                blockRules: ["^BLOCK\\[\\d+\\]: .*"], // ユーザー定義のブロックルール
              },
            ],
          },
        ],
        invalid: [
          {
            code: "/* 不正なブロックコメント */",
            filename: "block-file.js",
            options: [
              {
                blockRules: ["^BLOCK\\[\\d+\\]: .*"], // ユーザー定義のブロックルール
              },
            ],
            errors: [
              {
                message: 'Block comment "不正なブロックコメント" does not match any of the user-defined block rules.',
                line: 1,
                column: 1,
              },
            ],
          },
        ],
      });
    });
  
    it("カスタム lineIgnoreRules が適用される", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: [
          {
            code: "// SKIP: このコメントは無視される",
            filename: "ignore-file.js",
            options: [
              {
                lineRules: ["^TODO\\[[A-Z]{3}-\\d+\\]:"], // 有効なルール
                lineIgnoreRules: ["^SKIP:"], // 無視するコメント
              },
            ],
          },
        ],
        invalid: [
          {
            code: "// MISSING: このコメントはエラー",
            filename: "ignore-file.js",
            options: [
              {
                lineRules: ["^TODO\\[[A-Z]{3}-\\d+\\]:"], // 有効なルール
                lineIgnoreRules: ["^SKIP:"], // 無視するコメント
              },
            ],
            errors: [
              {
                message: 'Line comment "MISSING: このコメントはエラー" does not match any of the user-defined line rules.',
                line: 1,
                column: 1,
              },
            ],
          },
        ],
      });
    });
  
    it("ファイルパスが include/exclude ルールに従う", () => {
      ruleTester.run("comment-prefix", rule, {
        valid: [
          {
            code: "// TODO[PROJ-123]: このファイルはルール違反でもエラーにならない",
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
            code: "// TODO: このファイルはルールに従う",
            filename: "included-file.js",
            options: [
              {
                include: ["included-*.js"],
              },
            ],
            errors: [
              {
                message: 'Line comment "TODO: このファイルはルールに従う" does not match any of the user-defined line rules.',
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
