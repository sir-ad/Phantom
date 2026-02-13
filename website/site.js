(() => {
  const cmd = document.getElementById('install-cmd');
  const button = document.getElementById('copy-btn');
  const state = document.getElementById('copy-state');
  if (!cmd || !button || !state) return;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cmd.textContent || '');
      state.textContent = 'Install command copied.';
    } catch {
      state.textContent = 'Copy failed. Select and copy manually.';
    }
  });
})();
