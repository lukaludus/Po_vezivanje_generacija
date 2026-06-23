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

  /* ---------- Brojač rezultata (vrti se pri skrolu) ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var formatNum = function (n) {
      // grupisanje hiljada razmakom: 171 210
      return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    var animate = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduce) { el.textContent = formatNum(target); return; }
      if (el._raf) cancelAnimationFrame(el._raf);
      var dur = 1700, start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = formatNum(target * eased);
        if (p < 1) el._raf = requestAnimationFrame(step);
        else { el.textContent = formatNum(target); el._raf = null; }
      };
      el._raf = requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
          } else {
            // resetuj da se ponovo izvrti pri sledećem skrolu do sekcije
            if (entry.target._raf) { cancelAnimationFrame(entry.target._raf); entry.target._raf = null; }
            entry.target.textContent = formatNum(0);
          }
        });
      }, { threshold: 0.45 });
      counters.forEach(function (el) { io.observe(el); });
    } else {
      counters.forEach(animate);
    }
  }

  /* ---------- Galerija / lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCount = document.getElementById('lightboxCount');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lbIndex = 0;
  var lbLastFocused = null;

  function showLightbox(i) {
    if (!galleryItems.length) return;
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    var item = galleryItems[lbIndex];
    var src = item.getAttribute('data-full');
    var img = item.querySelector('img');
    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', img ? img.getAttribute('alt') : '');
    if (lightboxCount) lightboxCount.textContent = (lbIndex + 1) + ' / ' + galleryItems.length;
  }

  function openLightbox(i) {
    if (!lightbox) return;
    lbLastFocused = document.activeElement;
    showLightbox(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.setAttribute('src', '');
    document.body.style.overflow = '';
    if (lbLastFocused && lbLastFocused.focus) lbLastFocused.focus();
  }

  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
  });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-close]')) { closeLightbox(); return; }
      if (e.target.closest('[data-lb-prev]')) { showLightbox(lbIndex - 1); return; }
      if (e.target.closest('[data-lb-next]')) { showLightbox(lbIndex + 1); return; }
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
      else if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
    });
  }

  /* ---------- Deljenje (Web Share + fallback kopiranje) ---------- */
  var shareData = {
    title: document.title,
    text: '(Po)vezivanje generacija — donatorska akcija za studentske medije',
    url: (function () {
      var c = document.querySelector('link[rel="canonical"]');
      return (c && c.href) || window.location.href;
    })()
  };

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-share]');
    if (!btn) return;
    e.preventDefault();

    if (navigator.share) {
      navigator.share(shareData).catch(function () { /* korisnik otkazao — ignoriši */ });
      return;
    }

    var done = function () {
      var original = btn.getAttribute('data-label') || btn.textContent;
      if (!btn.getAttribute('data-label')) btn.setAttribute('data-label', original);
      btn.textContent = 'Link kopiran ✓';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = btn.getAttribute('data-label');
        btn.disabled = false;
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url).then(done).catch(function () {
        window.prompt('Kopiraj link:', shareData.url);
      });
    } else {
      window.prompt('Kopiraj link:', shareData.url);
    }
  });

  /* ---------- Senka na nav-u pri skrolovanju ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Aktivna sekcija u navigaciji (scroll-spy) ---------- */
  if ('IntersectionObserver' in window) {
    var navAnchors = Array.prototype.slice.call(
      document.querySelectorAll('.nav__links a[href^="#"]')
    );
    // mapa: id sekcije -> link
    var linkById = {};
    var spyTargets = [];
    navAnchors.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var section = document.getElementById(id);
      if (!section) return;
      linkById[id] = a;
      spyTargets.push(section);
    });

    if (spyTargets.length) {
      var setActive = function (id) {
        navAnchors.forEach(function (a) { a.classList.remove('is-active'); });
        if (linkById[id]) linkById[id].classList.add('is-active');
      };

      var spy = new IntersectionObserver(function (entries) {
        // odaberi sekciju koja je najviše u vidnom polju
        var best = null;
        entries.forEach(function (entry) {
          if (entry.isIntersecting &&
              (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        });
        if (best) setActive(best.target.id);
      }, { rootMargin: '-64px 0px -55% 0px', threshold: [0.15, 0.4, 0.75] });

      spyTargets.forEach(function (el) { spy.observe(el); });
    }
  }
})();
