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
    const command = 'phantom agents scan --json';
    const outputLines = [
      '',
      '<span class="dim">[scanning system for AI agents...]</span>',
      '',
      '<span class="green bold">  ✓ Claude Code</span>        <span class="dim">confidence: 95%  status: active</span>',
      '<span class="green bold">  ✓ Cursor</span>             <span class="dim">confidence: 92%  status: active</span>',
      '<span class="cyan bold">  ✓ Antigravity</span>        <span class="dim">confidence: 90%  status: active</span>',
      '<span class="green bold">  ✓ Windsurf</span>           <span class="dim">confidence: 88%  status: installed</span>',
      '<span class="green bold">  ✓ Ollama</span>             <span class="dim">confidence: 100% status: running</span>',
      '<span class="green bold">  ✓ VS Code</span>            <span class="dim">confidence: 85%  status: installed</span>',
      '',
      '<span class="orange bold">  Detected: 6 agents  |  Registered: 3  |  MCP: ready</span>',
      '',
      '<span class="dim">  Run "phantom register --all" to register with all agents.</span>',
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
