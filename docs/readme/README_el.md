<p align="center"><a href="../../README.md">English</a> · <strong>Ελληνικά</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Τοπικός εντοπισμός προκλήσεων επαλήθευσης και ασφαλής παράδοση σε άνθρωπο για browser agents.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

Το rea-captcha εντοπίζει φραγμούς επαλήθευσης, παύει τον agent, διατηρεί την αρχική συνεδρία για ορατή ανθρώπινη παρέμβαση και συνεχίζει την ίδια εργασία μόνο μετά από νέα ένδειξη επιτυχίας. Περιλαμβάνει TypeScript SDK, τοπικό stdio MCP, Playwright/CDP, browser-use, Agent Skill συμβατό με Vercel Skills και προαιρετικό τοπικό OCR για εξουσιοδοτημένα origins.

Το Jet Browser είναι προαιρετικός adapter, όχι εξάρτηση ή προεπιλεγμένο runtime. Δεν υπάρχει φιλοξενούμενος solver, τηλεμετρία ή υπόσχεση stealth παράκαμψης.

## Agentic verification matrix

<p align="center">
  <strong>Google reCAPTCHA v2</strong><br>
  <img src="../assets/demos/recaptcha.gif" alt="Ροή reCAPTCHA" width="860">
</p>

<p align="center">
  <strong>Cloudflare Turnstile</strong><br>
  <img src="../assets/demos/turnstile.gif" alt="Ροή Turnstile" width="860">
</p>

<p align="center">
  <strong>hCaptcha</strong><br>
  <img src="../assets/demos/hcaptcha.gif" alt="Ροή hCaptcha" width="860">
</p>

<p align="center">
  <strong>Ιδιόκτητη εικόνα/κείμενο</strong><br>
  <img src="../assets/demos/image-text.gif" alt="Ροή εικόνας και κειμένου" width="860">
</p>

Και οι τέσσερις περιπτώσεις επαληθεύουν ολόκληρη την προστατευμένη ροή: εντοπισμό, παράδοση της ίδιας συνεδρίας, server validation, νέα ένδειξη επιτυχίας, session cookie και ασφαλή συνέχιση. Οι τρεις πρώτες χρησιμοποιούν πραγματικό JavaScript παρόχου, δημόσια test keys και τα επίσημα Siteverify endpoints.

## Γρήγορη εκκίνηση

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Απαιτείται Node.js 22.19+, 24.11+ ή 26+. Το `setup` δημιουργεί μετά από επιβεβαίωση ελέγξιμη ρύθμιση Playwright/CDP, χωρίς αντικατάσταση υπάρχοντος αρχείου ή εγκατάσταση Jet Browser.

## Agents και MCP

Το επίσημο όνομα είναι `io.github.masakaai/rea-captcha` και η εκκίνηση χωρίς ρύθμιση είναι `npx -y rea-captcha mcp --stateless`. Παρέχονται πέντε εργαλεία: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait` και `captcha_resume`. Το πρώτο αναλύει μόνο για ανάγνωση στοιχεία που ήδη έχει ο agent· τα άλλα τέσσερα διατηρούν την ίδια ρυθμισμένη συνεδρία.

Ο κύκλος είναι `inspect → blocked → handoff → οριοθετημένη αναμονή → νέα επαλήθευση → resume`. Άγνωστη τιμή, ελλιπή στοιχεία, timeout ή μεμονωμένη πρόβλεψη OCR δεν επιτρέπουν συνέχιση.

## Πεδίο χρήσης

Μόνο για ιδιόκτητες ή ρητά εξουσιοδοτημένες ροές. Η αυτόματη επίλυση διαδραστικών προκλήσεων τρίτων, η δημιουργία υπογεγραμμένων provider tokens, η μεταφορά διαπιστευτηρίων και η stealth παράκαμψη είναι εκτός πεδίου.

[Αρχιτεκτονική](../architecture.md) · [Περιπτώσεις](../cases.md) · [Εργαλεία MCP](../mcp-tools.md) · [Ασφάλεια](../../SECURITY.md) · [Άδεια](../../LICENSE)
