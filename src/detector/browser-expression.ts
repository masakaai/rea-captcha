export const browserObservationExpression = `(() => {
  const root = document.documentElement;
  const html = root ? root.outerHTML.slice(0, 500000) : '';
  const text = document.body ? document.body.innerText.slice(0, 100000) : '';
  const runtimeSignals = [];
  if (document.querySelector('[data-captcha-status="passed"], .captcha-success, .verification-success')) runtimeSignals.push('captcha-success');
  if (document.querySelector('[data-captcha-status="failed"], .captcha-error, .verification-error')) runtimeSignals.push('captcha-failed');
  return JSON.stringify({ url: location.href, title: document.title, html, text, runtimeSignals, capturedAt: new Date().toISOString() });
})()`;
