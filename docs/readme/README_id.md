<p align="center"><a href="../../README.md">English</a> · <strong>Bahasa Indonesia</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Deteksi tantangan verifikasi yang mengutamakan lokal dan serah-terima manusia yang aman untuk agen browser.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha mencegah agen browser seperti browser-use berhenti di tengah tugas karena CAPTCHA. Ia memakai kembali sesi Playwright/CDP yang sudah dimiliki agen; pada pengujian yang diizinkan atau halaman milik sendiri, agen menyelesaikan interaksi dan hanya melanjutkan setelah ada bukti server yang baru.

Jet Browser hanyalah adaptor opsional, bukan dependensi atau runtime bawaan. Tidak ada solver ter-host, telemetri, atau klaim pengelakan stealth.

## Matriks verifikasi agentic

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="Alur reCAPTCHA" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Alur Turnstile" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="Alur hCaptcha" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Gambar/teks milik sendiri</strong><br>
      <img src="../assets/demos/image-text.gif" alt="Alur gambar dan teks" width="100%">
    </td>
  </tr>
</table>

Keempat kasus memverifikasi alur terlindungi secara lengkap: deteksi, serah-terima sesi yang sama, validasi server, bukti baru, cookie sesi, dan pelanjutan yang aman. Tiga kasus pertama menggunakan JavaScript vendor nyata, kredensial pengujian publik, dan endpoint Siteverify resmi.

## Mulai cepat

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Memerlukan Node.js 22.19+, 24.11+, atau 26+. Setelah dikonfirmasi, `setup` membuat konfigurasi Playwright/CDP yang dapat ditinjau, tanpa menimpa berkas yang ada atau memasang Jet Browser.

## Agen dan MCP

Nama Registry resmi adalah `io.github.masakaai/rea-captcha`; peluncuran tanpa konfigurasi adalah `npx rea-captcha@0.3.0 mcp --stateless`. Ada enam alat: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait`, dan `captcha_resume`. `captcha_complete` hanya bertindak di browser yang ada setelah memeriksa kebijakan, origin, dan kunci uji provider yang terdokumentasi.

Siklus agennya adalah `inspect → agent-action → complete → verifikasi baru → resume`. Nilai yang tidak dikenal, bukti tidak lengkap, timeout, atau prediksi OCR saja tidak pernah mengizinkan pelanjutan.

## Cakupan

Hanya untuk alur yang dimiliki atau diizinkan secara eksplisit. Penyelesaian otomatis tantangan interaktif pihak ketiga, pembuatan token bertanda tangan vendor, pemindahan kredensial, dan pengelakan stealth berada di luar cakupan.

[Arsitektur](../architecture.md) · [Kasus](../cases.md) · [Alat MCP](../mcp-tools.md) · [Keamanan](../../SECURITY.md) · [Lisensi](../../LICENSE)
