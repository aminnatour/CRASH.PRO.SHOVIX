(function () {
  'use strict';

  /* =========================
     THEME TOGGLE (persisted)
  ========================= */
  const themeButton = document.getElementById('themeButton');
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      themeButton.textContent = '☀';
    } else {
      root.setAttribute('data-theme', 'dark');
      themeButton.textContent = '☾';
    }
  }

  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('shovix-theme') || 'dark';
  } catch (e) {
    savedTheme = 'dark';
  }
  applyTheme(savedTheme);

  themeButton.addEventListener('click', function () {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem('shovix-theme', next);
    } catch (e) {
      /* storage unavailable, ignore */
    }
  });

  /* =========================
     MOBILE MENU
  ========================= */
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  menuButton.addEventListener('click', function () {
    mobileMenu.classList.toggle('active');
    const isOpen = mobileMenu.classList.contains('active');
    menuButton.textContent = isOpen ? '✕' : '☰';
  });

  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('active');
      menuButton.textContent = '☰';
    });
  });

  /* =========================
     HEADER SHADOW ON SCROLL
  ========================= */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* =========================
     SEARCH + CATEGORY FILTER
  ========================= */
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const articlesGrid = document.getElementById('articlesGrid');
  const articleCards = Array.from(articlesGrid.querySelectorAll('.article-card'));
  const noResults = document.getElementById('noResults');
  const categoryCards = document.querySelectorAll('.category-card');
  const showAllButton = document.getElementById('showAll');

  let activeCategory = 'all';

  function normalize(str) {
    return (str || '').trim().toLowerCase();
  }

  function filterArticles() {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    articleCards.forEach(function (card) {
      const title = normalize(card.getAttribute('data-title'));
      const category = card.getAttribute('data-category');
      const matchesQuery = query === '' || title.includes(query);
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const show = matchesQuery && matchesCategory;

      card.classList.toggle('hidden', !show);
      if (show) visibleCount++;
    });

    noResults.classList.toggle('active', visibleCount === 0);
  }

  searchInput.addEventListener('input', filterArticles);
  searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    filterArticles();
    document.getElementById('latest').scrollIntoView({ behavior: 'smooth' });
  });
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      filterArticles();
    }
  });

  categoryCards.forEach(function (card) {
    card.addEventListener('click', function () {
      const category = card.getAttribute('data-category');

      if (activeCategory === category) {
        activeCategory = 'all';
        categoryCards.forEach(function (c) { c.classList.remove('active'); });
      } else {
        activeCategory = category;
        categoryCards.forEach(function (c) { c.classList.remove('active'); });
        card.classList.add('active');
      }

      filterArticles();
      document.getElementById('latest').scrollIntoView({ behavior: 'smooth' });
    });
  });

  showAllButton.addEventListener('click', function () {
    activeCategory = 'all';
    searchInput.value = '';
    categoryCards.forEach(function (c) { c.classList.remove('active'); });
    filterArticles();
  });

  /* =========================
     ARTICLE MODAL
  ========================= */
  const modal = document.getElementById('articleModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalClose = document.getElementById('modalClose');
  const readButtons = document.querySelectorAll('.read-button');

  function openModal(title, text) {
    modalTitle.textContent = title || '';
    modalText.textContent = text || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  readButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const title = button.getAttribute('data-title');
      const text = button.getAttribute('data-text');
      openModal(title, text);
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  /* =========================
     NEWSLETTER -> TOAST
  ========================= */
  const newsletterForm = document.getElementById('newsletterForm');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');

    toast.classList.add('active');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('active');
    }, 3000);

    if (emailInput) emailInput.value = '';
  });

  /* =========================
     SCROLL-REVEAL ANIMATIONS
  ========================= */
  const revealSelectors = [
    '.category-card',
    '.featured-card',
    '.article-card',
    '.popular-item',
    '.newsletter-box',
    '.about-box'
  ];

  const revealElements = document.querySelectorAll(revealSelectors.join(','));
  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* =========================
     ACTIVE NAV LINK ON SCROLL
  ========================= */
  const navLinks = document.querySelectorAll('.desktop-menu a');
  const sections = Array.from(navLinks)
    .map(function (link) {
      const id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    })
    .filter(Boolean);

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let currentId = sections[0] ? sections[0].id : '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const id = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', id === currentId);
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
})();
