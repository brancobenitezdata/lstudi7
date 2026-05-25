/* ============================================================
   L7 — L'STUDI 7  |  main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CUSTOM CURSOR (desktop / hover device only)
  ---------------------------------------------------------- */
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');

  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mx = -100, my = -100; // start off-screen
    let cx = -100, cy = -100;
    let rafId;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      // Dot is instant
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top  = my + 'px';
    });

    function lerpCursor() {
      cx += (mx - cx) * 0.13;
      cy += (my - cy) * 0.13;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      rafId = requestAnimationFrame(lerpCursor);
    }
    lerpCursor();

    // Expand cursor on interactive elements
    const hovers = document.querySelectorAll(
      'a, button, input, select, textarea, .eq-card, .service-card'
    );
    hovers.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity    = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity    = '1';
      cursorDot.style.opacity = '1';
    });
  }

  /* ----------------------------------------------------------
     NAV — scroll state
  ---------------------------------------------------------- */
  const nav = document.getElementById('nav');

  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ----------------------------------------------------------
     MOBILE MENU
  ---------------------------------------------------------- */
  const menuBtn    = document.getElementById('menuBtn');
  const menuClose  = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');

  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Animate to ×
    const [s1, s2] = menuBtn.querySelectorAll('span');
    s1.style.transform = 'translateY(3px) rotate(45deg)';
    s2.style.transform = 'translateY(-3px) rotate(-45deg)';
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    const [s1, s2] = menuBtn.querySelectorAll('span');
    s1.style.transform = '';
    s2.style.transform = '';
  }

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  if (menuClose) menuClose.addEventListener('click', closeMenu);

  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* ----------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  ---------------------------------------------------------- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Stagger siblings in the same parent
          const siblings = [
            ...entry.target.parentElement.querySelectorAll('.reveal:not(.is-visible)'),
          ];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.max(0, idx * 90);

          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);

          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => io.observe(el));
  } else {
    // Fallback: show everything
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------
     SMOOTH SCROLL for anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     CONTACT FORM — Netlify AJAX + local fallback
  ---------------------------------------------------------- */
  const form        = document.getElementById('contactForm');
  const successMsg  = document.getElementById('formSuccess');

  if (form && successMsg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.btn-submit');
      const origText  = submitBtn.innerHTML;
      submitBtn.textContent = 'ENVIANDO…';
      submitBtn.disabled = true;

      const formData = new FormData(form);

      try {
        // Netlify Forms: POST to current page as URL-encoded
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString(),
        });
      } catch (_) {
        // Network error or local dev — still show success UX
      }

      form.reset();
      submitBtn.innerHTML  = origText;
      submitBtn.disabled   = false;
      successMsg.classList.add('is-visible');

      setTimeout(() => successMsg.classList.remove('is-visible'), 6000);
    });
  }

  /* ----------------------------------------------------------
     MARQUEE — pause on hover for accessibility
  ---------------------------------------------------------- */
  const marqueeInners = document.querySelectorAll('.marquee-inner');
  const marqueeSection = document.querySelector('.marquee-section');

  if (marqueeSection && marqueeInners.length) {
    marqueeSection.addEventListener('mouseenter', () => {
      marqueeInners.forEach((el) => (el.style.animationPlayState = 'paused'));
    });
    marqueeSection.addEventListener('mouseleave', () => {
      marqueeInners.forEach((el) => (el.style.animationPlayState = 'running'));
    });
  }

  /* ----------------------------------------------------------
     REDUCED MOTION — disable animations
  ---------------------------------------------------------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach((el) => el.classList.add('is-visible'));
    marqueeInners.forEach((el) => (el.style.animation = 'none'));
  }
})();
