/* =========================================
   PREMIUM ARABIC COSMETICS FUNNEL — JS
   Version: 2.2.0 — EasyOrders Compatible
   Pure Vanilla JS — No Dependencies
   Architecture: Delegated Events + Idempotent Init
   ========================================= */

(function () {
  'use strict';

  var VERSION = '2.3.0';
  var countdownInterval = null;

  // ─── Version marker for debugging ───
  document.documentElement.setAttribute('data-luniva-funnel-js', VERSION);

  // ─── Robust ready helper ───
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
    window.addEventListener('load', fn, { once: true });
    setTimeout(fn, 500);
    setTimeout(fn, 1500);
  }

  // ─── Main Init (idempotent) ───
  function initFunnel() {
    bindDelegatedEventsOnce();
    initReveal();
    initHeaderScroll();
    initCountdown();
    initStickyBar();
    initCounters();
    initScarcity();
    initPriceSync();
    syncProductTitleSafe();
    initTotalSync();
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

    var openItems = document.querySelectorAll('.faq-item.open');
    for (var i = 0; i < openItems.length; i++) {
      if (openItems[i] !== item) openItems[i].classList.remove('open');
    }

    if (wasOpen) {
      item.classList.remove('open');
    } else {
      item.classList.add('open');
    }
  }

  function bindDelegatedEventsOnce() {
    if (window.__lunivaFinalEventsBound) return;
    window.__lunivaFinalEventsBound = true;

    document.addEventListener('click', function (e) {
      handleFaqToggleEvent(e);
      handleReviewFilterClick(e);
      handleLoadMoreReviewsClick(e);
      handleGalleryThumbClick(e);
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

  // ─── FAQ Accordion (delegated) ─── (legacy — now handled by handleFaqToggleEvent above)

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
      // Don't touch hidden-card display logic from load-more
      var isHiddenByDefault = card.classList.contains('hidden-card') && card.classList.contains('is-hidden-by-default');

      if (category === 'all' || card.getAttribute('data-category') === category) {
        // Show card (unless it's hidden by default load-more)
        if (!isHiddenByDefault) {
          card.classList.remove('is-hidden-by-filter');
          card.classList.add('is-visible-review');
        }
      } else {
        // Hide by filter
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

    // Check remaining
    var remaining = document.querySelectorAll('.review-card.hidden-card.is-hidden-by-default');
    if (remaining.length === 0) {
      btn.style.display = 'none';
    }
  }

  // ─── Gallery Thumbnail Click (delegated) ───
  function handleGalleryThumbClick(e) {
    var thumb = e.target.closest('.thumb, .thumbnail-item');
    if (!thumb) return;

    // Must be inside the product gallery
    var thumbsContainer = thumb.closest('.product-thumbnails, .thumbnails-container');
    if (!thumbsContainer) return;

    // Update active states on thumbs
    var allThumbs = thumbsContainer.querySelectorAll('.thumb, .thumbnail-item');
    for (var i = 0; i < allThumbs.length; i++) {
      allThumbs[i].classList.remove('active');
    }
    thumb.classList.add('active');

    // Update main image carousel
    var slideIndex = thumb.getAttribute('data-bs-slide-to');
    if (slideIndex !== null) {
      var mainImageContainer = document.querySelector('.product-main-image, .carousel-container.product-main-image');
      if (!mainImageContainer) return;
      var items = mainImageContainer.querySelectorAll('.carousel-item');
      for (var j = 0; j < items.length; j++) {
        items[j].classList.remove('active');
      }
      var targetItem = items[parseInt(slideIndex, 10)];
      if (targetItem) targetItem.classList.add('active');
    }
  }

  // ─── Smooth Scroll for Anchor Links (delegated) ───
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
  // HEADER — Scroll Glassmorphism
  // ═══════════════════════════════════════
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ═══════════════════════════════════════
  // COUNTDOWN TIMER — robust with localStorage fallback
  // ═══════════════════════════════════════
  function initCountdown() {
    var countdownTimer = document.querySelector('.upsell-countdown .countdown-timer');
    if (!countdownTimer) return;

    // Clear any previous interval
    if (window.__lunivaCountdownInterval) {
      clearInterval(window.__lunivaCountdownInterval);
    }

    var STORAGE_KEY = 'luniva_funnel_countdown_end';
    var endTime;

    try {
      endTime = localStorage.getItem(STORAGE_KEY);
      if (!endTime) {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, endTime);
      } else {
        endTime = parseInt(endTime, 10);
      }
    } catch (e) {
      // localStorage blocked (private browser, iframe, etc.)
      endTime = Date.now() + 24 * 60 * 60 * 1000;
    }

    var hoursEl = countdownTimer.querySelector('.hours-value');
    var minutesEl = countdownTimer.querySelector('.minutes-value');
    var secondsEl = countdownTimer.querySelector('.seconds-value');

    function updateCountdown() {
      var now = Date.now();
      var diff = Math.max(0, Math.floor((endTime - now) / 1000));

      var hours = Math.floor(diff / 3600);
      diff %= 3600;
      var minutes = Math.floor(diff / 60);
      var seconds = diff % 60;

      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

      if (diff <= 0) {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        try {
          localStorage.setItem(STORAGE_KEY, endTime);
        } catch (e) {
          // Ignore storage errors
        }
      }
    }

    updateCountdown();
    window.__lunivaCountdownInterval = setInterval(updateCountdown, 1000);
  }

  // ═══════════════════════════════════════
  // MOBILE STICKY CTA BAR
  // ═══════════════════════════════════════
  function initStickyBar() {
    var mobileBar = document.querySelector('.mobile-sticky-bar');
    if (!mobileBar) return;

    var stickyThreshold = 500;
    var scrollHandlerBound = false;

    function onScroll() {
      if (window.scrollY > stickyThreshold) {
        mobileBar.classList.add('visible');
        document.body.classList.add('sticky-bar-active');
      } else {
        mobileBar.classList.remove('visible');
        document.body.classList.remove('sticky-bar-active');
      }
    }

    if (window.innerWidth <= 768) {
      window.addEventListener('scroll', onScroll, { passive: true });
      scrollHandlerBound = true;
      onScroll();
    }

    // Handle resize
    window.addEventListener('resize', function () {
      if (window.innerWidth <= 768 && !scrollHandlerBound) {
        window.addEventListener('scroll', onScroll, { passive: true });
        scrollHandlerBound = true;
        onScroll();
      }
    }, { passive: true });
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
  // STOCK SCARCITY BAR
  // ═══════════════════════════════════════
  function initScarcity() {
    var scarcityFill = document.querySelector('.scarcity-fill');
    if (!scarcityFill) return;

    var scarcityParent = scarcityFill.closest('.stock-scarcity');
    if (!scarcityParent) return;

    // Only animate if not already animated
    if (scarcityFill.style.width && scarcityFill.style.width !== '0px') return;

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var fillValue = scarcityFill.getAttribute('data-fill');
          if (fillValue) {
            setTimeout(function () {
              scarcityFill.style.width = fillValue + '%';
            }, 300);
          }
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.3 });

    observer.observe(scarcityParent);
  }

  // ═══════════════════════════════════════
  // PRICE SYNC — sticky bar from #price
  // ═══════════════════════════════════════
  function initPriceSync() {
    syncFixedPrice();

    // Observe #price for EasyOrders updates
    var priceBlock = document.getElementById('price');
    if (priceBlock && !priceBlock.__lunivaObserved) {
      priceBlock.__lunivaObserved = true;
      var priceObserver = new MutationObserver(function () {
        syncFixedPrice();
      });
      priceObserver.observe(priceBlock, { childList: true, subtree: true, characterData: true });
    }

    // Also watch gallery render for price sync
    var galleryEl = document.getElementById('carouselExampleIndicators');
    if (galleryEl && !galleryEl.__lunivaPriceObserved) {
      galleryEl.__lunivaPriceObserved = true;
      var galleryObserver = new MutationObserver(function () {
        syncFixedPrice();
      });
      galleryObserver.observe(galleryEl, { childList: true, subtree: true });
    }
  }

  function syncFixedPrice() {
    // Use scoped selectors — never global getElementById for potentially duplicated IDs
    var salePriceEl = document.querySelector('#price #salePrice');
    var basePriceEl = document.querySelector('#price #basePrice');
    var fixedSale = document.getElementById('salePrice-fixed');
    var fixedBase = document.getElementById('basePrice-fixed');

    if (salePriceEl && fixedSale && salePriceEl.textContent.trim()) {
      fixedSale.textContent = salePriceEl.textContent;
    }
    if (basePriceEl && fixedBase && basePriceEl.textContent.trim()) {
      fixedBase.textContent = basePriceEl.textContent;
    }
  }

  // ═══════════════════════════════════════
  // PRODUCT TITLE — safe best-effort sync
  // ═══════════════════════════════════════
  // EasyOrders funnel docs do not document an official dynamic product-title hook.
  // We attempt safe sync from already-rendered page data only.
  // No API calls, no API keys, no client-side EasyOrders API.
  function syncProductTitleSafe() {
    var titleEl = document.getElementById('eo-product-title');
    if (!titleEl) return;

    // Strategy 1: Check if EasyOrders rendered a product title element elsewhere
    var eoTitle = document.querySelector('[data-vvveb-disabled] .product-title, .eo-product-title, #eo-product-name');
    if (eoTitle && eoTitle.textContent.trim()) {
      titleEl.textContent = eoTitle.textContent.trim();
      return;
    }

    // Strategy 2: Check document.title / meta og:title if it clearly contains product name
    var metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle && metaOgTitle.getAttribute('content')) {
      var ogContent = metaOgTitle.getAttribute('content').trim();
      // Only use if it's not the generic site title
      if (ogContent && ogContent !== document.title && ogContent.length < 100) {
        // Don't override if current text already looks like a product name
        if (!titleEl.textContent.trim() || titleEl.textContent.trim() === 'سيروم التوهج المطفّر') {
          // og:title might include site name suffix, but we can't parse reliably — skip unless very short
        }
      }
    }

    // Strategy 3: Check for global EasyOrders page data
    // (Only if EasyOrders exposes window.__EO_PRODUCT__ or similar)
    if (window.__EO_PRODUCT__ && window.__EO_PRODUCT__.name) {
      titleEl.textContent = window.__EO_PRODUCT__.name;
      return;
    }

    // Fallback: keep the existing editable text inside the element
  }

  // ═══════════════════════════════════════
  // TOTAL COST SYNC — mirror #totalCost to #productTotalMirror
  // ═══════════════════════════════════════
  function syncTotalMirrors() {
    var officialTotal = document.getElementById('totalCost');
    var productMirror = document.getElementById('productTotalMirror');
    if (officialTotal && productMirror && officialTotal.textContent.trim()) {
      productMirror.textContent = officialTotal.textContent.trim();
    }
  }

  function initTotalSync() {
    syncTotalMirrors();
    var officialTotal = document.getElementById('totalCost');
    if (officialTotal && !officialTotal.__lunivaTotalObserved) {
      officialTotal.__lunivaTotalObserved = true;
      new MutationObserver(syncTotalMirrors).observe(officialTotal, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
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
  ready(initFunnel);
  ready(initViewing);

  // Re-init when EasyOrders gallery renders
  window.addEventListener('eo:gallery-rendered', function () {
    initPriceSync();
    syncProductTitleSafe();
    initTotalSync();
  });

})();
