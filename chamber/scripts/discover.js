/* =====================================================
   Abuja Chamber of Commerce — discover.js
   Author: Vimagh Solomon
   Type: ES Module (type="module" in HTML)
   ===================================================== */

import { attractions } from '../data/attractions.mjs';

// ── 1. Hamburger Menu ─────────────────────────────────
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });
}

// ── 2. Footer ─────────────────────────────────────────
function initFooter() {
  const yearEl = document.getElementById('copyright-year');
  const modEl  = document.getElementById('last-modified');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (modEl)  modEl.textContent  = document.lastModified;
}

// ── 1. Visitor Message via localStorage ───────────────
function initVisitorMessage() {
  const msgEl       = document.getElementById('visitor-msg');
  if (!msgEl) return;

  const LS_KEY      = 'abujaDiscover_lastVisit';
  const now         = Date.now();
  const lastVisit   = localStorage.getItem(LS_KEY);

  let message = '';

  if (!lastVisit) {
    // First visit ever
    message = 'Welcome! Let us know if you have any questions.';
  } else {
    const msPerDay  = 1000 * 60 * 60 * 24;
    const daysSince = Math.floor((now - Number(lastVisit)) / msPerDay);

    if (daysSince < 1) {
      message = 'Back so soon! Awesome!';
    } else if (daysSince === 1) {
      message = 'You last visited 1 day ago.';
    } else {
      message = `You last visited ${daysSince} days ago.`;
    }
  }

  // Store current visit timestamp
  localStorage.setItem(LS_KEY, now);

  msgEl.textContent = message;
  msgEl.classList.add('visible');
}

// ── 2. Build Attraction Cards ─────────────────────────
function buildCards() {
  const container = document.getElementById('cards-container');
  if (!container) return;

  container.innerHTML = attractions.map((item, index) => `
    <article class="attraction-card card${index + 1}">
      <h2>${item.name}</h2>
      <figure>
        <img src="${item.image}"
             alt="${item.alt}"
             width="300" height="200"
             loading="lazy"
             onerror="this.style.minHeight='160px';this.style.background='var(--clr-bg)';this.removeAttribute('src')" />
      </figure>
      <address>${item.address}</address>
      <p>${item.description}</p>
      <button type="button" class="btn-learn-more"
              aria-label="Learn more about ${item.name}">Learn More</button>
    </article>
  `).join('');
}

// ── Init ──────────────────────────────────────────────
initMenu();
initFooter();
initVisitorMessage();
buildCards();