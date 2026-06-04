/* =====================================================
   Abuja Chamber of Commerce — chamber.js
   Author: Vimagh Solomon
   Handles: all pages — menu, footer, weather,
            spotlights, join form, thankyou summary
   ===================================================== */

// ── 1. Hamburger Menu ──────────────────────────────────
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });
}

// ── 2. Footer: copyright year & last modified ──────────
function initFooter() {
  const yearEl = document.getElementById('copyright-year');
  const modEl  = document.getElementById('last-modified');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (modEl)  modEl.textContent  = document.lastModified;
}

// ── 3. Weather — OpenWeatherMap ────────────────────────
// Abuja coordinates: 9.0579° N, 7.4951° E
const LAT  = 9.0579;
const LON  = 7.4951;
const OWM_KEY = '1348f5c6e79ae3c88bb4169a21b33e49';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function initWeather() {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;  // skip if not on home page

  if (OWM_KEY === 'YOUR_OWM_API_KEY_HERE') {
    widget.innerHTML = `
      <p class="error">⚠️ Add your OpenWeatherMap API key in chamber.js to display live weather.</p>`;
    return;
  }

  try {
    const curRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${OWM_KEY}`
    );
    if (!curRes.ok) throw new Error('Weather fetch failed');
    const cur = await curRes.json();

    const fcRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&cnt=24&appid=${OWM_KEY}`
    );
    if (!fcRes.ok) throw new Error('Forecast fetch failed');
    const fcData = await fcRes.json();

    const today = new Date().getDate();
    const seen  = new Set();
    const days  = [];

    for (const item of fcData.list) {
      const d = new Date(item.dt * 1000);
      const dateKey = d.toDateString();
      if (d.getDate() === today) continue;
      if (seen.has(dateKey)) continue;
      seen.add(dateKey);
      days.push({ label: DAY_NAMES[d.getDay()], temp: Math.round(item.main.temp), desc: item.weather[0].description });
      if (days.length === 3) break;
    }

    const forecastHTML = days.map(d => `
      <div class="forecast-day">
        <div class="day-label">${d.label}</div>
        <div class="day-temp">${d.temp}°C</div>
        <div class="day-desc">${d.desc}</div>
      </div>`).join('');

    widget.innerHTML = `
      <div class="weather-current">
        <div>
          <div class="weather-temp">${Math.round(cur.main.temp)}°C</div>
          <div class="weather-desc">${cur.weather[0].description}</div>
          <div class="weather-location">📍 Abuja, FCT, Nigeria</div>
        </div>
        <img src="https://openweathermap.org/img/wn/${cur.weather[0].icon}@2x.png"
             alt="${cur.weather[0].description}" width="64" height="64">
      </div>
      <div class="forecast-title">3-Day Forecast</div>
      <div class="forecast-grid">${forecastHTML}</div>`;

  } catch (err) {
    widget.innerHTML = `<p class="error">Unable to load weather data. Please try again later.</p>`;
    console.error('Weather error:', err);
  }
}

// ── 4. Spotlights — fetch members.json ────────────────
const MEMBERSHIP = { 1: 'Member', 2: 'Silver', 3: 'Gold' };

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function initSpotlights() {
  const container = document.getElementById('spotlight-container');
  if (!container) return;  // skip if not on home page

  try {
    const res  = await fetch('data/members.json');
    if (!res.ok) throw new Error('Members fetch failed');
    const data = await res.json();

    const eligible = data.members.filter(m => m.membershipLevel >= 2);
    shuffle(eligible);
    const picks = eligible.slice(0, 3);

    container.innerHTML = picks.map(m => {
      const levelLabel = MEMBERSHIP[m.membershipLevel];
      const badgeClass = m.membershipLevel === 3 ? 'badge-gold' : 'badge-silver';
      return `
        <div class="spotlight-card">
          <img src="${m.image}" alt="${m.name} logo" loading="lazy"
               onerror="this.src='images/placeholder.webp'">
          <h3>${m.name}</h3>
          <span class="badge ${badgeClass}">${levelLabel} Member</span>
          <p>${m.phone}</p>
          <p>${m.address}</p>
          <a href="${m.website}" target="_blank" rel="noopener noreferrer">${m.website.replace('https://', '')}</a>
        </div>`;
    }).join('');

  } catch (err) {
    container.innerHTML = '<p>Unable to load spotlight members.</p>';
    console.error('Spotlight error:', err);
  }
}

// ── 5. Join Page — Timestamp & Modals ─────────────────
function initTimestamp() {
  const tsField = document.getElementById('timestamp');
  if (!tsField) return;  // skip if not on join page

  tsField.value = new Date().toLocaleString('en-NG', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
}

function initModals() {
  const openBtns = document.querySelectorAll('.btn-modal-open');
  if (!openBtns.length) return;  // skip if not on join page

  // Open modals via "Learn More" buttons
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.getAttribute('data-modal'));
      if (modal) modal.showModal();
    });
  });

  // Close via × button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('dialog').close();
    });
  });

  // Close when clicking the backdrop
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const outside =
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  });

  // "Select X Membership" sets the dropdown and closes modal
  document.querySelectorAll('.modal-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = document.getElementById('membership-level');
      if (select) {
        select.value = btn.getAttribute('data-level');
        select.focus();
      }
      btn.closest('dialog').close();
    });
  });
}

// ── 6. Thank You Page — Display Submitted Data ─────────
const LEVEL_LABELS = {
  np:     'NP Membership (Non-Profit)',
  bronze: 'Bronze Membership',
  silver: 'Silver Membership',
  gold:   'Gold Membership'
};

function initSummary() {
  const summaryList = document.getElementById('summary-list');
  if (!summaryList) return;  // skip if not on thankyou page

  const params = new URLSearchParams(window.location.search);

  const fields = [
    { key: 'first-name',       label: 'First Name' },
    { key: 'last-name',        label: 'Last Name' },
    { key: 'email',            label: 'Email Address' },
    { key: 'phone',            label: 'Mobile Phone' },
    { key: 'organization',     label: 'Organization' },
    { key: 'membership-level', label: 'Membership Level' },
    { key: 'timestamp',        label: 'Application Date' },
  ];

  let html = '';
  fields.forEach(({ key, label }) => {
    let value = params.get(key);
    if (!value) return;
    if (key === 'membership-level') value = LEVEL_LABELS[value] || value;
    html += `<dt>${label}</dt><dd>${value}</dd>`;
  });

  summaryList.innerHTML = html ||
    '<dd>No submission data found. Please <a href="join.html">fill out the form</a>.</dd>';
}

// ── Init — runs on every page ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMenu();       // all pages
  initFooter();     // all pages
  initWeather();    // home only   — skips if #weather-widget absent
  initSpotlights(); // home only   — skips if #spotlight-container absent
  initTimestamp();  // join only   — skips if #timestamp absent
  initModals();     // join only   — skips if .btn-modal-open absent
  initSummary();    // thankyou only — skips if #summary-list absent
});