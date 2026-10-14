<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README_zh.md">简体中文</a> ·
  <a href="README_ja.md">日本語</a> ·
  <strong>한국어</strong>
</p>

# rea-captcha

**브라우저 Agent를 위한 로컬 우선 검증 챌린지 감지와 사람 인계.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha)
[![CI](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.masakaai%2Frea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha)
[![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha)
[![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha는 검증 챌린지를 감지하고 Agent를 일시 중지하며, 사람이 직접 처리할 수 있도록 원래 브라우저 세션을 유지합니다. 새로운 통과 증거를 확인한 뒤에만 같은 작업을 재개합니다. TypeScript SDK, 로컬 stdio MCP, Playwright/CDP, browser-use, Vercel Skills 호환 Skill, 허가된 origin 전용 선택적 로컬 OCR을 제공합니다.

> 공식 배포처는 [`masakaai/rea-captcha`](https://github.com/masakaai/rea-captcha)와 npm의 [`rea-captcha`](https://www.npmjs.com/package/rea-captcha)입니다. 호스팅 solver, 텔레메트리, stealth 우회 기능이 없습니다. Jet Browser는 명시적으로 선택하는 선택적 어댑터이며 의존성이나 기본 런타임이 아닙니다.

## 네 가지 실제 검증 사례

| 사례 | 실제 클라이언트 | 검증 경계 | 확인 결과 |
|---|---|---|---|
| Google reCAPTCHA v2 | Google test widget | Google Siteverify | 통과 후 동일 세션 재개 |
| Cloudflare Turnstile | Cloudflare test widget | Cloudflare Siteverify | 통과 후 동일 세션 재개 |
| hCaptcha | hCaptcha test widget | hCaptcha Siteverify | 통과 후 동일 세션 재개 |
| 소유한 이미지/텍스트 | 로컬 폼 | 로컬 서버 | 통과 후 동일 세션 재개 |

<table>
  <tr><td width="50%"><img src="../assets/demos/recaptcha.gif" alt="reCAPTCHA demo" width="100%"></td><td width="50%"><img src="../assets/demos/turnstile.gif" alt="Turnstile demo" width="100%"></td></tr>
  <tr><td width="50%"><img src="../assets/demos/hcaptcha.gif" alt="hCaptcha demo" width="100%"></td><td width="50%"><img src="../assets/demos/image-text.gif" alt="Image text demo" width="100%"></td></tr>
</table>

앞의 세 사례는 공급자 호스팅 JavaScript와 공개된 비프로덕션 테스트 키를 사용하며, 검증 endpoint가 `success: true`를 반환해야 보호된 작업을 승인합니다.

## 빠른 시작

Node.js 22.19+, 24.11+ 또는 26+가 필요합니다.

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

`setup`은 확인 후 검토 가능한 Playwright/CDP 설정을 만들며 기존 파일을 덮어쓰거나 Jet Browser를 설치하지 않습니다.

## Agent / MCP

공식 Registry 이름은 `io.github.masakaai/rea-captcha`이며 무설정 실행은 `npx -y rea-captcha mcp --stateless`입니다. MCP는 `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait`, `captcha_resume` 다섯 도구를 제공합니다. `captcha_analyze`는 Agent가 이미 가진 증거를 읽기 전용으로 분석하고, 나머지 네 도구는 설정된 동일 브라우저 세션을 사용합니다. 입력과 상태 의미는 [MCP tool catalog](../mcp-tools.md)에 있습니다.

상태 흐름은 `inspect → blocked → handoff → bounded wait → fresh verify → resume`입니다. 알 수 없는 값, 누락된 증거, 시간 초과, OCR 예측만으로는 재개하지 않습니다.

## 지원 범위

- reCAPTCHA, hCaptcha, Turnstile, GeeTest, DataDome, PerimeterX, AWS WAF, 이미지/텍스트 및 일반 검증 페이지 증거 감지.
- Playwright `Page`, CDP, browser-use와 명시적으로 구성한 Jet Browser 어댑터.
- npm provenance / Trusted Publishing 및 GitHub OIDC 기반 공식 MCP Registry 게시.

소유하거나 명시적으로 허가된 워크플로에만 사용하십시오. 제3자 대화형 챌린지 자동 완료, 공급자 서명 token 생성, 자격 증명 이동, stealth 우회는 범위 밖입니다.

[Architecture](../architecture.md) · [Cases](../cases.md) · [Validation](../validation.md) · [Security](../../SECURITY.md) · [License](../../LICENSE)

rea-captcha 통합 논의는 [MASAKA Discord](https://discord.gg/8Ybc32NcMt)에서도 할 수 있습니다. 브라우저 프로필, Cookie, challenge token, API key 또는 비공개 페이지 증거를 게시하지 마십시오.
