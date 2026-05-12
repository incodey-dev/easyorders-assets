/* =========================================
   PREMIUM ARABIC COSMETICS FUNNEL — JS
   Version: 2.1 — EasyOrders Compatible
   Pure Vanilla JS — No Dependencies
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ─── IntersectionObserver — Section Reveal ───
  var revealSections = document.querySelectorAll('.section-reveal');
  if (revealSections.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealSections.forEach(function (section) { revealObserver.observe(section); });
  }

  // ─── Header — Scroll Glassmorphism ───
  var header = document.querySelector('.site-header');
  if (header) {
    function onHeaderScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ─── EasyOrders Gallery — Thumbnail Click (event delegation) ───
  // Works with Mustache-rendered images after initMustache()
  function initGalleryThumbs() {
    var thumbsContainer = document.querySelector('.product-thumbnails');
    var mainImageContainer = document.querySelector('.product-main-image');
    if (!thumbsContainer || !mainImageContainer) return;

    thumbsContainer.addEventListener('click', function (e) {
      var thumb = e.target.closest('.thumb');
      if (!thumb) return;

      // Update active states
      thumbsContainer.querySelectorAll('.thumb').forEach(function (t) {
        t.classList.remove('active');
      });
      thumb.classList.add('active');

      // Update main image carousel
      var slideIndex = thumb.getAttribute('data-bs-slide-to');
      if (slideIndex !== null) {
        var items = mainImageContainer.querySelectorAll('.carousel-item');
        items.forEach(function (item) { item.classList.remove('active'); });
        var targetItem = items[parseInt(slideIndex, 10)];
        if (targetItem) targetItem.classList.add('active');
      }
    });
  }
  initGalleryThumbs();

  // Re-initialize after EasyOrders Mustache renders
  // Watch for DOM changes inside the gallery
  var galleryEl = document.getElementById('carouselExampleIndicators');
  if (galleryEl) {
    var galleryObserver = new MutationObserver(function () {
      initGalleryThumbs();
      syncFixedPrice();
    });
    galleryObserver.observe(galleryEl, { childList: true, subtree: true });
  }

  // ─── Sync Fixed Price from EasyOrders-rendered price ───
  function syncFixedPrice() {
    var salePriceEl = document.getElementById('salePrice');
    var basePriceEl = document.getElementById('basePrice');
    var fixedSale = document.getElementById('salePrice-fixed');
    var fixedBase = document.getElementById('basePrice-fixed');

    if (salePriceEl && fixedSale) {
      fixedSale.textContent = salePriceEl.textContent;
    }
    if (basePriceEl && fixedBase) {
      fixedBase.textContent = basePriceEl.textContent;
    }
  }

  // Also observe the price block for EasyOrders updates
  var priceBlock = document.getElementById('price');
  if (priceBlock) {
    var priceObserver = new MutationObserver(function () {
      syncFixedPrice();
    });
    priceObserver.observe(priceBlock, { childList: true, subtree: true, characterData: true });
  }

  // ─── FAQ Accordion ───
  document.querySelectorAll('.faq-question').forEach(function (question) {
    question.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      if (!item) return;
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ─── Review Filter Tabs ───
  var filterPills = document.querySelectorAll('.review-filters .filter-pill');
  var reviewCards = document.querySelectorAll('.review-card');

  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');

      var category = this.dataset.filter;
      reviewCards.forEach(function (card) {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          requestAnimationFrame(function () {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ─── Load More Reviews ───
  var loadMoreBtn = document.querySelector('.load-more-reviews button');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      var hiddenCards = document.querySelectorAll('.review-card.hidden-card');
      var shown = 0;
      hiddenCards.forEach(function (card) {
        if (shown < 3) {
          card.classList.remove('hidden-card');
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          requestAnimationFrame(function () {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
          shown++;
        }
      });
      var remaining = document.querySelectorAll('.review-card.hidden-card');
      if (remaining.length === 0) {
        loadMoreBtn.style.display = 'none';
      }
    });
  }

  // ─── Stats Counter Animation ───
  var statsNumbers = document.querySelectorAll('.trust-number[data-count]');
  if (statsNumbers.length) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.dataset.count, 10);
          animateCounter(el, 0, target, 1500);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statsNumbers.forEach(function (el) { statsObserver.observe(el); });
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

  // ─── Stock Progress Bar Animation ───
  var scarcityFill = document.querySelector('.scarcity-fill');
  if (scarcityFill) {
    var scarcityParent = scarcityFill.closest('.stock-scarcity');
    if (scarcityParent) {
      var scarcityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              scarcityFill.style.width = scarcityFill.dataset.fill + '%';
            }, 300);
            scarcityObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      scarcityObserver.observe(scarcityParent);
    }
  }

  // ─── Countdown Timer (24h from first visit, localStorage) ───
  var countdownTimer = document.querySelector('.upsell-countdown .countdown-timer');
  if (countdownTimer) {
    var STORAGE_KEY = 'funnel_countdown_end';
    var endTime = localStorage.getItem(STORAGE_KEY);

    if (!endTime) {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, endTime);
    } else {
      endTime = parseInt(endTime, 10);
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
        localStorage.setItem(STORAGE_KEY, endTime);
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ─── Mobile Sticky CTA Bar ───
  var mobileBar = document.querySelector('.mobile-sticky-bar');
  if (mobileBar && window.innerWidth <= 768) {
    var stickyThreshold = 500;
    window.addEventListener('scroll', function () {
      if (window.scrollY > stickyThreshold) {
        mobileBar.classList.add('visible');
        document.body.classList.add('sticky-bar-active');
      } else {
        mobileBar.classList.remove('visible');
        document.body.classList.remove('sticky-bar-active');
      }
    }, { passive: true });
  }

  // ─── Parallax Hero (subtle, desktop only) ───
  var heroImage = document.querySelector('.hero-image-placeholder');
  if (heroImage && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImage.style.transform = 'translateY(' + (scrollY * 0.12) + 'px)';
      }
    }, { passive: true });
  }

  // ─── Viewing Count (simulated) ───
  var viewingEl = document.querySelector('.viewing-count');
  if (viewingEl) {
    function updateViewing() {
      var count = Math.floor(Math.random() * 20) + 35;
      viewingEl.textContent = count;
    }
    updateViewing();
    setInterval(updateViewing, 15000);
  }

  // ─── Initial syncs ───
  syncFixedPrice();

});
