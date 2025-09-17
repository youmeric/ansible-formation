const $ = (s)=>document.querySelector(s);
const statusEl = $('#healthStatus');
$('#healthBtn')?.addEventListener('click', async () => {
  statusEl.textContent = 'Test en cours…';
  statusEl.style.background = 'rgba(245,158,11,.2)';
  try {
    const res = await fetch('/health', { cache: 'no-store' });
    if (res.ok) {
      statusEl.textContent = 'OK';
      statusEl.style.background = 'rgba(34,197,94,.2)';
    } else {
      statusEl.textContent = 'Erreur ' + res.status;
      statusEl.style.background = 'rgba(244,63,94,.2)';
    }
  } catch (e) {
    statusEl.textContent = 'Hors ligne';
    statusEl.style.background = 'rgba(244,63,94,.2)';
  }
});
$('#toggle')?.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
});

// --- Performances: mesure latence /health + graphe canvas ---
const ctx = $('#latencyChart')?.getContext('2d');
const ctxCPU = $('#cpuChart')?.getContext('2d');
const ctxMEM = $('#memChart')?.getContext('2d');
const startBtn = $('#startBtn');
const stopBtn = $('#stopBtn');
const clearBtn = $('#clearBtn');
const stats = $('#stats');
let running = false;
let points = [];
let cpuPts = [];
let memPts = [];
let rafId;

function drawLine(ctx, pts, color, label) {
  if (!ctx) return;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.clearRect(0,0,w,h);
  // axes
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 10); ctx.lineTo(40, h-30); ctx.lineTo(w-10, h-30); ctx.stroke();

  if (pts.length === 0) return;
  // scale
  const maxY = Math.max(50, ...pts.map(p=>p.y));
  const data = pts.slice(-200);
  const dx = (w-60) / Math.max(1, data.length-1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((p,i)=>{
    const x = 40 + i*dx;
    const y = (h-30) - (p.y/maxY)*(h-40);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  // labels
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.font = '12px system-ui';
  ctx.fillText(label, 8, 18);
  ctx.fillText(String(Math.round(maxY)), 8, 32);
}

async function measureOnce() {
  const t0 = performance.now();
  try {
    const res = await fetch('/health?ts='+Date.now(), { cache:'no-store' });
    const ok = res.ok;
    const t1 = performance.now();
    const ms = Math.max(0, t1 - t0);
    points.push({ x: Date.now(), y: ms, ok });
    stats.textContent = `${points.length} pts — ${Math.round(ms)} ms`;
    drawLine(ctx, points, '#22c55e', 'ms');
  } catch (e) {
    const t1 = performance.now();
    const ms = Math.max(0, t1 - t0);
    points.push({ x: Date.now(), y: ms, ok: false });
    stats.textContent = `${points.length} pts — erreur`;
    drawLine(ctx, points, '#22c55e', 'ms');
  }
}

async function loop() {
  if (!running) return;
  await measureOnce();
  // Fetch metrics CPU/MEM
  try {
    const r = await fetch('/api/metrics?ts='+Date.now(), { cache:'no-store' });
    if (r.ok) {
      const m = await r.json();
      cpuPts.push({ x: Date.now(), y: m.cpu_percent || 0 });
      memPts.push({ x: Date.now(), y: m.mem?.used_percent || 0 });
      drawLine(ctxCPU, cpuPts, '#60a5fa', '%');
      drawLine(ctxMEM, memPts, '#f59e0b', '%');
    }
  } catch {}
  setTimeout(()=>{ rafId = requestAnimationFrame(loop); }, 500);
}

startBtn?.addEventListener('click', () => {
  if (running) return;
  running = true;
  startBtn.setAttribute('aria-pressed','true');
  stopBtn.disabled = false;
  loop();
});
stopBtn?.addEventListener('click', () => {
  running = false;
  startBtn.setAttribute('aria-pressed','false');
  stopBtn.disabled = true;
  if (rafId) cancelAnimationFrame(rafId);
});
clearBtn?.addEventListener('click', () => {
  points = [];
  cpuPts = [];
  memPts = [];
  stats.textContent = '0 pts';
  drawLine(ctx, points, '#22c55e', 'ms');
  drawLine(ctxCPU, cpuPts, '#60a5fa', '%');
  drawLine(ctxMEM, memPts, '#f59e0b', '%');
});

drawLine(ctx, points, '#22c55e', 'ms');
drawLine(ctxCPU, cpuPts, '#60a5fa', '%');
drawLine(ctxMEM, memPts, '#f59e0b', '%');

// --- Utilitaires MySQL: copier commande & afficher mot de passe ---
const copyBtn = document.getElementById('copyConn');
const togglePwdBtn = document.getElementById('togglePwd');
copyBtn?.addEventListener('click', async () => {
  const content = document.getElementById('connStr')?.textContent || '';
  try {
    await navigator.clipboard.writeText(content);
    copyBtn.textContent = 'Copié';
    setTimeout(()=>copyBtn.textContent='Copier', 1200);
  } catch {}
});
togglePwdBtn?.addEventListener('click', () => {
  const pass = togglePwdBtn.getAttribute('data-password') || '';
  const showing = togglePwdBtn.getAttribute('aria-pressed') === 'true';
  togglePwdBtn.setAttribute('aria-pressed', String(!showing));
  if (!showing) {
    togglePwdBtn.textContent = 'Masquer mot de passe';
    togglePwdBtn.insertAdjacentHTML('afterend', `<span class="chip" id="pwdView">mdp=<code>${pass || '(non défini)'}</code></span>`);
  } else {
    togglePwdBtn.textContent = 'Afficher mot de passe';
    document.getElementById('pwdView')?.remove();
  }
});
