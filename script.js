'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= SOUND (WebAudio, no files) ================= */
const Sound = {
  ctx: null,
  enabled: localStorage.getItem('sound') === 'on',
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  beep(freq = 440, dur = 0.06, type = 'square', vol = 0.04) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  },
  hover() { this.beep(660, 0.04); },
  click() { this.beep(880, 0.07); },
  tick() { this.beep(1100, 0.025, 'square', 0.02); },
  success() { this.beep(523, 0.08); setTimeout(() => this.beep(784, 0.12), 90); },
  error() { this.beep(160, 0.15, 'sawtooth'); },
};

const soundToggle = document.getElementById('sound-toggle');
function renderSoundToggle() {
  soundToggle.textContent = Sound.enabled ? '♪ ON' : '♪ OFF';
  soundToggle.setAttribute('aria-pressed', String(Sound.enabled));
}
soundToggle.addEventListener('click', () => {
  Sound.enabled = !Sound.enabled;
  localStorage.setItem('sound', Sound.enabled ? 'on' : 'off');
  if (Sound.enabled) { Sound.init(); Sound.success(); }
  renderSoundToggle();
});
renderSoundToggle();

// bleeps on interactive elements
document.querySelectorAll('a, button').forEach((el) => {
  el.addEventListener('mouseenter', () => Sound.hover());
  el.addEventListener('click', () => { Sound.init(); Sound.click(); });
});

/* ================= TYPEWRITER ================= */
function typeText(el, text, speed = 28) {
  return new Promise((resolve) => {
    if (reducedMotion) { el.textContent += text; resolve(); return; }
    let i = 0;
    (function step() {
      if (i < text.length) {
        el.textContent += text[i++];
        if (i % 3 === 0) Sound.tick();
        setTimeout(step, speed);
      } else resolve();
    })();
  });
}

/* ================= BOOT SEQUENCE ================= */
const boot = document.getElementById('boot');
const bootText = document.getElementById('boot-text');
const BOOT_LINES = [
  'SHASHI-OS v2.6 (c) 2026',
  'CPU: HUMAN BRAIN @ 3.3GHz ......... OK',
  'RAM: COFFEE BUFFER ................ OK',
  'LOADING MODULES:',
  '  > ai_ml.ko ...................... OK',
  '  > rust_compiler.ko .............. OK',
  '  > intrusion_detection.ko ........ OK',
  '  > tokelang.ko [PATENTED] ........ OK',
  'MOUNTING /dev/portfolio ........... OK',
  '',
  'BOOT COMPLETE. PRESS START.',
];
let bootDone = false;
function endBoot() {
  if (bootDone) return;
  bootDone = true;
  boot.classList.add('hidden');
  document.body.style.overflow = '';
  window.removeEventListener('keydown', endBoot);
  boot.removeEventListener('click', endBoot);
  startHeroRoles();
}
async function runBoot() {
  if (reducedMotion || sessionStorage.getItem('booted')) { endBoot(); return; }
  sessionStorage.setItem('booted', '1');
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', endBoot);
  boot.addEventListener('click', endBoot);
  for (const line of BOOT_LINES) {
    if (bootDone) return;
    await typeText(bootText, line + '\n', 3);
    await new Promise((r) => setTimeout(r, 25));
  }
  setTimeout(endBoot, 200);
}

/* ================= HERO ROLE CYCLER ================= */
const roleEl = document.getElementById('role-type');
const ROLES = ['AI ENGINEER', 'GAMER', 'SECURITY RESEARCHER', 'CREATOR OF TOKELANG', 'SELF-HOSTING ENTHUSIAST'];
let rolesStarted = false;
async function startHeroRoles() {
  if (rolesStarted) return;
  rolesStarted = true;
  if (reducedMotion) { roleEl.textContent = ROLES[0]; return; }
  let idx = 0;
  for (;;) {
    const role = ROLES[idx % ROLES.length];
    await typeText(roleEl, role, 55);
    await new Promise((r) => setTimeout(r, 1800));
    // erase
    while (roleEl.textContent.length) {
      roleEl.textContent = roleEl.textContent.slice(0, -1);
      await new Promise((r) => setTimeout(r, 25));
    }
    idx++;
  }
}

/* ================= HUD ACTIVE SECTION ================= */
const hudLinks = [...document.querySelectorAll('.hud-link')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    hudLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-30% 0px -60% 0px' });
document.querySelectorAll('section.screen').forEach((s) => sectionObserver.observe(s));

/* ================= FAKE TERMINAL ================= */
const termOutput = document.getElementById('term-output');
const termInput = document.getElementById('term-input');
const history = [];
let histIdx = -1;

const COMMANDS = {
  help: () => [
    'AVAILABLE COMMANDS:',
    '  whoami      — who is this guy',
    '  skills      — tech stack',
    '  projects    — quest log',
    '  awards      — trophy cabinet',
    '  contact     — how to reach me',
    '  resume      — download resume.pdf',
    '  sudo hire-me — do it',
    '  clear       — wipe screen',
  ],
  whoami: () => [
    'SHASHI VADHAN — AI engineer & security researcher, Bangalore.',
    'B.E. CSE (IoT, Cyber Security, Blockchain) @ DSATM, 2022-2026, CGPA 8.4.',
    'Builds token-efficient LLM tooling in Rust. Publishes IEEE papers for fun.',
  ],
  skills: () => [
    'LANG:     Python, Rust, C, JavaScript, SQL, Java',
    'AI/ML:    PyTorch, TensorFlow, scikit-learn, OpenCV, LLMs/VLLMs, token compression',
    'BACKEND:  REST, microservices, Docker, AWS EC2, Nginx, Node.js, MongoDB, Linux',
    'SECURITY: IDS, anomaly detection, SSL/TLS, network security, zero trust',
  ],
  projects: () => [
    '[1] TOKELANG — patent-published token compression for LLMs (75% reduction) → tokelang.com',
    '[2] IDS WITH ML — CNN + Random Forest intrusion detection, IEEE published',
    '[3] SELF-HOSTED INFRA — TrueNAS + Docker + Cloudflare Tunnel production stack',
  ],
  awards: () => [
    '1ST — RVCE Pitch-It Ideathon (2025)',
    '2ND — InnovateX Pitchathon (2026) · RVITM IPR Conclave',
    '3RD — CloudSEK Quantum Breach (2025) · IBM EcoEquify (2023)',
  ],
  contact: () => [
    'EMAIL:    shashivadhan2003@gmail.com',
    'PHONE:    +91 8904887638',
    'GITHUB:   github.com/InternalError69',
    'LINKEDIN: linkedin.com/in/shashi-vadhan',
    'WEB:      tokelang.com',
  ],
  resume: () => {
    const a = document.createElement('a');
    a.href = 'resume-7-7-26.pdf';
    a.download = '';
    a.click();
    return ['> downloading resume-7-7-26.pdf ... OK'];
  },
  'sudo hire-me': () => [
    '[sudo] password for guest: ********',
    'ACCESS GRANTED.',
    'Opening mail client...',
  ],
  clear: () => {
    termOutput.innerHTML = '';
    return [];
  },
};
COMMANDS['sudo hire-me'].after = () => { location.href = 'mailto:shashivadhan2003@gmail.com?subject=You%27re%20hired'; };

function termPrint(text, cls) {
  const p = document.createElement('p');
  p.textContent = text;
  if (cls) p.classList.add(cls);
  termOutput.appendChild(p);
  termOutput.scrollTop = termOutput.scrollHeight;
}

termInput.addEventListener('keydown', (e) => {
  Sound.init();
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < history.length - 1) termInput.value = history[++histIdx];
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    termInput.value = histIdx > 0 ? history[--histIdx] : ((histIdx = -1), '');
    return;
  }
  if (e.key !== 'Enter') { Sound.tick(); return; }

  const raw = termInput.value.trim();
  termInput.value = '';
  if (!raw) return;
  history.unshift(raw);
  histIdx = -1;
  termPrint('guest@shashi:~$ ' + raw, 'term-cmd');

  const cmd = COMMANDS[raw.toLowerCase()];
  if (cmd) {
    cmd().forEach((line) => termPrint(line));
    if (cmd.after) setTimeout(cmd.after, 600);
    Sound.success();
  } else {
    termPrint(`bash: ${raw}: command not found — try 'help'`, 'term-err');
    Sound.error();
  }
});

document.getElementById('hud-terminal').addEventListener('click', () => {
  setTimeout(() => termInput.focus({ preventScroll: true }), 400);
});

/* ================= TOAST + KONAMI ================= */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPos = 0;
window.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : (key === KONAMI[0] ? 1 : 0);
  if (konamiPos === KONAMI.length) {
    konamiPos = 0;
    document.body.classList.add('glitch');
    setTimeout(() => document.body.classList.remove('glitch'), 1700);
    showToast('★ GOD MODE UNLOCKED ★');
    Sound.success();
  }
});

/* ================= GO ================= */
runBoot();
