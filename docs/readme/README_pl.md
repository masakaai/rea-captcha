<p align="center"><a href="../../README.md">English</a> · <strong>Polski</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Lokalne wykrywanie wyzwań weryfikacyjnych i bezpieczne przekazanie człowiekowi dla agentów przeglądarkowych.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha wykrywa bariery weryfikacyjne, wstrzymuje agenta, zachowuje pierwotną sesję przeglądarki do widocznej interwencji człowieka i wznawia to samo zadanie dopiero po uzyskaniu świeżego dowodu powodzenia. Zawiera SDK TypeScript, lokalny serwer MCP stdio, Playwright/CDP, browser-use, Agent Skill zgodny z Vercel Skills oraz opcjonalny lokalny OCR dla autoryzowanych originów.

Jet Browser jest opcjonalnym adapterem, a nie zależnością ani domyślnym runtime. Projekt nie zawiera hostowanego solvera, telemetrii ani obietnic stealth.

## Agentowa macierz weryfikacji

<table>
  <tr><td width="50%"><strong>Google reCAPTCHA v2</strong><br><img src="../assets/demos/recaptcha.gif" alt="Przebieg reCAPTCHA" width="100%"></td><td width="50%"><strong>Cloudflare Turnstile</strong><br><img src="../assets/demos/turnstile.gif" alt="Przebieg Turnstile" width="100%"></td></tr>
  <tr><td width="50%"><strong>hCaptcha</strong><br><img src="../assets/demos/hcaptcha.gif" alt="Przebieg hCaptcha" width="100%"></td><td width="50%"><strong>Własny obraz/tekst</strong><br><img src="../assets/demos/image-text.gif" alt="Przebieg obrazu i tekstu" width="100%"></td></tr>
</table>

Wszystkie cztery przypadki sprawdzają pełny chroniony przebieg: wykrycie, przekazanie tej samej sesji, walidację serwera, świeży dowód, cookie sesji i bezpieczne wznowienie. Pierwsze trzy używają prawdziwego JavaScriptu dostawcy, publicznych danych testowych i oficjalnych endpointów Siteverify.

## Szybki start

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Wymagany jest Node.js 22.19+, 24.11+ lub 26+. Po potwierdzeniu `setup` tworzy możliwą do przejrzenia konfigurację Playwright/CDP, nie nadpisuje istniejących plików i nie instaluje Jet Browser.

## Agenci i MCP

Oficjalna nazwa to `io.github.masakaai/rea-captcha`, a start bez konfiguracji: `npx -y rea-captcha mcp --stateless`. Dostępnych jest pięć narzędzi: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` i `captcha_resume`. Pierwsze analizuje tylko do odczytu dowody już posiadane przez agenta; pozostałe cztery zachowują tę samą skonfigurowaną sesję.

Cykl to `inspect → blocked → handoff → ograniczone oczekiwanie → świeża weryfikacja → resume`. Nieznana wartość, niepełny dowód, timeout ani sama prognoza OCR nigdy nie zezwalają na wznowienie.

## Zakres

Wyłącznie dla własnych lub jawnie autoryzowanych procesów. Automatyczne rozwiązywanie interaktywnych wyzwań stron trzecich, generowanie podpisanych tokenów dostawcy, przenoszenie poświadczeń i obchodzenie zabezpieczeń stealth są poza zakresem.

[Architektura](../architecture.md) · [Przypadki](../cases.md) · [Narzędzia MCP](../mcp-tools.md) · [Bezpieczeństwo](../../SECURITY.md) · [Licencja](../../LICENSE)
