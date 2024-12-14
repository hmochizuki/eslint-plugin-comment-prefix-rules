import { describe, it, expect } from "vitest";
import { RuleTester } from "eslint";
import rule from "./comment-prefix";

describe("コメントルールのテスト", () => {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2020, sourceType: "module" },
  });
  
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
