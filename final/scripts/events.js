// events.js — GatherFaith ES Module
// Handles fetching, rendering, filtering, and local storage for events

const SAVED_KEY = 'gatherfaith_saved';

/* ── Local storage helpers ── */
export function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleSaved(id) {
  const saved = getSaved();
  const idx = saved.indexOf(id);
  if (idx === -1) {
    saved.push(id);
  } else {
    saved.splice(idx, 1);
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  return saved.includes(id) || idx === -1;
}

export function isSaved(id) {
  return getSaved().includes(id);
}

/* ── Fetch events from JSON ── */
export async function fetchEvents() {
  try {
    const res = await fetch('./data/events.json');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to load events:', err);
    return [];
  }
}

/* ── Format date nicely ── */
export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/* ── Build a single event card HTML ── */
export function buildEventCard(event) {
  const saved = isSaved(event.id);
  return `
    <article
      class="event-card"
      data-id="${event.id}"
      data-type="${event.type}"
      data-state="${event.state}"
      tabindex="0"
      role="button"
      aria-label="View details for ${event.title}"
    >
      <img
        class="event-card-img"
        src="${event.image}"
        alt="${event.title} event"
        loading="lazy"
        width="600"
        height="338"
      />
      <div class="event-card-body">
        <span class="event-type-badge">${event.type}</span>
        <h3 class="event-card-title">${event.title}</h3>
        <div class="event-meta">
          <span class="event-meta-item">
            <span class="meta-icon" aria-hidden="true">📅</span>
            ${formatDate(event.date)}
          </span>
          <span class="event-meta-item">
            <span class="meta-icon" aria-hidden="true">📍</span>
            ${event.location}
          </span>
          <span class="event-meta-item">
            <span class="meta-icon" aria-hidden="true">🏛️</span>
            ${event.organizer}
          </span>
        </div>
        <div class="event-card-footer">
          <div>
            <span class="event-price">${event.price}</span>
            <span class="event-seats">&nbsp;· ${event.seats} spots</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <button
              class="save-btn ${saved ? 'saved' : ''}"
              data-save-id="${event.id}"
              aria-label="${saved ? 'Remove from saved' : 'Save event'}"
              title="${saved ? 'Saved' : 'Save'}"
            >&#9733;</button>
            <button class="card-btn" data-modal-id="${event.id}">Details</button>
          </div>
        </div>
      </div>
    </article>`;
}

/* ── Render a list of events into a container ── */
export function renderEvents(events, container) {
  if (!events.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--muted);">
        <p style="font-size:2rem;margin-bottom:0.5rem;">🔍</p>
        <p style="font-size:16px;">No events match your filters. Try adjusting your search.</p>
      </div>`;
    return;
  }
  container.innerHTML = events.map(buildEventCard).join('');
}

/* ── Build modal HTML for an event ── */
export function buildModal(event) {
  const saved = isSaved(event.id);
  return `
    <img
      class="modal-img"
      src="${event.image}"
      alt="${event.title}"
      loading="lazy"
      width="560"
      height="315"
    />
    <div class="modal-body">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title">${event.title}</h2>
        <button class="modal-close" id="modal-close-btn" aria-label="Close dialog">&#10005;</button>
      </div>
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="modal-meta-label">Date</span>
          <span class="modal-meta-val">${formatDate(event.date)}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Type</span>
          <span class="modal-meta-val">${event.type}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Location</span>
          <span class="modal-meta-val">${event.location}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Price</span>
          <span class="modal-meta-val">${event.price}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Organizer</span>
          <span class="modal-meta-val">${event.organizer}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Spots Available</span>
          <span class="modal-meta-val">${event.seats}</span>
        </div>
      </div>
      <p class="modal-description">${event.description}</p>
      <div class="modal-actions">
        <button
          class="btn btn-primary btn-sm save-btn ${saved ? 'saved' : ''}"
          data-save-id="${event.id}"
          id="modal-save-btn"
        >${saved ? '★ Saved' : '☆ Save Event'}</button>
        <a class="btn btn-forest btn-sm" href="events.html">Browse More Events</a>
      </div>
    </div>`;
}