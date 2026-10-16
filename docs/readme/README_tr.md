<p align="center"><a href="../../README.md">English</a> · <strong>Türkçe</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Tarayıcı ajanları için yerel öncelikli doğrulama engeli algılama ve güvenli insan devri.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha, browser-use gibi tarayıcı ajanlarının görev ortasında CAPTCHA nedeniyle takılı kalmasını önler. Ajanın mevcut Playwright/CDP oturumunu yeniden kullanır; yetkili testlerde veya sahip olunan sayfalarda etkileşimi ajan tamamlar ve yalnızca yeni sunucu kanıtından sonra göreve devam eder.

Jet Browser isteğe bağlı bir adaptördür; bağımlılık veya varsayılan runtime değildir. Barındırılan solver, telemetri ya da stealth atlatma iddiası yoktur.

## Agentic doğrulama matrisi

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="reCAPTCHA akışı" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Turnstile akışı" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="hCaptcha akışı" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Sahip olunan görüntü/metin</strong><br>
      <img src="../assets/demos/image-text.gif" alt="Görüntü ve metin akışı" width="100%">
    </td>
  </tr>
</table>

Dört vaka da korumalı akışın tamamını doğrular: algılama, aynı oturumun devri, sunucu doğrulaması, yeni kanıt, oturum çerezi ve güvenli sürdürme. İlk üçü gerçek sağlayıcı JavaScript'i, herkese açık test kimlik bilgilerini ve resmi Siteverify endpointlerini kullanır.

## Hızlı başlangıç

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Node.js 22.19+, 24.11+ veya 26+ gerekir. `setup`, onaydan sonra incelenebilir bir Playwright/CDP yapılandırması oluşturur; mevcut dosyayı değiştirmez ve Jet Browser kurmaz.

## Ajanlar ve MCP

Resmî ad `io.github.masakaai/rea-captcha`, yapılandırmasız başlatma komutu `npx rea-captcha@0.3.0 mcp --stateless` şeklindedir. Altı araç sunulur: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait` ve `captcha_resume`. `captcha_complete`, politika, origin ve belgelenmiş sağlayıcı test anahtarı doğrulandıktan sonra mevcut tarayıcıda işlem yapar.

Ajan döngüsü `inspect → agent-action → complete → yeni doğrulama → resume` şeklindedir. Bilinmeyen değerler, eksik kanıt, timeout veya tek başına OCR tahmini devam izni vermez.

## Kapsam

Yalnızca sahip olunan veya açıkça yetkilendirilmiş akışlar içindir. Üçüncü taraf etkileşimli zorluklarını otomatik çözmek, sağlayıcı imzalı token üretmek, kimlik bilgisi taşımak veya stealth koruma atlatmak kapsam dışıdır.

[Mimari](../architecture.md) · [Vakalar](../cases.md) · [MCP araçları](../mcp-tools.md) · [Güvenlik](../../SECURITY.md) · [Lisans](../../LICENSE)
