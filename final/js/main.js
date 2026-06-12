// main.js — GatherFaith homepage script (ES Module)
import { fetchEvents, renderEvents, buildModal, toggleSaved, isSaved } from './events.js';

/* ── Hamburger nav ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    mobileNav.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
    }
  });
}

/* ── Modal ── */
const overlay = document.getElementById('modal-overlay');
const modalEl = document.getElementById('modal-content');
let allEvents = [];
let focusTrigger = null;

function openModal(event) {
  modalEl.innerHTML = buildModal(event);
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus close button
  const closeBtn = document.getElementById('modal-close-btn');
  closeBtn?.focus();

  // Close button
  closeBtn?.addEventListener('click', closeModal);

  // Save button inside modal
  document.getElementById('modal-save-btn')?.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.saveId);
    const nowSaved = toggleSaved(id);
    e.currentTarget.textContent = nowSaved ? '★ Saved' : '☆ Save Event';
    e.currentTarget.classList.toggle('saved', nowSaved);
    // sync card save button
    syncCardSaveBtn(id, nowSaved);
  });

  // Trap focus in modal
  overlay.addEventListener('keydown', trapFocus);
}

function closeModal() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  overlay.removeEventListener('keydown', trapFocus);
  focusTrigger?.focus();
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
}

overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay?.classList.contains('open')) closeModal();
});

function syncCardSaveBtn(id, saved) {
  const btns = document.querySelectorAll(`[data-save-id="${id}"]`);
  btns.forEach(btn => {
    btn.classList.toggle('saved', saved);
    if (!btn.classList.contains('btn')) {
      btn.setAttribute('aria-label', saved ? 'Remove from saved' : 'Save event');
    }
  });
}

/* ── Event card click delegation ── */
function attachCardListeners(grid) {
  grid.addEventListener('click', (e) => {
    // Save button
    const saveBtn = e.target.closest('[data-save-id]');
    if (saveBtn && !saveBtn.dataset.modalId) {
      e.stopPropagation();
      const id = Number(saveBtn.dataset.saveId);
      const nowSaved = toggleSaved(id);
      syncCardSaveBtn(id, nowSaved);
      return;
    }

    // Detail button or card
    const card = e.target.closest('.event-card');
    const detailBtn = e.target.closest('[data-modal-id]');
    if (detailBtn || card) {
      const id = Number((detailBtn || card).dataset.id || detailBtn?.dataset.modalId);
      const event = allEvents.find(ev => ev.id === id);
      if (event) {
        focusTrigger = detailBtn || card;
        openModal(event);
      }
    }
  });

  // Keyboard enter on cards
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const card = e.target.closest('.event-card');
      if (card) card.click();
    }
  });
}

/* ── Search / filter on homepage ── */
function setupSearch(events) {
  const input = document.getElementById('hero-search');
  const typeSelect = document.getElementById('hero-type');
  const searchBtn = document.getElementById('hero-search-btn');
  const grid = document.getElementById('featured-grid');

  if (!input || !grid) return;

  function runFilter() {
    const q = input.value.trim().toLowerCase();
    const t = typeSelect?.value || '';
    const filtered = events.filter(ev => {
      const matchQ = !q || ev.title.toLowerCase().includes(q)
        || ev.location.toLowerCase().includes(q)
        || ev.organizer.toLowerCase().includes(q);
      const matchT = !t || ev.type === t;
      return matchQ && matchT;
    });

    // Show only up to 6 on homepage
    renderEvents(filtered.slice(0, 6), grid);
    attachCardListeners(grid);

    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = `Showing ${Math.min(filtered.length, 6)} of ${filtered.length} events`;
  }

  searchBtn?.addEventListener('click', runFilter);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') runFilter(); });
  typeSelect?.addEventListener('change', runFilter);
}

/* ── Filter pills on homepage ── */
function setupPills(events, grid) {
  const pills = document.querySelectorAll('.pill[data-filter]');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const type = pill.dataset.filter;
      const filtered = type === 'All'
        ? events.slice(0, 6)
        : events.filter(e => e.type === type).slice(0, 6);
      renderEvents(filtered, grid);
      attachCardListeners(grid);
    });
  });
}

/* ── Init ── */
async function init() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  allEvents = await fetchEvents();
  if (!allEvents.length) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;">Unable to load events. Please try again later.</p>';
    return;
  }

  // Show first 6 on homepage
  renderEvents(allEvents.slice(0, 6), grid);
  attachCardListeners(grid);
  setupSearch(allEvents);
  setupPills(allEvents, grid);

  // Result count
  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = `Showing 6 of ${allEvents.length} events`;
}

init();