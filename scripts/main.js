// =====================================================
//  main.js – WDD131 Portfolio Home Page
// =====================================================

// ---- Course Data ----
const courses = [
  {
    subject: 'CSE',
    number: 110,
    title: 'Introduction to Programming',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Introduces programming building blocks: variables, decisions, calculations, loops, arrays, and I/O.',
    technology: ['Python'],
    completed: true
  },
  {
    subject: 'WDD',
    number: 130,
    title: 'Web Fundamentals',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Introduces students to the World Wide Web and careers in web design and development.',
    technology: ['HTML', 'CSS'],
    completed: true
  },
  {
    subject: 'CSE',
    number: 111,
    title: 'Programming with Functions',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Students learn to research, call, write, debug, and test functions; handle errors within functions.',
    technology: ['Python'],
    completed: true
  },
  {
    subject: 'CSE',
    number: 210,
    title: 'Programming with Classes',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Introduces classes, objects, encapsulation, inheritance, and polymorphism.',
    technology: ['C#'],
    completed: false
  },
  {
    subject: 'WDD',
    number: 131,
    title: 'Dynamic Web Fundamentals',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Builds on Web Fundamentals; students create dynamic sites using JavaScript events and responsive UX.',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: false
  },
  {
    subject: 'WDD',
    number: 231,
    title: 'Frontend Web Development I',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Focuses on UX, accessibility, compliance, performance optimization, and basic API usage.',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: false
  }
];

// ---- Render Courses ----
function renderCourses(filter) {
  const list = document.getElementById('course-list');
  const creditEl = document.getElementById('credit-total');

  // Filter
  const filtered = filter === 'all'
    ? courses
    : courses.filter(c => c.subject === filter);

  // Build chips
  list.innerHTML = filtered
    .map(c => `
      <div class="course-chip${c.completed ? ' completed' : ''}" title="${c.title}">
        ${c.subject} ${c.number}
        ${c.completed ? '<span class="badge">Done</span>' : ''}
      </div>
    `)
    .join('');

  // Total credits via reduce
  const total = filtered.reduce((sum, c) => sum + c.credits, 0);
  creditEl.textContent = `The total credits for courses listed above is ${total}`;
}

// ---- Filter Buttons ----
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCourses(btn.dataset.filter);
    });
  });
}

// ---- Hamburger Menu ----
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---- Footer: Dynamic Year & Last Modified ----
function initFooter() {
  document.getElementById('copy-year').textContent = new Date().getFullYear();
  document.getElementById('lastModified').textContent =
    `Last Modification: ${document.lastModified}`;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderCourses('all');
  initFilters();
  initMenu();
  initFooter();
});
