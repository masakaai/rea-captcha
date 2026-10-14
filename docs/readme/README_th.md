<p align="center"><a href="../../README.md">English</a> · <strong>ไทย</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**ตรวจจับด่านยืนยันแบบ local-first และส่งต่อให้มนุษย์อย่างปลอดภัยสำหรับ browser agent**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha ตรวจพบด่านยืนยัน หยุด agent ชั่วคราว เก็บ browser session เดิมไว้ให้มนุษย์เข้ามาดำเนินการในหน้าต่างที่มองเห็นได้ และทำงานเดิมต่อเมื่อพบหลักฐานผ่านใหม่เท่านั้น โครงการมี TypeScript SDK, local stdio MCP, Playwright/CDP, browser-use, Agent Skill ที่รองรับ Vercel Skills และ local OCR แบบเลือกใช้สำหรับ origin ที่ได้รับอนุญาต

Jet Browser เป็น adapter เสริม ไม่ใช่ dependency หรือ runtime เริ่มต้น ไม่มี hosted solver, telemetry หรือคำกล่าวอ้างเรื่องการหลบเลี่ยงแบบ stealth

## เมทริกซ์การยืนยันแบบ Agentic

<table>
  <tr><td width="50%"><strong>Google reCAPTCHA v2</strong><br><img src="../assets/demos/recaptcha.gif" alt="ขั้นตอน reCAPTCHA" width="100%"></td><td width="50%"><strong>Cloudflare Turnstile</strong><br><img src="../assets/demos/turnstile.gif" alt="ขั้นตอน Turnstile" width="100%"></td></tr>
  <tr><td width="50%"><strong>hCaptcha</strong><br><img src="../assets/demos/hcaptcha.gif" alt="ขั้นตอน hCaptcha" width="100%"></td><td width="50%"><strong>รูปภาพ/ข้อความที่เป็นเจ้าของ</strong><br><img src="../assets/demos/image-text.gif" alt="ขั้นตอนรูปภาพและข้อความ" width="100%"></td></tr>
</table>

ทั้งสี่กรณีตรวจสอบเส้นทางที่ได้รับการป้องกันครบถ้วน ได้แก่ การตรวจพบ การส่งต่อ session เดิม การตรวจสอบฝั่ง server หลักฐานใหม่ session cookie และการทำงานต่ออย่างปลอดภัย สามกรณีแรกใช้ JavaScript จริงของผู้ให้บริการ ข้อมูลทดสอบสาธารณะ และ Siteverify endpoint อย่างเป็นทางการ

## เริ่มต้นอย่างรวดเร็ว

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

ต้องใช้ Node.js 22.19+, 24.11+ หรือ 26+ หลังการยืนยัน `setup` จะสร้างการตั้งค่า Playwright/CDP ที่ตรวจทานได้ โดยไม่เขียนทับไฟล์เดิมและไม่ติดตั้ง Jet Browser

## Agent และ MCP

ชื่อทางการคือ `io.github.masakaai/rea-captcha` และคำสั่งเริ่มต้นแบบไม่ต้องตั้งค่าคือ `npx -y rea-captcha mcp --stateless` มีเครื่องมือห้ารายการ: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` และ `captcha_resume` รายการแรกอ่านและวิเคราะห์หลักฐานที่ agent มีอยู่แล้ว ส่วนอีกสี่รายการรักษา browser session ที่ตั้งค่าไว้ให้เป็น session เดียวกัน

วงจรคือ `inspect → blocked → handoff → รอแบบมีขอบเขต → ตรวจสอบใหม่ → resume` ค่าที่ไม่ทราบ หลักฐานไม่ครบ timeout หรือผลคาดการณ์ OCR เพียงอย่างเดียวไม่อนุญาตให้ทำงานต่อ

## ขอบเขต

ใช้เฉพาะ workflow ที่เป็นเจ้าของหรือได้รับอนุญาตอย่างชัดเจน การแก้ interactive challenge ของบุคคลที่สามโดยอัตโนมัติ การสร้าง token ที่ผู้ให้บริการลงนาม การย้าย credential และการหลบเลี่ยง stealth อยู่นอกขอบเขต

[สถาปัตยกรรม](../architecture.md) · [กรณีทดสอบ](../cases.md) · [เครื่องมือ MCP](../mcp-tools.md) · [ความปลอดภัย](../../SECURITY.md) · [สัญญาอนุญาต](../../LICENSE)
