<p align="center"><a href="../../README.md">English</a> · <strong>Русский</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Локальное обнаружение проверок и безопасная передача человеку для браузерных агентов.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha обнаруживает барьер проверки, приостанавливает агента, сохраняет исходную сессию браузера для видимого вмешательства человека и продолжает ту же задачу только после появления нового подтверждения успеха. Проект включает TypeScript SDK, локальный stdio MCP, Playwright/CDP, browser-use, Agent Skill для Vercel Skills и необязательный локальный OCR для разрешённых origin.

Jet Browser — только необязательный адаптер, а не зависимость или runtime по умолчанию. Нет размещённого solver-сервиса, телеметрии или обещаний скрытого обхода.

## Матрица агентной проверки

<table>
  <tr><td width="50%"><strong>Google reCAPTCHA v2</strong><br><img src="../assets/demos/recaptcha.gif" alt="Сценарий reCAPTCHA" width="100%"></td><td width="50%"><strong>Cloudflare Turnstile</strong><br><img src="../assets/demos/turnstile.gif" alt="Сценарий Turnstile" width="100%"></td></tr>
  <tr><td width="50%"><strong>hCaptcha</strong><br><img src="../assets/demos/hcaptcha.gif" alt="Сценарий hCaptcha" width="100%"></td><td width="50%"><strong>Собственное изображение/текст</strong><br><img src="../assets/demos/image-text.gif" alt="Сценарий изображения и текста" width="100%"></td></tr>
</table>

Все четыре случая проверяют полный защищённый путь: обнаружение, передачу той же сессии, серверную валидацию, новое подтверждение, cookie сессии и безопасное продолжение. Первые три используют настоящий JavaScript поставщика, общедоступные тестовые ключи и официальные endpoint Siteverify.

## Быстрый старт

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Требуется Node.js 22.19+, 24.11+ или 26+. После подтверждения `setup` создаёт проверяемую конфигурацию Playwright/CDP, не перезаписывает существующий файл и не устанавливает Jet Browser.

## Агенты и MCP

Официальное имя — `io.github.masakaai/rea-captcha`, запуск без конфигурации: `npx -y rea-captcha mcp --stateless`. Доступно пять инструментов: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` и `captcha_resume`. Первый только читает и анализирует уже имеющиеся у агента данные; остальные четыре сохраняют одну настроенную сессию.

Цикл: `inspect → blocked → handoff → ограниченное ожидание → новая проверка → resume`. Неизвестное значение, неполные данные, тайм-аут или один прогноз OCR никогда не разрешают продолжение.

## Область применения

Только собственные или явно разрешённые процессы. Автоматическое решение интерактивных проверок третьих сторон, создание подписанных поставщиком токенов, перенос учётных данных и скрытый обход защиты не поддерживаются.

[Архитектура](../architecture.md) · [Сценарии](../cases.md) · [Инструменты MCP](../mcp-tools.md) · [Безопасность](../../SECURITY.md) · [Лицензия](../../LICENSE)
