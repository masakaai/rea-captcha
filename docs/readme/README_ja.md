<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README_zh.md">简体中文</a> ·
  <strong>日本語</strong> ·
  <a href="README_ko.md">한국어</a>
</p>

# rea-captcha

**ブラウザー Agent 向け、ローカルファーストの検証チャレンジ検出と人間への引き継ぎ。**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha)
[![CI](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.masakaai%2Frea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha)
[![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha)
[![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha は、browser-use などのブラウザー Agent がタスク途中の CAPTCHA で止まる問題に対応します。Agent がすでに使っている Playwright/CDP セッションを再利用し、許可されたテスト環境または所有ページで Agent 自身が操作し、新しいサーバー検証結果を確認してから元のタスクを続行します。

> 公式配布元は [`masakaai/rea-captcha`](https://github.com/masakaai/rea-captcha) と npm の [`rea-captcha`](https://www.npmjs.com/package/rea-captcha) です。ホスト型 solver、テレメトリー、stealth 回避はありません。Jet Browser は明示的に選ぶ任意アダプターであり、依存関係でも既定ランタイムでもありません。

## 4 ケースの実証マトリクス

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="../assets/demos/recaptcha.gif" alt="reCAPTCHA demo" width="100%">
    </td>
    <td align="center" width="50%">
      <img src="../assets/demos/turnstile.gif" alt="Turnstile demo" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="../assets/demos/hcaptcha.gif" alt="hCaptcha demo" width="100%">
    </td>
    <td align="center" width="50%">
      <img src="../assets/demos/image-text.gif" alt="Image text demo" width="100%">
    </td>
  </tr>
</table>

最初の 3 ケースはベンダー提供 JavaScript と公開された非本番テストキーを使用し、検証 endpoint が `success: true` を返した後だけ保護操作を受理します。

## クイックスタート

Node.js 22.19+、24.11+、または 26+ が必要です。

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

`setup` は確認後に Playwright/CDP 設定を作成します。既存ファイルを上書きせず、Jet Browser をインストールしません。

## Agent / MCP

ゼロ設定の Registry 起動は `npx -y rea-captcha mcp --stateless` です。MCP は `captcha_analyze`、`captcha_inspect`、`captcha_complete`、`captcha_handoff`、`captcha_wait`、`captcha_resume` の 6 ツールを公開します。`captcha_complete` は、ポリシー、origin、ベンダーのテストキーを確認した後にだけ既存ブラウザーを操作します。詳細は [MCP tool catalog](../mcp-tools.md) を参照してください。

Agent の状態遷移は `inspect → agent-action → complete → fresh verify → resume` です。不明値、欠損証拠、タイムアウト、OCR 予測だけでは再開しません。

## 対応範囲

- reCAPTCHA、hCaptcha、Turnstile、GeeTest、DataDome、PerimeterX、AWS WAF、画像/テキスト、一般的な検証ページの証拠検出。
- Playwright `Page`、CDP、browser-use、明示設定した Jet Browser アダプター。
- npm provenance / Trusted Publishing と GitHub OIDC による公式 MCP Registry 公開。

所有または明示的に許可されたワークフロー専用です。第三者の対話型チャレンジ自動完了、署名 token 生成、資格情報の移送、stealth 回避は対象外です。

[Architecture](../architecture.md) · [Cases](../cases.md) · [Validation](../validation.md) · [Security](../../SECURITY.md) · [License](../../LICENSE)

rea-captcha の統合については [MASAKA Discord](https://discord.gg/8Ybc32NcMt) の専用 [#rea-captcha チャンネル](https://discord.com/channels/1555850967147356162/1559900477750116362)で議論できます。ブラウザープロファイル、Cookie、challenge token、API key、非公開ページの証拠は投稿しないでください。
