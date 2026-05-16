// =====================================================
//  chamber.js  –  Abuja Chamber of Commerce
// =====================================================

// ---- Hamburger Menu ----
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---- Footer: Year & Last Modified ----
function initFooter() {
  const yearEl = document.getElementById('copy-year');
  const modEl  = document.getElementById('lastModified');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (modEl)  modEl.textContent  = `Last Modification: ${document.lastModified}`;
}

// ---- Membership level helpers ----
function levelName(n) {
  if (n === 3) return 'Gold';
  if (n === 2) return 'Silver';
  return 'Member';
}
function levelClass(n) {
  if (n === 3) return 'gold';
  if (n === 2) return 'silver';
  return 'member';
}
function badgeClass(n) {
  if (n === 3) return 'badge-gold';
  if (n === 2) return 'badge-silver';
  return 'badge-member';
}

// ---- Build a single card (grid view) ----
function buildCard(m) {
  const card = document.createElement('div');
  card.className = `member-card ${levelClass(m.membership)}`;

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${m.image}" alt="${m.name} business photo" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-img-placeholder" style="display:none">🏢</div>
    </div>
    <div class="card-body">
      <p class="card-name">${m.name}</p>
      <p class="card-tagline">${m.tagline}</p>
      <p class="card-detail"><strong>Address:</strong> ${m.address}</p>
      <p class="card-detail"><strong>Phone:</strong> ${m.phone}</p>
      <p class="card-detail"><strong>Web:</strong>
        <a href="${m.website}" target="_blank" rel="noopener noreferrer">${m.website.replace('https://','')}</a>
      </p>
      <p class="card-detail"><strong>Industry:</strong> ${m.industry}</p>
      <div class="card-badge">
        <span class="badge-pill ${badgeClass(m.membership)}">${levelName(m.membership)}</span>
      </div>
    </div>
  `;
  return card;
}

// ---- Render members ----
function renderMembers(members) {
  const container = document.getElementById('member-container');
  if (!container) return;
  container.innerHTML = '';
  members.forEach(m => container.appendChild(buildCard(m)));
}

// ---- Fetch & init directory ----
async function initDirectory() {
  const container = document.getElementById('member-container');
  if (!container) return;   // not on directory page

  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const members = await response.json();

    renderMembers(members);

    // View toggle buttons
    const gridBtn = document.getElementById('btn-grid');
    const listBtn = document.getElementById('btn-list');

    gridBtn?.addEventListener('click', () => {
      container.classList.remove('list-view');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    });

    listBtn?.addEventListener('click', () => {
      container.classList.add('list-view');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    });

  } catch (err) {
    console.error('Failed to load members:', err);
    container.innerHTML = '<p style="color:red;padding:1rem">Could not load member data. Please try again later.</p>';
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initFooter();
  initDirectory();
});
