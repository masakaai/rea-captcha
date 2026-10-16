<p align="center"><a href="../../README.md">English</a> · <a href="README_zh.md">简体中文</a> · <strong>繁體中文</strong></p>

# rea-captcha

**讓瀏覽器 Agent 在既有工作階段中完成授權驗證流程。**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha 用來處理 browser-use 等瀏覽器 Agent 在任務途中被 CAPTCHA 卡住的情況。它重用 Agent 既有的 Playwright/CDP 瀏覽器，在明確授權的測試或自有場景中由 Agent 完成交互，並只在取得新的伺服器端通過證據後繼續原任務。

Jet Browser 只是明確選用的適配器，不是相依套件或預設 runtime。專案沒有託管 solver、遙測或隱身繞過承諾。

## Agentic 驗證矩陣

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="reCAPTCHA 完整流程" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Turnstile 完整流程" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="hCaptcha 完整流程" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>自有圖片/文字</strong><br>
      <img src="../assets/demos/image-text.gif" alt="圖片與文字完整流程" width="100%">
    </td>
  </tr>
</table>

四個案例都驗證完整的受保護操作：識別、同工作階段 Agent 操作、伺服器端驗證、新的通過證據、工作階段 Cookie，以及安全恢復。前三項使用供應商真實 JavaScript、公開非正式環境測試憑證與官方 Siteverify endpoint。

## 快速開始

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

需要 Node.js 22.19+、24.11+ 或 26+。`setup` 經確認後建立可審閱的 Playwright/CDP 設定，不會覆寫既有檔案，也不會安裝 Jet Browser。

## Agent 與 MCP

官方 Registry 名稱為 `io.github.masakaai/rea-captcha`，零設定啟動為 `npx rea-captcha@0.3.0 mcp --stateless`。服務提供六個工具：`captcha_analyze`、`captcha_inspect`、`captcha_complete`、`captcha_handoff`、`captcha_wait` 與 `captcha_resume`。`captcha_complete` 僅在策略允許、origin 相符且供應商測試 key 通過檢查時操作既有瀏覽器。

Agent 流程為 `inspect → agent-action → complete → 新證據驗證 → resume`。未知值、缺少證據、逾時或單獨的 OCR 預測都不能授權恢復。

## 使用範圍

僅用於自有或明確授權的流程。自動完成第三方互動式挑戰、產生供應商簽章 token、搬移憑證或隱身繞過皆不在範圍內。

[架構](../architecture.md) · [案例](../cases.md) · [MCP 工具](../mcp-tools.md) · [安全政策](../../SECURITY.md) · [授權](../../LICENSE)
