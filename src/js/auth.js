/* ═══════════════════════════════════════════
   K.G.T. Authentication Module
   ═══════════════════════════════════════════ */

import { api } from './api.js';

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Draw grid */
    ctx.strokeStyle = 'rgba(196, 30, 30, 0.03)';
    ctx.lineWidth = 0.5;
    const gridSize = 60;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    /* Draw particles */
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 30, 30, ${p.opacity})`;
      ctx.fill();
    }

    /* Draw connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(196, 30, 30, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });

  return () => cancelAnimationFrame(animFrame);
}

export function initLogin(onSuccess) {
  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      errorEl.textContent = 'Please enter both username and password.';
      return;
    }

    btn.classList.add('loading');
    errorEl.textContent = '';

    try {
      const data = await api.login(username, password);
      api.setToken(data.token);
      api.setUser(data.user);

      btn.classList.remove('loading');
      onSuccess(data.user);
    } catch (err) {
      btn.classList.remove('loading');
      errorEl.textContent = err.message || 'Authentication failed.';
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
  });
}

export function checkAuth() {
  const token = api.getToken();
  const user = api.getUser();
  if (token && user) return user;
  return null;
}

export function logout() {
  api.clearToken();
  window.location.reload();
}
