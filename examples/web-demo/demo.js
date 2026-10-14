const form = document.querySelector('form[data-provider]');
const status = document.querySelector('[data-status]');

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const provider = form.dataset.provider;
  status.textContent = 'Validating with the server…';
  const response = await fetch(`/verify/${encodeURIComponent(provider)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(form))
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    status.textContent = `Rejected: ${(result.errors ?? ['unknown-error']).join(', ')}`;
    return;
  }
  window.location.assign(`/passed?case=${encodeURIComponent(provider)}`);
});
