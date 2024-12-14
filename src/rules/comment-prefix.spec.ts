import { describe, it, expect } from "vitest";
import { RuleTester } from "eslint";
import rule from "./comment-prefix";

describe("コメントルールのテスト", () => {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2020, sourceType: "module" },
  });

  it("正しいコメントにはエラーが発生しない", () => {
    ruleTester.run("comment-prefix", rule, {
      valid: [
        // 行コメントの例
        "// TODO[TASK-123]: これを実装する",
        "// FIXME[BUG-456]: 修正する必要がある",
        "// NOTE: 実装に関する説明",
        "// WIP: 未実装部分",
        "// HACK: 後でリファクタリング",

        // 無視されるコメントの例
        "// eslint-disable",
        "// ts-ignore",
        "// @biome-disable-next-line",

        // ブロックコメントの例
        `/*
          NOTE: 複数行コメントも許可
        */`,
      ],
      invalid: [],
    });
  });
});
