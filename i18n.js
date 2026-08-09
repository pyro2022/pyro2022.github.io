/* =============================================
   PERSONAL BLOG — I18N (Internationalization)
   ============================================= */

const translations = {
  zh: {
    site_title: "Star Sagittarius — 个人博客",
    nav_home: "首页",
    nav_blog: "博客",
    nav_about: "关于",
    theme_toggle: "切换暗色模式",
    menu: "菜单",
    hero_greeting: "👋 你好，我是",
    hero_tagline: "学生，业余程序设计、平面设计，向往美好。",
    cta_blog: "阅读博客",
    cta_about: "关于我",
    recent_posts: "最新文章",
    view_all: "查看全部 →",
    blog_heading: "博客",
    blog_desc: "关于软件、设计的思考，偶尔记录生活",
    search_placeholder: "搜索文章…",
    tag_all: "全部",
    no_results: "未找到文章，试试其他搜索词",
    about_heading: "关于我",
    about_p1: "你好，我是 Alex。我是一名常驻西雅图的软件工程师，目前在一家开发工具初创公司工作。我热衷于整洁的代码、深思熟虑的设计，以及工程与产品的交汇。",
    about_p2: "这个博客是我分享学习心得的地方 —— 从 Web 性能的深度探究到工程文化的反思。我相信最好的软件是由那些既理解技术又理解人性的人构建的。",
    about_p3: "不写代码的时候，你会在喀斯喀特山脉的徒步道上找到我，或者我在煮一杯不太靠谱的咖啡，要么就是在读科幻小说。",
    about_email: "邮箱",
    post_back: "返回文章列表",
    post_prev: "← 上一篇",
    post_next: "下一篇 →",
    footer_built: "使用纯 HTML、CSS 和 JS 构建，感谢DeepSeek Agent协助",
    lang_label: "中/EN",
    sort_newest: "最新优先",
    sort_oldest: "最早优先",
  },

  en: {
    site_title: "Star Sagittarius — Personal Blog",
    nav_home: "Home",
    nav_blog: "Blog",
    nav_about: "About",
    theme_toggle: "Toggle dark mode",
    menu: "Menu",
    hero_greeting: "👋 Hello, I'm",
    hero_tagline: "Student, loving amateur programming and graphic design, always seek for beauty.",
    cta_blog: "Read the blog",
    cta_about: "About me",
    recent_posts: "Recent Posts",
    view_all: "View all →",
    blog_heading: "Blog",
    blog_desc: "Thoughts on software, design, and the occasional record on life.",
    search_placeholder: "Search posts…",
    tag_all: "All",
    no_results: "No posts found. Try a different search term.",
    about_heading: "About Me",
    about_p1: "Hi, I'm Alex. I'm a software engineer based in Seattle, currently working at a startup building developer tools. I care deeply about clean code, thoughtful design, and the intersection of engineering and product.",
    about_p2: "This blog is where I share what I'm learning — from deep dives into web performance to reflections on engineering culture. I believe the best software is built by people who understand both the technical and the human side of the craft.",
    about_p3: "When I'm not writing code, you'll find me hiking in the Cascades, brewing questionable coffee, or reading science fiction.",
    about_email: "Email",
    post_back: "Back to all posts",
    post_prev: "← Previous",
    post_next: "Next →",
    footer_built: "Built with plain HTML, CSS & JS. Thank the agent contribution by DeepSeek",
    lang_label: "中/EN",
    sort_newest: "Newest first",
    sort_oldest: "Oldest first",
  },
};

// --- Current language ---
let currentLang = localStorage.getItem("blog-lang") || "zh";

// --- Lookup ---
function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || key;
}

// --- Apply translations to the DOM ---
function applyI18n() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

  // Elements with text content
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });

  // Input placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Aria labels
  document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  // Title attribute
  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    el.setAttribute("title", t(el.dataset.i18nTitle));
  });

  // Re-render dynamic content (defined in script.js)
  if (typeof window.renderAllContent === "function") {
    window.renderAllContent();
  }
}

// --- Switch language ---
function setLang(lang) {
  if (lang !== "zh" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("blog-lang", lang);
  applyI18n();
}
