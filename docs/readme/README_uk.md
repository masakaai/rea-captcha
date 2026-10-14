<p align="center"><a href="../../README.md">English</a> · <strong>Українська</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Локальне виявлення перевірок і безпечна передача людині для браузерних агентів.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha виявляє бар'єри перевірки, призупиняє агента, зберігає початкову сесію браузера для видимого втручання людини й продовжує те саме завдання лише після отримання свіжого підтвердження успіху. Проєкт містить TypeScript SDK, локальний stdio MCP, Playwright/CDP, browser-use, Agent Skill для Vercel Skills і необов'язковий локальний OCR для дозволених origin.

Jet Browser — необов'язковий адаптер, а не залежність чи runtime за замовчуванням. Немає розміщеного solver-сервісу, телеметрії або обіцянок прихованого обходу.

## Матриця агентної перевірки

<p align="center">
  <strong>Google reCAPTCHA v2</strong><br>
  <img src="../assets/demos/recaptcha.gif" alt="Сценарій reCAPTCHA" width="860">
</p>

<p align="center">
  <strong>Cloudflare Turnstile</strong><br>
  <img src="../assets/demos/turnstile.gif" alt="Сценарій Turnstile" width="860">
</p>

<p align="center">
  <strong>hCaptcha</strong><br>
  <img src="../assets/demos/hcaptcha.gif" alt="Сценарій hCaptcha" width="860">
</p>

<p align="center">
  <strong>Власне зображення/текст</strong><br>
  <img src="../assets/demos/image-text.gif" alt="Сценарій зображення і тексту" width="860">
</p>

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

Офіційна назва — `io.github.masakaai/rea-captcha`, запуск без конфігурації: `npx -y rea-captcha mcp --stateless`. Доступні п'ять інструментів: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` і `captcha_resume`. Перший лише читає й аналізує вже наявні в агента дані; решта чотири зберігають ту саму налаштовану сесію.

Цикл: `inspect → blocked → handoff → обмежене очікування → нова перевірка → resume`. Невідоме значення, неповні дані, timeout або лише прогноз OCR ніколи не дозволяють продовження.

## Сфера застосування

Лише власні або явно дозволені процеси. Автоматичне розв'язання інтерактивних перевірок третіх сторін, створення підписаних постачальником token, перенесення облікових даних і прихований обхід захисту не підтримуються.

[Архітектура](../architecture.md) · [Сценарії](../cases.md) · [Інструменти MCP](../mcp-tools.md) · [Безпека](../../SECURITY.md) · [Ліцензія](../../LICENSE)
