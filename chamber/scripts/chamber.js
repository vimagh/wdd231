/* =====================================================
   Abuja Chamber of Commerce — home.js
   Author: Vimagh Solomon
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
// ⚠️  Replace with your actual OWM API key:
const OWM_KEY = '1348f5c6e79ae3c88bb4169a21b33e49';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function initWeather() {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;

  // Guard: no real key yet
  if (OWM_KEY === 'YOUR_OWM_API_KEY_HERE') {
    widget.innerHTML = `
      <p class="error">⚠️ Add your OpenWeatherMap API key in <code>home.js</code> to display live weather.</p>`;
    return;
  }

  try {
    // Current weather
    const curRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${OWM_KEY}`
    );
    if (!curRes.ok) throw new Error('Weather fetch failed');
    const cur = await curRes.json();

    // 5-day / 3-hour forecast
    const fcRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&cnt=24&appid=${OWM_KEY}`
    );
    if (!fcRes.ok) throw new Error('Forecast fetch failed');
    const fcData = await fcRes.json();

    // Pull one reading per day (noon-ish) for next 3 days
    const today = new Date().getDate();
    const seen  = new Set();
    const days  = [];

    for (const item of fcData.list) {
      const d = new Date(item.dt * 1000);
      const dateKey = d.toDateString();
      if (d.getDate() === today) continue;          // skip today
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
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function initSpotlights() {
  const container = document.getElementById('spotlight-container');
  if (!container) return;

  try {
    const res  = await fetch('data/members.json');
    if (!res.ok) throw new Error('Members fetch failed');
    const data = await res.json();

    // Filter gold (3) and silver (2) members, then randomly pick 2–3
    const eligible = data.members.filter(m => m.membershipLevel >= 2);
    shuffle(eligible);
    const picks = eligible.slice(0, 3);   // show up to 3

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

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initFooter();
  initWeather();
  initSpotlights();
});