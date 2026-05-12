/* =========================================
   PREMIUM ARABIC COSMETICS FUNNEL — JS
   Version: 2.0
   Pure Vanilla JS — No Dependencies
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ─── Page Loader ───
  const pageLoader = document.querySelector('.page-loader');
  if (pageLoader) {
    setTimeout(() => {
      pageLoader.classList.add('hidden');
      setTimeout(() => pageLoader.remove(), 400);
    }, 300);
  }

  // ─── IntersectionObserver — Section Reveal ───
  const revealSections = document.querySelectorAll('.section-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealSections.forEach(section => revealObserver.observe(section));

  // ─── Header — Scroll Glassmorphism ───
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  function onHeaderScroll() {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    lastScroll = scrollY;
  }
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── Product Image Gallery ───
  const mainImage = document.querySelector('.product-main-image');
  const thumbs = document.querySelectorAll('.product-thumbnails .thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', function () {
      thumbs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      // Simulate image change with fade
      if (mainImage) {
        mainImage.style.opacity = '0';
        setTimeout(() => {
          mainImage.style.opacity = '1';
        }, 200);
      }
    });
  });

  // ─── Quantity Selector ───
  const qtyDisplay = document.querySelector('.qty-value');
  let qty = 1;

  document.querySelectorAll('.product-quantity button').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.dataset.action === 'increase') {
        qty = Math.min(qty + 1, 10);
      } else if (this.dataset.action === 'decrease') {
        qty = Math.max(qty - 1, 1);
      }
      if (qtyDisplay) qtyDisplay.textContent = qty;
      updatePriceSummary();
    });
  });

  // ─── Bundle Cards (Product Section) ───
  const bundleCards = document.querySelectorAll('.bundle-card');
  let selectedBundle = 1; // default: first

  bundleCards.forEach((card, idx) => {
    card.addEventListener('click', function () {
      bundleCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      selectedBundle = idx + 1;
      updatePriceSummary();
    });
  });

  // ─── FAQ Accordion ───
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ─── Review Filter Tabs ───
  const filterPills = document.querySelectorAll('.review-filters .filter-pill');
  const reviewCards = document.querySelectorAll('.review-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', function () {
      filterPills.forEach(p => p.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.filter;
      reviewCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
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
  const loadMoreBtn = document.querySelector('.load-more-reviews button');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      const hiddenCards = document.querySelectorAll('.review-card.hidden-card');
      let shown = 0;
      hiddenCards.forEach(card => {
        if (shown < 3) {
          card.classList.remove('hidden-card');
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
          shown++;
        }
      });
      // Hide button if no more
      const remaining = document.querySelectorAll('.review-card.hidden-card');
      if (remaining.length === 0) {
        loadMoreBtn.style.display = 'none';
      }
    });
  }

  // ─── Stats Counter Animation ───
  const statsNumbers = document.querySelectorAll('.trust-number[data-count]');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, 0, target, 1500);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statsNumbers.forEach(el => statsObserver.observe(el));

  function animateCounter(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current.toLocaleString('ar-EG');
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // ─── Stock Progress Bar Animation ───
  const scarcityFill = document.querySelector('.scarcity-fill');
  if (scarcityFill) {
    const scarcityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            scarcityFill.style.width = scarcityFill.dataset.fill + '%';
          }, 300);
          scarcityObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    scarcityObserver.observe(scarcityFill.closest('.stock-scarcity'));
  }

  // ─── Countdown Timer (24h from first visit, localStorage) ───
  const countdownTimer = document.querySelector('.upsell-countdown .countdown-timer');
  if (countdownTimer) {
    const STORAGE_KEY = 'funnel_countdown_end';
    let endTime = localStorage.getItem(STORAGE_KEY);

    if (!endTime) {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, endTime);
    } else {
      endTime = parseInt(endTime, 10);
    }

    const hoursEl = countdownTimer.querySelector('.hours-value');
    const minutesEl = countdownTimer.querySelector('.minutes-value');
    const secondsEl = countdownTimer.querySelector('.seconds-value');

    function updateCountdown() {
      const now = Date.now();
      let diff = Math.max(0, Math.floor((endTime - now) / 1000));

      const hours = Math.floor(diff / 3600);
      diff %= 3600;
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;

      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

      if (diff <= 0) {
        // Reset timer
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, endTime);
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ─── Mobile Sticky CTA Bar ───
  const mobileBar = document.querySelector('.mobile-sticky-bar');
  if (mobileBar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        mobileBar.classList.add('visible');
      } else {
        mobileBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ─── Order Form — Bundle Selector ───
  const orderBundleOptions = document.querySelectorAll('.order-bundle-selector .bundle-option');
  orderBundleOptions.forEach((option, idx) => {
    option.addEventListener('click', function () {
      orderBundleOptions.forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      selectedBundle = idx + 1;
      updatePriceSummary();
    });
  });

  // ─── Order Form — Price Summary Update ───
  function updatePriceSummary() {
    const prices = [199, 349, 499];
    const shippingEl = document.querySelector('.price-shipping');
    const totalEl = document.querySelector('.price-total-value');

    if (totalEl) {
      const price = prices[selectedBundle - 1] || prices[0];
      totalEl.textContent = price + ' جنيه';
      if (shippingEl) {
        shippingEl.textContent = selectedBundle >= 3 ? 'مجاني ✓' : '50 جنيه';
        if (selectedBundle >= 3) {
          shippingEl.classList.add('free-badge');
        } else {
          shippingEl.classList.remove('free-badge');
        }
      }
      // Update mobile sticky bar price
      const barPrice = document.querySelector('.mobile-sticky-bar .bar-price');
      if (barPrice) {
        barPrice.innerHTML = price + ' جنيه';
      }
    }
  }

  // ─── Order Form — Phone Validation ───
  const phoneInput = document.querySelector('#order-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);
    });
  }

  // ─── Order Form — Submit ───
  const orderForm = document.querySelector('#order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = this.querySelector('#order-name').value.trim();
      const phone = this.querySelector('#order-phone').value.trim();
      const gov = this.querySelector('#order-gov').value;
      const address = this.querySelector('#order-address').value.trim();

      if (!name || !phone || !address) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      if (phone.length !== 11) {
        alert('يرجى إدخال رقم موبايل صحيح (11 رقم)');
        return;
      }

      const submitBtn = this.querySelector('.btn-submit');
      submitBtn.textContent = 'جاري تأكيد الطلب...';
      submitBtn.disabled = true;

      setTimeout(() => {
        alert('تم استلام طلبك بنجاح! سنتواصل معك قريباً لتأكيد الطلب.');
        submitBtn.textContent = 'أكملي الطلب الآن ← الدفع عند الاستلام';
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  // ─── Parallax Hero (subtle) ───
  const heroImage = document.querySelector('.hero-image-placeholder');
  if (heroImage && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImage.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
      }
    }, { passive: true });
  }

  // ─── Viewing Count (simulated) ───
  const viewingEl = document.querySelector('.viewing-count');
  if (viewingEl) {
    function updateViewing() {
      const count = Math.floor(Math.random() * 20) + 35;
      viewingEl.textContent = count;
    }
    updateViewing();
    setInterval(updateViewing, 15000);
  }

  // ─── Initial Selections ───
  // Select first bundle card
  if (bundleCards.length > 0) {
    bundleCards[0].classList.add('selected');
  }
  // Select first order bundle option
  if (orderBundleOptions.length > 0) {
    orderBundleOptions[0].classList.add('selected');
  }
  // Select first thumbnail
  if (thumbs.length > 0) {
    thumbs[0].classList.add('active');
  }

  updatePriceSummary();

});
