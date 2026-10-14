<p align="center"><a href="../../README.md">English</a> · <strong>العربية</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**اكتشاف محلي لتحديات التحقق وتسليم آمن إلى الإنسان لوكلاء المتصفح.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

يكتشف rea-captcha حواجز التحقق، ويوقف الوكيل مؤقتًا، ويحافظ على جلسة المتصفح الأصلية ليتدخل الإنسان بصورة مرئية، ثم يستأنف المهمة نفسها فقط بعد ظهور دليل نجاح جديد. يتضمن SDK لـ TypeScript وخادم MCP محليًا عبر stdio وتكامل Playwright/CDP وbrowser-use ومهارة Agent متوافقة مع Vercel Skills وOCR محليًا اختياريًا للأصول المصرح بها.

Jet Browser محول اختياري وليس تبعية أو بيئة التشغيل الافتراضية. لا توجد خدمة حل مستضافة أو قياس عن بُعد أو ادعاءات تجاوز خفي.

## مصفوفة التحقق الوكيلية

<p align="center">
  <strong>Google reCAPTCHA v2</strong><br>
  <img src="../assets/demos/recaptcha.gif" alt="مسار reCAPTCHA" width="860">
</p>

<p align="center">
  <strong>Cloudflare Turnstile</strong><br>
  <img src="../assets/demos/turnstile.gif" alt="مسار Turnstile" width="860">
</p>

<p align="center">
  <strong>hCaptcha</strong><br>
  <img src="../assets/demos/hcaptcha.gif" alt="مسار hCaptcha" width="860">
</p>

<p align="center">
  <strong>صورة/نص مملوك</strong><br>
  <img src="../assets/demos/image-text.gif" alt="مسار الصورة والنص" width="860">
</p>

تتحقق الحالات الأربع من المسار المحمي كاملًا: الاكتشاف، وتسليم الجلسة نفسها، والتحقق على الخادم، ودليل نجاح جديد، وملف تعريف ارتباط الجلسة، والاستئناف الآمن. تستخدم الحالات الثلاث الأولى JavaScript الحقيقي للمورد ومفاتيح الاختبار العامة ونقاط Siteverify الرسمية.

## البدء السريع

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

يتطلب Node.js 22.19+ أو 24.11+ أو 26+. ينشئ `setup` بعد التأكيد إعداد Playwright/CDP قابلًا للمراجعة، ولا يستبدل ملفًا موجودًا ولا يثبت Jet Browser.

## الوكلاء وMCP

اسم السجل الرسمي هو `io.github.masakaai/rea-captcha` والتشغيل بلا إعداد هو `npx -y rea-captcha mcp --stateless`. تتوفر خمس أدوات: `captcha_analyze` و`captcha_inspect` و`captcha_handoff` و`captcha_wait` و`captcha_resume`. تحلل الأولى أدلة الصفحة الموجودة لدى الوكيل للقراءة فقط، بينما تحافظ الأدوات الأربع الأخرى على جلسة المتصفح المهيأة نفسها.

دورة الحالة هي `inspect → blocked → handoff → انتظار محدود → تحقق جديد → resume`. لا تسمح القيم المجهولة أو الأدلة الناقصة أو انتهاء المهلة أو توقع OCR وحده بالاستئناف.

## النطاق

للمهام المملوكة أو المصرح بها صراحة فقط. الحل التلقائي لتحديات تفاعلية تخص أطرافًا أخرى، أو إنشاء رموز موقعة من المورد، أو نقل بيانات الاعتماد، أو تجاوز الحماية خارج النطاق.

[البنية](../architecture.md) · [الحالات](../cases.md) · [أدوات MCP](../mcp-tools.md) · [الأمان](../../SECURITY.md) · [الترخيص](../../LICENSE)
