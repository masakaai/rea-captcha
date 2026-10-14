<p align="center"><a href="../../README.md">English</a> · <strong>Tiếng Việt</strong> · <a href="README_zh.md">简体中文</a></p>

# rea-captcha

**Phát hiện thử thách xác minh ưu tiên cục bộ và bàn giao an toàn cho con người dành cho browser agent.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-rea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha) [![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha) [![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)

rea-captcha giúp các browser agent như browser-use không bị kẹt giữa tác vụ vì CAPTCHA. Công cụ dùng lại phiên Playwright/CDP mà agent đang có; trong môi trường thử nghiệm được phép hoặc trang thuộc sở hữu, agent tự hoàn thành tương tác và chỉ tiếp tục khi có bằng chứng mới từ máy chủ.

Jet Browser chỉ là adapter tùy chọn, không phải dependency hay runtime mặc định. Không có solver được lưu trữ, telemetry hoặc cam kết né tránh stealth.

## Ma trận xác minh agentic

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Google reCAPTCHA v2</strong><br>
      <img src="../assets/demos/recaptcha.gif" alt="Luồng reCAPTCHA" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Cloudflare Turnstile</strong><br>
      <img src="../assets/demos/turnstile.gif" alt="Luồng Turnstile" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>hCaptcha</strong><br>
      <img src="../assets/demos/hcaptcha.gif" alt="Luồng hCaptcha" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>Ảnh/văn bản sở hữu</strong><br>
      <img src="../assets/demos/image-text.gif" alt="Luồng ảnh và văn bản" width="100%">
    </td>
  </tr>
</table>

Cả bốn trường hợp đều kiểm tra toàn bộ luồng được bảo vệ: phát hiện, bàn giao cùng phiên, xác minh phía máy chủ, bằng chứng mới, cookie phiên và tiếp tục an toàn. Ba trường hợp đầu dùng JavaScript thật của nhà cung cấp, thông tin thử nghiệm công khai và endpoint Siteverify chính thức.

## Bắt đầu nhanh

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
npx skills add masakaai/rea-captcha --skill rea-captcha
```

Cần Node.js 22.19+, 24.11+ hoặc 26+. Sau khi xác nhận, `setup` tạo cấu hình Playwright/CDP có thể kiểm tra, không ghi đè tệp hiện có và không cài Jet Browser.

## Agent và MCP

Tên Registry chính thức là `io.github.masakaai/rea-captcha`; lệnh chạy không cần cấu hình là `npx -y rea-captcha mcp --stateless`. Có sáu công cụ: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait` và `captcha_resume`. `captcha_complete` chỉ thao tác trên browser hiện có sau khi kiểm tra policy, origin và test key có tài liệu của nhà cung cấp.

Chu trình của agent là `inspect → agent-action → complete → xác minh mới → resume`. Giá trị không rõ, bằng chứng thiếu, timeout hoặc chỉ một dự đoán OCR không bao giờ cho phép tiếp tục.

## Phạm vi

Chỉ dành cho quy trình do bạn sở hữu hoặc được cho phép rõ ràng. Tự động giải thử thách tương tác của bên thứ ba, tạo token do nhà cung cấp ký, chuyển thông tin đăng nhập hoặc né tránh stealth nằm ngoài phạm vi.

[Kiến trúc](../architecture.md) · [Trường hợp](../cases.md) · [Công cụ MCP](../mcp-tools.md) · [Bảo mật](../../SECURITY.md) · [Giấy phép](../../LICENSE)
