<p align="center"><a href="../../README.md">English</a> · <strong>Українська</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Локальне виявлення перевірок і безпечна передача людині для браузерних агентів.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha не дає браузерним агентам на кшталт browser-use застрягати посеред завдання через CAPTCHA. Він повторно використовує наявну сесію Playwright/CDP; в авторизованих тестах або на власних сторінках агент сам виконує дію й продовжує лише після нового серверного підтвердження.

Jet Browser — необов'язковий адаптер, а не залежність чи runtime за замовчуванням. Немає розміщеного solver-сервісу, телеметрії або обіцянок прихованого обходу.

## Матриця агентної перевірки

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="Сценарій reCAPTCHA" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Сценарій Turnstile" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="Сценарій hCaptcha" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Власне зображення/текст</strong><br>
      <img src="../assets/demos/image-text.gif" alt="Сценарій зображення і тексту" width="100%">
    </td>
  </tr>
</table>

Усі чотири випадки перевіряють повний захищений шлях: виявлення, передачу тієї самої сесії, серверну валідацію, свіжий доказ, cookie сесії та безпечне продовження. Перші три використовують справжній JavaScript постачальника, публічні тестові ключі й офіційні endpoint Siteverify.

## Швидкий старт

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Потрібен Node.js 22.19+, 24.11+ або 26+. Після підтвердження `setup` створює конфігурацію Playwright/CDP, яку можна перевірити, не перезаписує наявний файл і не встановлює Jet Browser.

## Агенти та MCP

Офіційна назва — `io.github.masakaai/rea-captcha`, запуск без конфігурації: `npx -y rea-captcha mcp --stateless`. Доступні шість інструментів: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait` і `captcha_resume`. `captcha_complete` працює в наявному браузері лише після перевірки політики, origin і документованого тестового ключа провайдера.

Цикл агента: `inspect → agent-action → complete → нова перевірка → resume`. Невідоме значення, неповні дані, timeout або лише прогноз OCR ніколи не дозволяють продовження.

## Сфера застосування

Лише власні або явно дозволені процеси. Автоматичне розв'язання інтерактивних перевірок третіх сторін, створення підписаних постачальником token, перенесення облікових даних і прихований обхід захисту не підтримуються.

[Архітектура](../architecture.md) · [Сценарії](../cases.md) · [Інструменти MCP](../mcp-tools.md) · [Безпека](../../SECURITY.md) · [Ліцензія](../../LICENSE)
