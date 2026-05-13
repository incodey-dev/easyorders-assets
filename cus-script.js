/* =========================================
   PREMIUM ARABIC COSMETICS FUNNEL — JS
   Version: 2.5.0 — EasyOrders Compatible
   Pure Vanilla JS — No Dependencies
   Architecture: Delegated Events + Idempotent Init
   ========================================= */

(function () {
  'use strict';

  var VERSION = '2.5.0';
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
    initProductTitleSync();
    initTotalSync();
    initUpsellCarousel();
    initUpsellNativeActions();
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
  // PRODUCT TITLE — robust best-effort sync
  // ═══════════════════════════════════════
  // EasyOrders Funnel Builder does NOT document an official product-title hook.
  // Liquid is NOT supported in funnels (only Mustache.js for gallery).
  // We attempt safe sync from already-rendered page data only.
  // No API calls, no API keys, no client-side EasyOrders API.
  //
  // IMPORTANT: This code NEVER accepts store/brand names like "LUNIVA"
  // as a product title. If no reliable source is found, the manual
  // data-fallback-title is used and data-title-synced remains "false".

  // Blocked title candidates — these are NEVER accepted as product title
  var BLOCKED_TITLE_SUBSTRINGS = [
    'luniva',
    'لونيفا',
    'جمالك',
    'بالطريقة الصحيحة',
    'اطلبي',
    'منتجات مقترحة',
    'كمّلي روتينك',
    'آراء العملاء',
    'المميزات',
    'سياسة الخصوصية',
    'شروط الاستخدام',
    'سياسة الاسترداد',
    'اتصل بنا',
    'تواصلي معنا',
    'الدفع عند الاستلام',
    'الأكثر مبيعاً',
    'شوفي المنتج',
    'أضيفي للسلة',
    'اختاري الدرجة'
  ];

  function isInvalidTitleCandidate(value, fallback) {
    if (!value) return true;
    value = String(value).trim();
    if (!value) return true;
    // Too long to be a product name
    if (value.length > 100) return true;
    // Same as fallback — no point replacing
    if (value === fallback) return true;

    var lower = value.toLowerCase();

    // Block known brand/store/section names
    for (var i = 0; i < BLOCKED_TITLE_SUBSTRINGS.length; i++) {
      if (lower.indexOf(BLOCKED_TITLE_SUBSTRINGS[i].toLowerCase()) !== -1) return true;
    }

    // Block anything that looks like a brand line "لونيفا — LUNIVA"
    if (lower.indexOf('—') !== -1 && (lower.indexOf('luniva') !== -1 || lower.indexOf('لونيفا') !== -1)) return true;

    return false;
  }

  function syncProductTitleFromEasyOrders() {
    var titleEl = document.getElementById('eo-product-title');
    if (!titleEl) return;

    var fallback = titleEl.getAttribute('data-fallback-title') || titleEl.textContent.trim();
    var currentSynced = titleEl.getAttribute('data-title-synced');

    // If already successfully synced, don't overwrite
    if (currentSynced === 'true') return;

    var title = findReliableSelectedProductTitle(fallback);

    if (title && !isInvalidTitleCandidate(title, fallback)) {
      titleEl.textContent = title;
      titleEl.setAttribute('data-title-synced', 'true');
    } else {
      // Ensure fallback is displayed and mark as not synced
      if (!titleEl.textContent.trim()) {
        titleEl.textContent = fallback;
      }
      titleEl.setAttribute('data-title-synced', 'false');
    }
  }

  function findReliableSelectedProductTitle(fallback) {
    // 1. Official/native EasyOrders product name hooks
    //    .product_name is the official EasyOrders class for product titles on store pages.
    //    If EasyOrders renders a product name element in the funnel, it would use this class.
    var selectors = [
      '.product_name',
      '[data-product-name]',
      '[data-product-title]',
      '#productName',
      '#product-name',
      '#eo-product-name'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];

        // Skip our own title element
        if (node.id === 'eo-product-title') continue;
        // Skip upsell section — upsell product names must not pollute main title
        if (node.closest && node.closest('#upsell-products')) continue;
        // Skip .product-brand — this is the brand line "لونيفا — LUNIVA", not the product name
        if (node.closest && node.closest('.product-brand')) continue;
        // Skip header/footer/logo areas
        if (node.closest && node.closest('header')) continue;
        if (node.closest && node.closest('footer')) continue;
        if (node.closest && node.closest('.header-brand')) continue;
        if (node.closest && node.closest('.footer-brand')) continue;
        if (node.closest && node.closest('.footer-logo')) continue;
        if (node.closest && node.closest('.footer-social')) continue;
        // Skip hero headline area
        if (node.closest && node.closest('.hero-headline')) continue;

        var value =
          node.getAttribute('data-product-name') ||
          node.getAttribute('data-product-title') ||
          node.textContent;

        if (!isInvalidTitleCandidate(value, fallback)) {
          return String(value).trim();
        }
      }
    }

    // 2. Checkout hidden/input fields — must be very strict
    var checkout = document.getElementById('checkout-form');
    if (checkout) {
      var inputs = checkout.querySelectorAll('input[type="hidden"], input');
      for (var k = 0; k < inputs.length; k++) {
        var key = ((inputs[k].name || '') + ' ' + (inputs[k].id || '')).toLowerCase();
        var val = inputs[k].value;

        var looksProductNameField =
          key.indexOf('product_name') !== -1 ||
          key.indexOf('productname') !== -1 ||
          key.indexOf('product-title') !== -1 ||
          key.indexOf('product_title') !== -1 ||
          key.indexOf('item_name') !== -1;

        if (looksProductNameField && !isInvalidTitleCandidate(val, fallback)) {
          return String(val).trim();
        }
      }
    }

    // 3. JSON / Next data — selected product only, exclude upsell cards/store brand
    var nextScript = document.getElementById('__NEXT_DATA__');
    if (nextScript && nextScript.textContent) {
      try {
        var data = JSON.parse(nextScript.textContent);
        var fromJson = findSelectedProductTitleInJson(data, fallback);
        if (fromJson) return fromJson;
      } catch (e) { /* ignore parse errors */ }
    }

    // 4. Known EasyOrders global product objects
    var globalCandidates = [
      window.__EO_PRODUCT__,
      window.__PRODUCT__,
      window.product,
      window.currentProduct
    ];

    for (var g = 0; g < globalCandidates.length; g++) {
      var globalTitle = extractTitleFromObject(globalCandidates[g], fallback);
      if (globalTitle) return globalTitle;
    }

    return null;
  }

  function findSelectedProductTitleInJson(obj, fallback, depth) {
    depth = depth || 0;
    if (!obj || depth > 6) return null;

    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        var arrResult = findSelectedProductTitleInJson(obj[i], fallback, depth + 1);
        if (arrResult) return arrResult;
      }
      return null;
    }

    if (typeof obj === 'object') {
      // Prefer objects that look like a product (have product signals)
      var hasProductSignals =
        (obj.id || obj.slug || obj.price || obj.sale_price || obj.images || obj.image) &&
        !obj.is_upsell &&
        !obj.isUpsell;

      if (hasProductSignals) {
        var candidate = obj.name || obj.title || obj.product_name || obj.productName;
        if (!isInvalidTitleCandidate(candidate, fallback)) {
          return String(candidate).trim();
        }
      }

      for (var key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        var result = findSelectedProductTitleInJson(obj[key], fallback, depth + 1);
        if (result) return result;
      }
    }

    return null;
  }

  function extractTitleFromObject(obj, fallback) {
    if (!obj || typeof obj !== 'object') return null;
    var keys = ['name', 'title', 'product_name', 'productName'];
    for (var i = 0; i < keys.length; i++) {
      if (!isInvalidTitleCandidate(obj[keys[i]], fallback)) return String(obj[keys[i]]).trim();
    }
    return findSelectedProductTitleInJson(obj, fallback);
  }

  function initProductTitleSync() {
    syncProductTitleFromEasyOrders();

    // Retry at staggered intervals to catch late hydration
    var attempts = [300, 800, 1500, 3000, 5000];
    for (var i = 0; i < attempts.length; i++) {
      setTimeout(syncProductTitleFromEasyOrders, attempts[i]);
    }

    // MutationObserver for dynamic DOM changes
    if (!window.__lunivaTitleObserverStarted) {
      window.__lunivaTitleObserverStarted = true;
      var startedAt = Date.now();
      var observer = new MutationObserver(function () {
        syncProductTitleFromEasyOrders();
        if (Date.now() - startedAt > 10000) observer.disconnect();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
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
  // UPSELL PRODUCTS CAROUSEL — arrows only
  // ═══════════════════════════════════════
  // Progressive enhancement: prev/next buttons only.
  // Does not fetch products. Does not use API.
  // Add-to-cart is handled by initUpsellNativeActions() below.
  function initUpsellCarousel() {
    var sections = document.querySelectorAll('#upsell-products');
    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      if (section.__upsellInit) continue;
      section.__upsellInit = true;

      var track = section.querySelector('[data-upsell-track]');
      var prev = section.querySelector('.upsell-prev');
      var next = section.querySelector('.upsell-next');
      if (!track) continue;

      function scrollByCard(direction) {
        var card = track.querySelector('.upsell-product-card');
        var amount = card ? card.getBoundingClientRect().width + 18 : 280;
        track.scrollBy({ left: direction * amount, behavior: 'smooth' });
      }

      if (prev) prev.addEventListener('click', function () { scrollByCard(1); });
      if (next) next.addEventListener('click', function () { scrollByCard(-1); });
    }
  }

  // ═══════════════════════════════════════
  // UPSELL NATIVE ADD-TO-CART ACTIONS
  // ═══════════════════════════════════════
  // Strategy:
  // 1. Try native EasyOrders CustomEvent('quick-add') — works if the funnel
  //    page shares the React storefront context (e.g., embedded in store layout).
  // 2. Try native EasyOrders CustomEvent('quick-view') — opens the official
  //    HeadlessUI product preview modal (#headlessui-portal-root).
  // 3. Fallback: Navigate to the product page URL.
  //
  // We do NOT create custom modals, fake AJAX, or call EasyOrders APIs.
  // The .add_to_cart_btn class is included on buttons for EasyOrders theme
  // compatibility, but the actual trigger is via CustomEvent dispatch.

  function initUpsellNativeActions() {
    if (window.__lunivaUpsellNativeBound) return;
    window.__lunivaUpsellNativeBound = true;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-upsell-add-to-cart]');
      if (!btn) return;

      var productId = btn.getAttribute('data-product-id');
      var productSlug = btn.getAttribute('data-product-slug');
      var productUrl = btn.getAttribute('data-product-url');
      var hasVariants = btn.getAttribute('data-has-variants') === 'true';

      // If no product ID configured, fall back to product URL
      if (!productId) {
        if (productUrl && productUrl !== '#') {
          e.preventDefault();
          window.location.href = productUrl;
        }
        return;
      }

      // Attempt 1: Try native EasyOrders CustomEvent
      // For products with variants, use 'quick-view' to open the product preview modal
      // For simple products, use 'quick-add' to add directly to cart
      try {
        var eventName = hasVariants ? 'quick-view' : 'quick-add';
        var customEvent = new CustomEvent(eventName, {
          bubbles: true,
          detail: { productId: productId }
        });
        btn.dispatchEvent(customEvent);

        // If the page is a React storefront, the event will be caught by the
        // EasyOrders React event listener on a parent container, and the native
        // modal/cart behavior will handle everything. In that case, we're done.
        //
        // We add a short delay check: if after dispatching, no native handler
        // seems to have responded (heuristic: check if headlessui portal appeared
        // for quick-view, or cart drawer for quick-add), fall back to product URL.
        //
        // However, we can't reliably detect if native handled it, so we use a
        // simpler approach: prevent default navigation and let the event bubble.
        // If native handles it, great. If not, we set a fallback timer.
        if (productUrl && productUrl !== '#') {
          e.preventDefault();
          // Fallback timer: if no native handler responded in 800ms, navigate
          setTimeout(function () {
            // Check if a HeadlessUI dialog appeared (for quick-view)
            var portalRoot = document.getElementById('headlessui-portal-root');
            var nativeModalOpen = portalRoot && portalRoot.querySelector('[data-headlessui-portal]') &&
              portalRoot.querySelector('[role="dialog"]');
            // Check if cart drawer appeared (for quick-add)
            var cartOpen = document.querySelector('[data-cart="panel"]');

            if (!nativeModalOpen && !cartOpen) {
              window.location.href = productUrl;
            }
          }, 800);
        } else {
          e.preventDefault();
        }
      } catch (err) {
        // CustomEvent dispatch failed (very old browser?) — fall back to URL
        if (productUrl && productUrl !== '#') {
          e.preventDefault();
          window.location.href = productUrl;
        }
      }
    }, true);
  }

  // ═══════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════
  ready(initFunnel);
  ready(initViewing);

  // Re-init when EasyOrders gallery renders
  window.addEventListener('eo:gallery-rendered', function () {
    initPriceSync();
    syncProductTitleFromEasyOrders();
    initTotalSync();
    initUpsellCarousel();
  });

})();
