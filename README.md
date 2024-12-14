# eslint-plugin-comment-prefix-rules
`eslint-code-comments-rule`は、コードコメントの形式を検証するESLintプラグインです。
プロジェクトでコメントスタイルを統一することで、可読性と保守性を向上させます。

特徴
- デフォルトの設定でいくつかのコメントのルールを提案（上書き可能）
- ユーザー自身でルールを設定可能
- ラインコメントとブロックコメントの両方をサポート
- ファイルやフォルダ単位で適応

## インストール
```bash
npm install eslint-plugin-comment-prefix-rules --save-dev
pnpm add eslint-plugin-comment-prefix-rules --save-dev
yarn add eslint-plugin-comment-prefix-rules --save-dev
```

## 設定
ESLintの設定にプラグインを追加

```javascript
import commentPrefixRule from "eslint-code-comments-rule";

export default [
  {
    plugins: {
      "eslint-code-comments-rule": commentPrefixRule,
    },
    rules: {
      "eslint-code-comments-rule/comment-prefix": "error",
    },
  },
];
```

## Options
オプションは以下の通りです。
- lineRules
- blockRules
- include
- exclude

### デフォルト値

#### lineRules
以下のようなプレフィックスを強制します。
{HOGE} は自由記述の内容です。
- MEMO: {アプリケーションの仕様に関するコメント}
- NOTE: {実装に関するコメント}
- WIP: {未実装だがリリースまでに対応予定の内容}
- HACK: {リファクタリングをしたい内容}
- TODO[TICKET-123]: {将来的に追加機能が決まっている内容.チケットなどと紐付ける}
- FIXME[TICKET-123]: {既知のバグの内容.チケットなどと紐付ける}

#### blockRules
- ルールなし

#### include
- `["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.mjsx"]`

#### exclude
- `["node_modules/**", "dist/**"]`

### カスタマイズ例
```javascript
rules: {
  "eslint-code-comments-rule/comment-prefix": [
    "error",
    {
      lineRules: ["^CUSTOM\\[[A-Z]{3}-\\d+\\]:"], // ラインコメントの許容ルール(正規表現)
      blockRules: ["^BLOCK\\[\\d+\\]: .*"], // ブロックコメントの許容ルール(正規表現)
      include: ["src/**/*.js"], // 対象ファイル
      exclude: ["**/test/**"], // 除外ファイル
    },
  ],
}
```

## ライセンス
MIT License © 2024 hi_mochy
