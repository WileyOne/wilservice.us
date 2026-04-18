(function () {
  'use strict';

  // Signal that JS is running so CSS can enable scroll-in animations (otherwise content stays visible)
  document.documentElement.classList.add('js-polish');

  // Hero background image (JS-applied for cache-busting and flexible placement)
  var heroVisual = document.getElementById('hero-visual');
  if (heroVisual) {
    var heroVersion = 2; // Bump when you change hero.jpg so browsers fetch the new image
    heroVisual.style.backgroundImage = "url('images/hero.jpg?v=" + heroVersion + "')";
  }

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header: add shadow when scrolled
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll-in animations: add .in-view when section enters viewport (forgiving margin so content appears reliably)
  var sections = document.querySelectorAll('.animate-on-scroll');
  if (typeof IntersectionObserver !== 'undefined') {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { rootMargin: '0px 0px -20px 0px', threshold: 0.02 });
    sections.forEach(function (el) { observer.observe(el); });
  } else {
    sections.forEach(function (el) { el.classList.add('in-view'); });
  }

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close menu when clicking a nav link (mobile)
    document.querySelectorAll('.nav-list a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Contact form: mailto to info@ (address from form data attributes)
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var local = form.getAttribute('data-email-local') || 'info';
      var domain = form.getAttribute('data-email-domain') || 'wilservice.us';
      var to = local + '@' + domain;
      var name = (form.querySelector('[name="name"]') && form.querySelector('[name="name"]').value) || '';
      var email = (form.querySelector('[name="email"]') && form.querySelector('[name="email"]').value) || '';
      var message = (form.querySelector('[name="message"]') && form.querySelector('[name="message"]').value) || '';
      var subject = encodeURIComponent('Contact from wilservice.us: ' + (name || 'No name'));
      var body = encodeURIComponent('Name: ' + name + '\nReply-to: ' + email + '\n\n' + message);
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Opening email…';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = 'Send another';
          btn.disabled = false;
        }, 2000);
      }
    });
  }
})();
