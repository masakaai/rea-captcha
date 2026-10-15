<p align="center"><a href="../../README.md">English</a> · <strong>العربية</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**اكتشاف محلي لتحديات التحقق وتسليم آمن إلى الإنسان لوكلاء المتصفح.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

يمنع rea-captcha وكلاء المتصفح مثل browser-use من التعطل في منتصف المهمة بسبب CAPTCHA. يعيد استخدام جلسة Playwright/CDP الموجودة، وفي الاختبارات المصرح بها أو الصفحات المملوكة ينفذ الوكيل التفاعل بنفسه ولا يتابع المهمة إلا بعد دليل نجاح جديد من الخادم.

Jet Browser محول اختياري وليس تبعية أو بيئة التشغيل الافتراضية. لا توجد خدمة حل مستضافة أو قياس عن بُعد أو ادعاءات تجاوز خفي.

## مصفوفة التحقق الوكيلية

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="مسار reCAPTCHA" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="مسار Turnstile" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="مسار hCaptcha" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>صورة/نص مملوك</strong><br>
      <img src="../assets/demos/image-text.gif" alt="مسار الصورة والنص" width="100%">
    </td>
  </tr>
</table>

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

اسم السجل الرسمي هو `io.github.masakaai/rea-captcha` والتشغيل بلا إعداد هو `npx rea-captcha@0.2.3 mcp --stateless`. تتوفر ست أدوات: `captcha_analyze` و`captcha_inspect` و`captcha_complete` و`captcha_handoff` و`captcha_wait` و`captcha_resume`. لا تعمل `captcha_complete` في المتصفح الحالي إلا بعد التحقق من السياسة والأصل ومفتاح الاختبار الموثق لدى المزوّد.

دورة الوكيل هي `inspect → agent-action → complete → تحقق جديد → resume`. لا تسمح القيم المجهولة أو الأدلة الناقصة أو انتهاء المهلة أو توقع OCR وحده بالاستئناف.

## النطاق

للمهام المملوكة أو المصرح بها صراحة فقط. الحل التلقائي لتحديات تفاعلية تخص أطرافًا أخرى، أو إنشاء رموز موقعة من المورد، أو نقل بيانات الاعتماد، أو تجاوز الحماية خارج النطاق.

[البنية](../architecture.md) · [الحالات](../cases.md) · [أدوات MCP](../mcp-tools.md) · [الأمان](../../SECURITY.md) · [الترخيص](../../LICENSE)
