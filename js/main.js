/* (Po)vezivanje generacija — interakcije */
(function () {
  'use strict';

  /* ---------- Mobilni meni ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // zatvori meni na klik linka
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Modalni čitač ---------- */
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modalBody');
  var lastFocused = null;

  function openModal(templateId) {
    var tpl = document.getElementById(templateId);
    if (!tpl || !modal || !modalBody) return;
    lastFocused = document.activeElement;
    modalBody.innerHTML = '';
    modalBody.appendChild(tpl.content.cloneNode(true));
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    // skroluj sadržaj na vrh
    var dialog = modal.querySelector('.modal__dialog');
    if (dialog) dialog.scrollTop = 0;
    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // okidači: bilo koji element sa data-reader
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-reader]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-reader'));
      return;
    }
    if (e.target.closest('[data-close]')) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* ---------- Senka na nav-u pri skrolovanju ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 8) nav.style.boxShadow = '0 6px 20px rgba(23,19,15,.10)';
      else nav.style.boxShadow = 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
