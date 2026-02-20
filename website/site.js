/* PHANTOM Website — Interactive Scripts */
(function () {
  'use strict';

  // ---------- Matrix Rain ----------
  const canvas = document.getElementById('matrix-rain');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, columns, drops;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      columns = Math.floor(w / 18);
      drops = Array.from({ length: columns }, () => Math.random() * h / 18);
    }

    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトPHANTOM01'.split('');

    function draw() {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00FF41';
      ctx.font = '14px "JetBrains Mono", monospace';

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 18, drops[i] * 18);
        if (drops[i] * 18 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    setInterval(draw, 50);
  }

  // ---------- Copy to Clipboard ----------
  const copyBtn = document.getElementById('copy-btn');
  const installCmd = document.getElementById('install-cmd');
  const copyState = document.getElementById('copy-state');

  if (copyBtn && installCmd) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(installCmd.textContent);
        copyBtn.textContent = 'Copied!';
        if (copyState) copyState.textContent = '✓ Command copied to clipboard';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          if (copyState) copyState.textContent = '';
        }, 2000);
      } catch {
        copyBtn.textContent = 'Failed';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
      }
    });
  }

  // ---------- Counter Animation ----------
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current;
        }, 40);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  // ---------- Terminal Typing Demo ----------
  const typedCmd = document.getElementById('typed-cmd');
  const terminalOutput = document.getElementById('terminal-output');

  if (typedCmd && terminalOutput) {
    const command = 'npx @phantom-pm/cli@latest boot';
    const outputLines = [
      '',
      '<span class="dim">[Initializing Phantom OS 1-Click Sequence...]</span>',
      '',
      '<span class="green bold">  ✓ Target Directory: </span>  <span class="dim">~/.phantom</span>',
      '<span class="green bold">  ✓ Downloading Matrix UI from GitHub...</span>',
      '<span class="cyan bold">  ✓ Extracting assets...</span>',
      '<span class="green bold">  ✓ Phantom OS Matrix UI successfully booted to ~/.phantom/web</span>',
      '',
      '<span class="orange bold">  Next Steps:</span>',
      '<span class="dim">  Run "npx @phantom-pm/cli@latest server" to activate the Matrix Interface</span>',
    ];

    let charIndex = 0;
    let lineIndex = 0;
    let started = false;

    function typeCommand() {
      if (charIndex < command.length) {
        typedCmd.textContent += command[charIndex];
        charIndex++;
        setTimeout(typeCommand, 50 + Math.random() * 40);
      } else {
        setTimeout(showOutput, 400);
      }
    }

    function showOutput() {
      // Hide cursor
      const cursor = terminalOutput.querySelector('.cursor');
      if (cursor) cursor.style.display = 'none';

      if (lineIndex < outputLines.length) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.innerHTML = outputLines[lineIndex];
        terminalOutput.appendChild(line);
        lineIndex++;
        setTimeout(showOutput, 80 + Math.random() * 60);
      }
    }

    // Start typing when terminal is visible
    const terminalObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          setTimeout(typeCommand, 800);
          terminalObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    terminalObserver.observe(terminalOutput.closest('.terminal-demo'));
  }
})();
