<p align="center"><a href="../../README.md">English</a> · <strong>Italiano</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Rilevamento locale delle verifiche e passaggio sicuro a una persona per browser agent.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha evita che agent browser come browser-use rimangano bloccati a metà attività da un CAPTCHA. Riutilizza la sessione Playwright/CDP già aperta; nei test autorizzati o nelle pagine di proprietà, l'agent completa direttamente l'interazione e continua solo dopo una nuova prova lato server.

Jet Browser è un adattatore opzionale, non una dipendenza o il runtime predefinito. Non sono presenti solver ospitati, telemetria o promesse di elusione stealth.

## Matrice di verifica agentica

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="Flusso reCAPTCHA" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Flusso Turnstile" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="Flusso hCaptcha" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Immagine/testo proprietario</strong><br>
      <img src="../assets/demos/image-text.gif" alt="Flusso immagine e testo" width="100%">
    </td>
  </tr>
</table>

I quattro casi verificano l'intero percorso protetto: rilevamento, passaggio della stessa sessione, validazione server, nuova prova, cookie di sessione e ripresa sicura. I primi tre usano JavaScript reale dei provider, credenziali pubbliche di test e i rispettivi endpoint Siteverify.

## Avvio rapido

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Richiede Node.js 22.19+, 24.11+ o 26+. Dopo conferma, `setup` crea una configurazione Playwright/CDP verificabile, senza sovrascrivere file né installare Jet Browser.

## Agent e MCP

Il nome ufficiale è `io.github.masakaai/rea-captcha`; l'avvio senza configurazione è `npx -y rea-captcha mcp --stateless`. Espone sei strumenti: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait` e `captcha_resume`. `captcha_complete` agisce nel browser esistente solo dopo aver verificato policy, origin e chiave di test documentata del provider.

Il ciclo agent è `inspect → agent-action → complete → nuova verifica → resume`. Valori sconosciuti, prove incomplete, timeout o una sola previsione OCR non autorizzano mai la ripresa.

## Ambito

Solo per flussi propri o esplicitamente autorizzati. Risolvere automaticamente verifiche interattive di terzi, generare token firmati dai provider, trasferire credenziali o aggirare protezioni è fuori ambito.

[Architettura](../architecture.md) · [Casi](../cases.md) · [Strumenti MCP](../mcp-tools.md) · [Sicurezza](../../SECURITY.md) · [Licenza](../../LICENSE)
