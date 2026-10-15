<p align="center"><a href="../../README.md">English</a> · <strong>Deutsch</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Lokale Erkennung von Verifizierungsaufgaben und sichere Übergabe an Menschen für Browser-Agenten.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha verhindert, dass Browser-Agenten wie browser-use mitten in einer Aufgabe an einem CAPTCHA hängen bleiben. Es verwendet die bereits vorhandene Playwright/CDP-Sitzung; in autorisierten Test- oder eigenen Umgebungen führt der Agent die Interaktion selbst aus und setzt die Aufgabe erst nach einem frischen serverseitigen Erfolgsnachweis fort.

Jet Browser ist ein optionaler Adapter, keine Abhängigkeit und keine Standardlaufzeit. Es gibt keinen gehosteten Solver, keine Telemetrie und keine Stealth-Versprechen.

## Agentische Verifizierungsmatrix

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="reCAPTCHA-Ablauf" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Turnstile-Ablauf" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="hCaptcha-Ablauf" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Eigene Bild/Text-Prüfung</strong><br>
      <img src="../assets/demos/image-text.gif" alt="Bild-Text-Ablauf" width="100%">
    </td>
  </tr>
</table>

Alle vier Fälle prüfen den vollständigen geschützten Ablauf: Erkennung, Übergabe derselben Sitzung, serverseitige Validierung, neuer Erfolgsnachweis, Sitzungscookie und sichere Fortsetzung. Die ersten drei verwenden echte Anbieter-JavaScript-Clients, öffentliche Testschlüssel und deren Siteverify-Endpunkte.

## Schnellstart

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Node.js 22.19+, 24.11+ oder 26+ ist erforderlich. `setup` erstellt nach Bestätigung eine überprüfbare Playwright/CDP-Konfiguration, überschreibt keine vorhandene Datei und installiert Jet Browser nicht.

## Agenten und MCP

Der Registry-Name lautet `io.github.masakaai/rea-captcha`; der konfigurationsfreie Start ist `npx rea-captcha@0.2.3 mcp --stateless`. Sechs Werkzeuge werden angeboten: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait` und `captcha_resume`. `captcha_complete` bedient den vorhandenen Browser nur nach Prüfung von Richtlinie, Origin und dokumentiertem Anbieter-Testschlüssel.

Der Agent-Ablauf ist `inspect → agent-action → complete → frische Prüfung → resume`. Fehlende oder ungültige Nachweise, Zeitüberschreitungen und OCR-Vorhersagen allein geben die Fortsetzung nicht frei.

## Geltungsbereich

Nur für eigene oder ausdrücklich autorisierte Abläufe. Automatisches Lösen interaktiver Prüfungen Dritter, Erzeugen signierter Anbieter-Tokens, Übertragen von Zugangsdaten und Stealth-Umgehung gehören nicht zum Projekt.

[Architektur](../architecture.md) · [Fälle](../cases.md) · [MCP-Werkzeuge](../mcp-tools.md) · [Sicherheit](../../SECURITY.md) · [Lizenz](../../LICENSE)
