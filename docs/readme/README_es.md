<p align="center"><a href="../../README.md">English</a> · <strong>Español</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Detección local de desafíos de verificación y traspaso seguro a una persona para agentes de navegador.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha detecta barreras de verificación, pausa al agente, conserva la sesión original para una intervención humana visible y reanuda la misma tarea solo después de obtener evidencia nueva de aprobación. Incluye SDK de TypeScript, servidor MCP stdio local, Playwright/CDP, browser-use, un Agent Skill compatible con Vercel Skills y OCR local opcional para orígenes autorizados.

Jet Browser es un adaptador opcional: no es dependencia ni runtime predeterminado. El proyecto no ofrece solver alojado, telemetría ni promesas de evasión.

## Matriz de verificación agéntica

<p align="center">
  <strong>Google reCAPTCHA v2</strong><br>
  <img src="../assets/demos/recaptcha.gif" alt="Flujo de reCAPTCHA" width="860">
</p>

<p align="center">
  <strong>Cloudflare Turnstile</strong><br>
  <img src="../assets/demos/turnstile.gif" alt="Flujo de Turnstile" width="860">
</p>

<p align="center">
  <strong>hCaptcha</strong><br>
  <img src="../assets/demos/hcaptcha.gif" alt="Flujo de hCaptcha" width="860">
</p>

<p align="center">
  <strong>Imagen/texto propio</strong><br>
  <img src="../assets/demos/image-text.gif" alt="Flujo de imagen y texto" width="860">
</p>

Los cuatro casos verifican el recorrido protegido completo: detección, traspaso de la misma sesión, validación del servidor, evidencia nueva, cookie de sesión y reanudación segura. Los tres primeros usan JavaScript real del proveedor, credenciales públicas de prueba y sus endpoints Siteverify.

## Inicio rápido

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Requiere Node.js 22.19+, 24.11+ o 26+. `setup` crea, previa confirmación, una configuración Playwright/CDP revisable; no sobrescribe archivos ni instala Jet Browser.

## Agentes y MCP

El nombre oficial es `io.github.masakaai/rea-captcha`; el inicio sin configuración es `npx -y rea-captcha mcp --stateless`. Expone cinco herramientas: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` y `captcha_resume`. La primera analiza en modo de solo lectura evidencia que el agente ya posee; las otras cuatro mantienen una única sesión configurada.

El ciclo es `inspect → blocked → handoff → espera acotada → verificación nueva → resume`. Datos desconocidos, evidencia incompleta, tiempos agotados o una predicción OCR aislada nunca autorizan la reanudación.

## Alcance

Solo para flujos propios o expresamente autorizados. Resolver automáticamente desafíos interactivos de terceros, generar tokens firmados por proveedores, mover credenciales o evadir protecciones queda fuera de alcance.

[Arquitectura](../architecture.md) · [Casos](../cases.md) · [Herramientas MCP](../mcp-tools.md) · [Seguridad](../../SECURITY.md) · [Licencia](../../LICENSE)
