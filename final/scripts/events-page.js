// events-page.js — GatherFaith Events page (ES Module)
import { fetchEvents, renderEvents, buildModal, toggleSaved, getSaved } from './events.js';

const overlay = document.getElementById('modal-overlay');
const modalEl = document.getElementById('modal-content');
let allEvents = [];
let focusTrigger = null;

/* ── Modal ── */
function openModal(event) {
  modalEl.innerHTML = buildModal(event);
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('modal-close-btn');
  closeBtn?.focus();
  closeBtn?.addEventListener('click', closeModal);

  document.getElementById('modal-save-btn')?.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.saveId);
    const nowSaved = toggleSaved(id);
    e.currentTarget.textContent = nowSaved ? '★ Saved' : '☆ Save Event';
    e.currentTarget.classList.toggle('saved', nowSaved);
    syncCardSaveBtn(id, nowSaved);
    updateSavedBanner();
  });

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
  const focusable = overlay.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
}

overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay?.classList.contains('open')) closeModal();
});

function syncCardSaveBtn(id, saved) {
  document.querySelectorAll(`[data-save-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('saved', saved);
    if (!btn.classList.contains('btn')) {
      btn.setAttribute('aria-label', saved ? 'Remove from saved' : 'Save event');
    }
  });
}

/* ── Card click delegation ── */
function attachCardListeners(grid) {
  grid.addEventListener('click', (e) => {
    const saveBtn = e.target.closest('[data-save-id]');
    if (saveBtn && !saveBtn.dataset.modalId) {
      e.stopPropagation();
      const id = Number(saveBtn.dataset.saveId);
      const nowSaved = toggleSaved(id);
      syncCardSaveBtn(id, nowSaved);
      updateSavedBanner();
      return;
    }
    const card = e.target.closest('.event-card');
    const detailBtn = e.target.closest('[data-modal-id]');
    if (detailBtn || card) {
      const id = Number((detailBtn || card).dataset.id || detailBtn?.dataset.modalId);
      const event = allEvents.find(ev => ev.id === id);
      if (event) { focusTrigger = detailBtn || card; openModal(event); }
    }
  });

  grid.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const card = e.target.closest('.event-card'); if (card) card.click(); }
  });
}

/* ── Filters ── */
function getFilters() {
  return {
    q: document.getElementById('filter-search')?.value.trim().toLowerCase() || '',
    type: document.getElementById('filter-type')?.value || '',
    state: document.getElementById('filter-state')?.value || '',
    price: document.getElementById('filter-price')?.value || '',
    saved: document.getElementById('filter-saved')?.checked || false,
  };
}

function applyFilters() {
  const { q, type, state, price, saved } = getFilters();
  const savedIds = getSaved();

  const filtered = allEvents.filter(ev => {
    if (saved && !savedIds.includes(ev.id)) return false;
    if (q && !ev.title.toLowerCase().includes(q) && !ev.location.toLowerCase().includes(q) && !ev.organizer.toLowerCase().includes(q)) return false;
    if (type && ev.type !== type) return false;
    if (state && ev.state !== state) return false;
    if (price === 'free' && ev.price !== 'Free') return false;
    if (price === 'paid' && ev.price === 'Free') return false;
    return true;
  });

  const grid = document.getElementById('events-grid');
  renderEvents(filtered, grid);
  attachCardListeners(grid);

  const countEl = document.getElementById('events-count');
  if (countEl) countEl.textContent = `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`;
}

/* ── Hamburger ── */
function setupHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    mobileNav.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
    }
  });
}

/* ── Saved banner ── */
function updateSavedBanner() {
  const banner = document.getElementById('saved-banner');
  if (!banner) return;
  const count = getSaved().length;
  const msgEl = banner.querySelector('.saved-banner-msg');
  if (msgEl) msgEl.textContent = count > 0
    ? `You have ${count} saved event${count !== 1 ? 's' : ''}. Check the "Saved only" box to view them.`
    : 'Save events by clicking ★ on any card.';
}

/* ── Init ── */
async function init() {
  setupHamburger();
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  allEvents = await fetchEvents();

  // Populate state filter dynamically
  const stateSelect = document.getElementById('filter-state');
  if (stateSelect) {
    const states = [...new Set(allEvents.map(e => e.state))].sort();
    states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      stateSelect.appendChild(opt);
    });
  }

  renderEvents(allEvents, grid);
  attachCardListeners(grid);

  const countEl = document.getElementById('events-count');
  if (countEl) countEl.textContent = `${allEvents.length} events found`;

  updateSavedBanner();

  // Wire up filter controls
  ['filter-search', 'filter-type', 'filter-state', 'filter-price'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', applyFilters);
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
  document.getElementById('filter-saved')?.addEventListener('change', applyFilters);
  document.getElementById('filter-reset')?.addEventListener('click', () => {
    ['filter-search', 'filter-type', 'filter-state', 'filter-price'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const savedCheck = document.getElementById('filter-saved');
    if (savedCheck) savedCheck.checked = false;
    applyFilters();
  });
}

init();