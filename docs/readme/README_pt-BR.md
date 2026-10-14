<p align="center"><a href="../../README.md">English</a> · <strong>Português (Brasil)</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Detecção local de desafios de verificação e transferência humana segura para agentes de navegador.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha detecta barreiras de verificação, pausa o agente, preserva a sessão original do navegador para uma intervenção humana visível e retoma a mesma tarefa somente após obter nova evidência de aprovação. Inclui SDK TypeScript, servidor MCP stdio local, Playwright/CDP, browser-use, um Agent Skill compatível com Vercel Skills e OCR local opcional para origens autorizadas.

Jet Browser é um adaptador opcional, não uma dependência nem o runtime padrão. O projeto não oferece solver hospedado, telemetria ou promessa de evasão stealth.

## Matriz de verificação agêntica

<table>
  <tr><td width="50%"><strong>Google reCAPTCHA v2</strong><br><img src="../assets/demos/recaptcha.gif" alt="Fluxo reCAPTCHA" width="100%"></td><td width="50%"><strong>Cloudflare Turnstile</strong><br><img src="../assets/demos/turnstile.gif" alt="Fluxo Turnstile" width="100%"></td></tr>
  <tr><td width="50%"><strong>hCaptcha</strong><br><img src="../assets/demos/hcaptcha.gif" alt="Fluxo hCaptcha" width="100%"></td><td width="50%"><strong>Imagem/texto próprio</strong><br><img src="../assets/demos/image-text.gif" alt="Fluxo de imagem e texto" width="100%"></td></tr>
</table>

Os quatro casos verificam o fluxo protegido completo: detecção, transferência da mesma sessão, validação no servidor, nova evidência, cookie de sessão e retomada segura. Os três primeiros usam JavaScript real do fornecedor, credenciais públicas de teste e os endpoints Siteverify oficiais.

## Início rápido

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Requer Node.js 22.19+, 24.11+ ou 26+. Após confirmação, `setup` cria uma configuração Playwright/CDP revisável, sem sobrescrever arquivos existentes nem instalar o Jet Browser.

## Agentes e MCP

O nome oficial é `io.github.masakaai/rea-captcha`; a inicialização sem configuração é `npx -y rea-captcha mcp --stateless`. Há cinco ferramentas: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` e `captcha_resume`. A primeira analisa em modo somente leitura evidências já obtidas pelo agente; as outras quatro mantêm a mesma sessão configurada.

O ciclo é `inspect → blocked → handoff → espera limitada → nova verificação → resume`. Valor desconhecido, evidência incompleta, tempo esgotado ou uma previsão OCR isolada nunca autorizam a retomada.

## Escopo

Apenas para fluxos próprios ou explicitamente autorizados. Resolver automaticamente desafios interativos de terceiros, gerar tokens assinados pelo fornecedor, mover credenciais ou contornar proteções está fora do escopo.

[Arquitetura](../architecture.md) · [Casos](../cases.md) · [Ferramentas MCP](../mcp-tools.md) · [Segurança](../../SECURITY.md) · [Licença](../../LICENSE)
