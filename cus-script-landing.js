/* =========================================
   LUNIVA LANDING PAGE — CLEAN JS
   Version: 1.0.0
   Landing-only — No Funnel JS
   Pure Vanilla JS — No Dependencies
   Architecture: Delegated Events + Idempotent Init
   ========================================= */

(function () {
  'use strict';

  var VERSION = '1.0.0';

  // ─── Version marker for debugging ───
  document.documentElement.setAttribute('data-luniva-landing-js', VERSION);

  // ─── Robust ready helper ───
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
    window.addEventListener('load', fn, { once: true });
    setTimeout(fn, 500);
  }

  // ─── Main Init (idempotent) ───
  function initLanding() {
    bindDelegatedEventsOnce();
    initReveal();
    initCounters();
    initViewing();
  }

  // ═══════════════════════════════════════
  // DELEGATED EVENTS — survive EasyOrders hydration
  // ═══════════════════════════════════════
  var lastFaqToggleTime = 0;
  function canToggleFaqNow() {
    var now = Date.now();
    if (now - lastFaqToggleTime < 250) return false;
    lastFaqToggleTime = now;
    return true;
  }

  function handleFaqToggleEvent(e) {
    var question = e.target.closest && e.target.closest('.faq-question');
    if (!question) return;
    if (!canToggleFaqNow()) return;

    e.preventDefault();
    e.stopPropagation();

    var item = question.closest('.faq-item');
    if (!item) return;

    var wasOpen = item.classList.contains('open');

    // Close all other FAQ items
    var openItems = document.querySelectorAll('.faq-item.open');
    for (var i = 0; i < openItems.length; i++) {
      if (openItems[i] !== item) openItems[i].classList.remove('open');
    }

    // Toggle current item
    if (wasOpen) {
      item.classList.remove('open');
    } else {
      item.classList.add('open');
    }
  }

  function bindDelegatedEventsOnce() {
    if (window.__lunivaLandingEventsBound) return;
    window.__lunivaLandingEventsBound = true;

    document.addEventListener('click', function (e) {
      handleFaqToggleEvent(e);
      handleReviewFilterClick(e);
      handleLoadMoreReviewsClick(e);
      handleSmoothScrollClick(e);
    }, true);

    document.addEventListener('pointerup', function (e) {
      handleFaqToggleEvent(e);
    }, true);

    if ('ontouchend' in window) {
      document.addEventListener('touchend', function (e) {
        handleFaqToggleEvent(e);
      }, true);
    }
  }

  // ─── Review Filter Tabs (delegated) ───
  function handleReviewFilterClick(e) {
    var pill = e.target.closest('.review-filters .filter-pill');
    if (!pill) return;

    // Update active pill
    var pills = document.querySelectorAll('.review-filters .filter-pill');
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.remove('active');
    }
    pill.classList.add('active');

    var category = pill.getAttribute('data-filter');
    var cards = document.querySelectorAll('.reviews-masonry .review-card');

    for (var j = 0; j < cards.length; j++) {
      var card = cards[j];
      var isHiddenByDefault = card.classList.contains('hidden-card') && card.classList.contains('is-hidden-by-default');

      if (category === 'all' || card.getAttribute('data-category') === category) {
        if (!isHiddenByDefault) {
          card.classList.remove('is-hidden-by-filter');
          card.classList.add('is-visible-review');
        }
      } else {
        card.classList.add('is-hidden-by-filter');
        card.classList.remove('is-visible-review');
      }
    }
  }

  // ─── Load More Reviews (delegated) ───
  function handleLoadMoreReviewsClick(e) {
    var btn = e.target.closest('.load-more-reviews button');
    if (!btn) return;

    var hiddenCards = document.querySelectorAll('.review-card.hidden-card.is-hidden-by-default');
    var shown = 0;
    for (var i = 0; i < hiddenCards.length; i++) {
      if (shown < 3) {
        var card = hiddenCards[i];
        card.classList.remove('is-hidden-by-default');
        shown++;
      }
    }

    // Hide button if no more hidden cards
    var remaining = document.querySelectorAll('.review-card.hidden-card.is-hidden-by-default');
    if (remaining.length === 0) {
      btn.style.display = 'none';
    }
  }

  // ─── Smooth Scroll for Anchor Links (delegated) ───
  // Only applies to real hash anchors that exist on the page
  function handleSmoothScrollClick(e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    var href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      var offset = 80;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  // ═══════════════════════════════════════
  // SECTION REVEAL — IntersectionObserver
  // ═══════════════════════════════════════
  function initReveal() {
    var sections = document.querySelectorAll('.section-reveal:not(.visible)');
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    for (var i = 0; i < sections.length; i++) {
      observer.observe(sections[i]);
    }
  }

  // ═══════════════════════════════════════
  // STATS COUNTER ANIMATION
  // ═══════════════════════════════════════
  function initCounters() {
    var statsNumbers = document.querySelectorAll('.trust-number[data-count]');
    if (!statsNumbers.length) return;

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var el = entries[i].target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, 0, target, 1500);
          observer.unobserve(el);
        }
      }
    }, { threshold: 0.5 });

    for (var i = 0; i < statsNumbers.length; i++) {
      observer.observe(statsNumbers[i]);
    }
  }

  function animateCounter(el, start, end, duration) {
    var startTime = performance.now();
    function update(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (end - start) * eased);
      el.textContent = current.toLocaleString('ar-EG');
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // ═══════════════════════════════════════
  // VIEWING COUNT (simulated)
  // ═══════════════════════════════════════
  function initViewing() {
    var viewingEl = document.querySelector('.viewing-count');
    if (!viewingEl) return;

    function updateViewing() {
      var count = Math.floor(Math.random() * 20) + 35;
      viewingEl.textContent = count;
    }
    updateViewing();
    setInterval(updateViewing, 15000);
  }

  // ═══════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════
  ready(initLanding);

})();
