<p align="center"><a href="../../README.md">English</a> · <strong>فارسی</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**تشخیص محلی چالش‌های تأیید و تحویل امن به انسان برای عامل‌های مرورگر.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha مانع گیرکردن عامل‌های مرورگر مانند browser-use در میانهٔ کار به‌خاطر CAPTCHA می‌شود. نشست موجود Playwright/CDP را دوباره استفاده می‌کند؛ در تست‌های مجاز یا صفحات تحت مالکیت، عامل تعامل را خودش انجام می‌دهد و فقط پس از دریافت شاهد تازه از سرور کار را ادامه می‌دهد.

Jet Browser فقط یک آداپتور اختیاری است و وابستگی یا runtime پیش‌فرض نیست. solver میزبانی‌شده، تله‌متری یا ادعای دورزدن مخفی وجود ندارد.

## ماتریس تأیید عامل‌محور

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="فرایند reCAPTCHA" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="فرایند Turnstile" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="فرایند hCaptcha" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>تصویر/متن تحت مالکیت</strong><br>
      <img src="../assets/demos/image-text.gif" alt="فرایند تصویر و متن" width="100%">
    </td>
  </tr>
</table>

هر چهار مورد مسیر کامل عملیات محافظت‌شده را بررسی می‌کنند: تشخیص، تحویل همان نشست، اعتبارسنجی سرور، شاهد تازه، کوکی نشست و ادامهٔ امن. سه مورد نخست از JavaScript واقعی ارائه‌دهنده، کلیدهای تست عمومی و endpointهای Siteverify استفاده می‌کنند.

## شروع سریع

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Node.js 22.19+، 24.11+ یا 26+ لازم است. `setup` پس از تأیید پیکربندی قابل‌بازبینی Playwright/CDP را می‌سازد، فایل موجود را بازنویسی نمی‌کند و Jet Browser را نصب نمی‌کند.

## عامل‌ها و MCP

نام رسمی رجیستری `io.github.masakaai/rea-captcha` و اجرای بدون پیکربندی `npx rea-captcha@0.2.4 mcp --stateless` است. شش ابزار ارائه می‌شود: `captcha_analyze`، `captcha_inspect`، `captcha_complete`، `captcha_handoff`، `captcha_wait` و `captcha_resume`. ابزار `captcha_complete` فقط پس از بررسی سیاست، origin و کلید تست مستند سرویس‌دهنده در مرورگر موجود عمل می‌کند.

چرخهٔ عامل `inspect → agent-action → complete → بررسی تازه → resume` است. مقدار ناشناخته، شاهد ناقص، پایان مهلت یا پیش‌بینی OCR به‌تنهایی اجازهٔ ادامه نمی‌دهد.

## محدوده

فقط برای فرایندهای تحت مالکیت یا صریحاً مجاز. حل خودکار چالش تعاملی شخص ثالث، تولید token امضاشدهٔ ارائه‌دهنده، انتقال اعتبارنامه یا دورزدن stealth خارج از محدوده است.

[معماری](../architecture.md) · [موارد](../cases.md) · [ابزارهای MCP](../mcp-tools.md) · [امنیت](../../SECURITY.md) · [مجوز](../../LICENSE)
