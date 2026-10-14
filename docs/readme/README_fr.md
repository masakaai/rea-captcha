<p align="center"><a href="../../README.md">English</a> · <strong>Français</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Détection locale des défis de vérification et transfert humain sûr pour les agents de navigation.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha détecte les barrières de vérification, met l'agent en pause, conserve la session d'origine pour une intervention humaine visible et reprend la même tâche uniquement après une nouvelle preuve de réussite. Le projet fournit un SDK TypeScript, un serveur MCP stdio local, Playwright/CDP, browser-use, un Agent Skill compatible Vercel Skills et un OCR local facultatif réservé aux origines autorisées.

Jet Browser est un adaptateur facultatif, ni dépendance ni runtime par défaut. Aucun solver hébergé, aucune télémétrie et aucune promesse de contournement furtif.

## Matrice de vérification agentique

<p align="center">
  <strong>Google reCAPTCHA v2</strong><br>
  <img src="../assets/demos/recaptcha.gif" alt="Flux reCAPTCHA" width="860">
</p>

<p align="center">
  <strong>Cloudflare Turnstile</strong><br>
  <img src="../assets/demos/turnstile.gif" alt="Flux Turnstile" width="860">
</p>

<p align="center">
  <strong>hCaptcha</strong><br>
  <img src="../assets/demos/hcaptcha.gif" alt="Flux hCaptcha" width="860">
</p>

<p align="center">
  <strong>Image/texte propriétaire</strong><br>
  <img src="../assets/demos/image-text.gif" alt="Flux image et texte" width="860">
</p>

Les quatre cas vérifient le parcours protégé complet : détection, transfert de la même session, validation serveur, nouvelle preuve, cookie de session et reprise sûre. Les trois premiers utilisent le JavaScript réel des fournisseurs, leurs identifiants de test publics et leurs endpoints Siteverify.

## Démarrage rapide

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Node.js 22.19+, 24.11+ ou 26+ est requis. Après confirmation, `setup` crée une configuration Playwright/CDP vérifiable, sans écraser de fichier ni installer Jet Browser.

## Agents et MCP

Le nom officiel est `io.github.masakaai/rea-captcha` et le lancement sans configuration est `npx -y rea-captcha mcp --stateless`. Cinq outils sont exposés : `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` et `captcha_resume`. Le premier analyse en lecture seule les preuves déjà détenues par l'agent ; les quatre autres conservent la même session configurée.

Le cycle est `inspect → blocked → handoff → attente bornée → nouvelle vérification → resume`. Une valeur inconnue, une preuve incomplète, un délai dépassé ou une prédiction OCR seule n'autorise jamais la reprise.

## Périmètre

Réservé aux flux possédés ou explicitement autorisés. La résolution automatique de défis interactifs tiers, la génération de jetons signés par un fournisseur, le transfert d'identifiants et le contournement furtif sont hors périmètre.

[Architecture](../architecture.md) · [Cas](../cases.md) · [Outils MCP](../mcp-tools.md) · [Sécurité](../../SECURITY.md) · [Licence](../../LICENSE)
