<p align="center">
  <a href="../../README.md">English</a> ·
  <strong>简体中文</strong> ·
  <a href="README_ja.md">日本語</a> ·
  <a href="README_ko.md">한국어</a>
</p>

# rea-captcha

**面向浏览器 Agent 的本地优先验证挑战识别与人工接管。**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha)
[![CI](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.masakaai%2Frea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha)
[![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha)
[![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)
[![license](https://img.shields.io/badge/license-MIT-157a73.svg)](../../LICENSE)

[快速开始](#快速开始) · [四类真实验证矩阵](#四类真实验证矩阵) · [工作方式](#工作方式) · [MCP 工具目录](../mcp-tools.md) · [架构](../architecture.md)

rea-captcha 用于解决 browser-use 等浏览器 Agent 在任务中途被 CAPTCHA 卡住的问题。它复用 Agent 已有的 Playwright/CDP 浏览器，在明确授权的测试或自有场景中由 Agent 完成交互，经过新的服务端通过证据后再继续原任务。

> **官方来源：** [`masakaai/rea-captcha`](https://github.com/masakaai/rea-captcha) 与 npm 包 [`rea-captcha`](https://www.npmjs.com/package/rea-captcha)。项目不包含托管解题服务、遥测或隐身绕过；Jet Browser 只是显式选择的可选适配器，不是依赖或默认运行时。

## 四类真实验证矩阵

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="Google reCAPTCHA 完整验证流程" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Cloudflare Turnstile 完整验证流程" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="hCaptcha 完整验证流程" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>自有图片/文本</strong><br>
      <img src="../assets/demos/image-text.gif" alt="自有图片文本完整验证流程" width="100%">
    </td>
  </tr>
</table>

每个案例都覆盖完整受保护操作：识别、同会话 Agent 操作、服务端验证、重新观察通过状态、校验会话 Cookie，以及恢复同一个控制器。

前三项加载厂商托管脚本，并且只有本地服务从厂商验证端点收到 `success: true` 后才接受受保护操作。测试使用各厂商公开的非生产测试密钥，不伪造通过状态。

```sh
npm run demo:web
npm run test:web-demo
```

## 快速开始

需要 Node.js 22.19+、24.11+ 或 26+。只有 browser-use 或本地 OCR 需要 Python 3.11+。

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
```

`setup` 经确认后创建可审阅的通用 Playwright/CDP 配置，并输出 Codex 注册命令；它不会安装 Jet Browser，也不会覆盖已有文件。

通过 Vercel Skills CLI 安装 Agent Skill：

```sh
npx skills add masakaai/rea-captcha --skill rea-captcha
```

## 工作方式

```text
浏览器 Agent
    │
    ├─ 已有页面证据 ── captcha_analyze ── 策略结果
    │
    └─ 活跃浏览器会话
          inspect → agent-action → complete → 新证据验证 → resume
                              │
                              └─ Agent 操作同一个已有会话
```

未知值、异常探测结果、缺失证据、超时和 OCR 预测都会按失败关闭处理，不能授权恢复。浏览器生命周期由调用方持有，适配器默认只借用会话。

## MCP 与编码 Agent

官方 Registry 名称为 `io.github.masakaai/rea-captcha`。零配置入口为：

```sh
npx rea-captcha@0.3.0 mcp --stateless
```

服务提供 6 个工具：`captcha_analyze`、`captcha_inspect`、`captcha_complete`、`captcha_handoff`、`captcha_wait` 与 `captcha_resume`。`captcha_complete` 只会在策略允许、来源匹配且厂商测试 key 校验通过时操作已有浏览器。详见 [MCP 工具目录](../mcp-tools.md)。

```sh
npx rea-captcha agent-config --agent codex
npx rea-captcha agent-config --agent mcp-json
```

rea-captcha 增加验证识别和受控完成能力，不替代 Agent 自己的导航工具；两者必须使用同一浏览器会话。

## SDK 与浏览器提供方

```ts
import { ChallengeController } from 'rea-captcha';
import { PlaywrightChallengeAdapter } from 'rea-captcha/playwright';

const controller = new ChallengeController({
  browser: new PlaywrightChallengeAdapter({ id: 'checkout', page })
});
```

支持借用 Playwright `Page`、Playwright-over-CDP、browser-use，以及显式配置的 Jet Browser managed/standalone 适配器。默认且推荐的跨 Agent 路径是现有浏览器开放 CDP；Jet Browser 不会被默认安装或启动。

本地 `ddddocr` 只用于精确授权来源上的简单图片/文本挑战，必须同时配置 `allowLocalImageText` 与 `authorizedOrigins`。项目不重新分发模型权重，OCR 输出也不等于验证通过。

## 能力与边界

- 识别 reCAPTCHA、hCaptcha、Turnstile、GeeTest、DataDome、PerimeterX、AWS WAF、图片/文本和通用验证页证据。
- 确定性状态机、有界超时、取消和新证据恢复检查。
- TypeScript SDK、browser-use hook、6 个 MCP 工具与 Vercel Skills 兼容 Skill。
- 本地 JSONL 事件、明确所有权、无遥测。
- npm Trusted Publishing/provenance 与基于 GitHub OIDC 的 MCP Registry 发布。

rea-captcha 仅用于自有或明确授权的流程。它不会生成厂商签名 token，也不承诺第三方站点接受自动化。商业解题 API、凭据搬运、隐身绕过和自动完成第三方交互式挑战均不在范围内。

## 文档与许可

[架构](../architecture.md) · [案例](../cases.md) · [验证证据](../validation.md) · [发布流程](../releasing.md) · [安全策略](../../SECURITY.md) · [贡献指南](../../CONTRIBUTING.md)

可加入 [MASAKA Discord](https://discord.gg/8Ybc32NcMt)，并在专用的 [#rea-captcha 频道](https://discord.com/channels/1555850967147356162/1559900477750116362)讨论接入与同会话人工接管。请勿发布浏览器资料、Cookie、挑战 token、API key 或私有页面证据。

核心代码与集成为 MIT 许可；可选依赖和模型保留各自条款。灵感来自 [morluto/rea](https://github.com/morluto/rea)。
