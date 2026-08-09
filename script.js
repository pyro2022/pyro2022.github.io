/* =============================================
   PERSONAL BLOG — JAVASCRIPT
   ============================================= */

// --- State ---
let currentSection = 'home';
let currentPostId = null;
let activeTag = null;
let sortOrder = 'desc';  // 'desc' = newest first, 'asc' = oldest first
let posts = [];          // populated from posts/index.js (loaded via <script>)

// --- DOM Helpers ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --- Theme ---
function initTheme() {
  const saved = localStorage.getItem('blog-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('blog-theme', next);
}

$('#themeToggle').addEventListener('click', toggleTheme);

// Language toggle
$('#langToggle').addEventListener('click', () => {
  const next = currentLang === 'zh' ? 'en' : 'zh';
  setLang(next);
});

// --- Mobile Menu ---
$('#mobileMenuBtn').addEventListener('click', () => {
  $('.nav-links').classList.toggle('open');
});

// Close mobile menu on link click
$$('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    $('.nav-links').classList.remove('open');
  });
});

// --- Navigation ---
function navigateTo(section, postId = null) {
  currentSection = section;
  currentPostId = postId;

  // Update nav links
  $$('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });

  // Show correct section
  $$('.section').forEach(s => s.classList.remove('active-section'));

  if (section === 'post' && postId) {
    renderPost(postId);
    $('#post-view').classList.add('active-section');
  } else {
    const target = $(`#${section}`);
    if (target) target.classList.add('active-section');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update URL hash
  if (section === 'post' && postId) {
    window.location.hash = `post/${postId}`;
  } else {
    window.location.hash = section;
  }
}

// Nav link clicks
$$('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.section);
  });
});

// CTA buttons that navigate
$$('[data-nav]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(el.dataset.nav);
  });
});

// --- Post Rendering ---
function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.innerHTML = `
    <div class="post-card-meta">
      <span class="post-card-tag">${post.tag}</span>
      <span>${formatDate(post.date)}</span>
    </div>
    <h3 class="post-card-title">${post.title}</h3>
    <p class="post-card-excerpt">${post.excerpt}</p>
    <div class="post-card-reading-time">${post.readTime}</div>
  `;
  card.addEventListener('click', () => navigateTo('post', post.id));
  return card;
}

function renderRecentPosts() {
  const grid = $('#recentPosts');
  if (!grid) return;
  grid.innerHTML = '';
  // Sort by date descending, then take the 3 most recent
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.slice(0, 3).forEach(post => {
    grid.appendChild(createPostCard(post));
  });
}

function renderAllPosts(filterTag = null, searchTerm = '') {
  const grid = $('#allPosts');
  if (!grid) return;

  let filtered = posts;

  if (filterTag) {
    filtered = filtered.filter(p => p.tag === filterTag);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.excerpt.toLowerCase().includes(term) ||
      p.tag.toLowerCase().includes(term)
    );
  }

  // Sort by date
  filtered = [...filtered].sort((a, b) =>
    sortOrder === 'desc'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
  );

  grid.innerHTML = '';
  filtered.forEach(post => grid.appendChild(createPostCard(post)));

  $('#noResults').style.display = filtered.length === 0 ? 'block' : 'none';
}

function renderTagFilters() {
  const container = $('#tagFilters');
  if (!container) return;

  const tags = [...new Set(posts.map(p => p.tag))];

  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'tag-filter' + (activeTag === null ? ' active' : '');
  allBtn.textContent = t('tag_all');
  allBtn.addEventListener('click', () => {
    activeTag = null;
    renderAllPosts(null, $('#searchInput').value);
    updateTagFilterUI();
  });
  container.appendChild(allBtn);

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-filter' + (activeTag === tag ? ' active' : '');
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      activeTag = activeTag === tag ? null : tag;
      renderAllPosts(activeTag, $('#searchInput').value);
      updateTagFilterUI();
    });
    container.appendChild(btn);
  });
}

function updateTagFilterUI() {
  $$('.tag-filter').forEach(btn => {
    const isAll = btn.textContent === t('tag_all');
    btn.classList.toggle('active', isAll ? activeTag === null : btn.textContent === activeTag);
  });
}

// Search
const searchInput = $('#searchInput');
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderAllPosts(activeTag, searchInput.value);
    }, 200);
  });
}

// Sort toggle
const sortToggle = $('#sortToggle');
if (sortToggle) {
  sortToggle.addEventListener('click', () => {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    sortToggle.textContent = sortOrder === 'desc' ? t('sort_newest') : t('sort_oldest');
    renderAllPosts(activeTag, $('#searchInput')?.value);
  });
}

// --- Post View ---
function renderPost(postId) {
  let post = posts.find(p => p.id === postId);
  if (!post) return;

  // Body is included in posts/index.js — no fetch needed

  const idx = posts.findIndex(p => p.id === postId);
  const prev = idx > 0 ? posts[idx - 1] : null;
  const next = idx < posts.length - 1 ? posts[idx + 1] : null;

  $('#postContainer').innerHTML = `
    <a href="#blog" class="post-back" id="postBackBtn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      ${t('post_back')}
    </a>
    <article class="post-article">
      <div class="post-meta">
        <span class="post-tag">${post.tag}</span>
        <span>${formatDate(post.date)}</span>
        <span>${post.readTime}</span>
      </div>
      <h1>${post.title}</h1>
      <p class="post-subtitle">${post.subtitle}</p>
      <div class="post-body">${post.body}</div>
    </article>
    ${(prev || next) ? `<hr class="post-divider">
    <nav class="post-nav">
      ${prev ? `
        <a class="post-nav-link" data-post-id="${prev.id}" href="#post/${prev.id}">
          <div class="post-nav-label">${t('post_prev')}</div>
          <div class="post-nav-title">${prev.title}</div>
        </a>
      ` : '<div></div>'}
      ${next ? `
        <a class="post-nav-link next" data-post-id="${next.id}" href="#post/${next.id}">
          <div class="post-nav-label">${t('post_next')}</div>
          <div class="post-nav-title">${next.title}</div>
        </a>
      ` : '<div></div>'}
    </nav>` : ''}
  `;

  // Back button
  $('#postBackBtn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('blog');
  });

  // Previous/Next navigation
  $$('.post-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = parseInt(link.dataset.postId);
      if (pid) navigateTo('post', pid);
    });
  });
}

// --- Helpers ---
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// --- Re-render all dynamic content (called by i18n on language switch) ---
window.renderAllContent = function () {
  renderRecentPosts();
  renderAllPosts(activeTag, $('#searchInput')?.value);
  renderTagFilters();
  // Update sort button label for current language
  const btn = $('#sortToggle');
  if (btn) {
    btn.textContent = sortOrder === 'desc' ? t('sort_newest') : t('sort_oldest');
  }
  if (currentSection === 'post' && currentPostId) {
    renderPost(currentPostId);
  }
};

// --- Handle URL hash / popstate ---
function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('post/')) {
    const postId = parseInt(hash.replace('post/', ''));
    if (postId && posts.some(p => p.id === postId)) {
      navigateTo('post', postId);
      return;
    }
  }
  const valid = ['home', 'blog', 'about'];
  if (valid.includes(hash)) {
    navigateTo(hash);
  }
}

window.addEventListener('hashchange', handleHashChange);

// --- Init ---
function init() {
  initTheme();

  // Load posts from the generated JS file (loaded via <script> — no fetch needed)
  posts = window.blogPosts || [];
  applyI18n();  // sets translations, then calls renderAllContent()

  // Handle initial hash
  if (window.location.hash) {
    handleHashChange();
  }

  // Footer year
  const yearEl = $('#currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', init);
