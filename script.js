(function () {
  const SETTINGS = {
    loadMoreTexts: ["تحميل المزيد", "Load more", "Load More"],
    rootMargin: "900px 0px",
    cooldown: 1500,
    maxClicks: 200,
    debug: false
  };

  let observer = null;
  let mutationObserver = null;
  let currentTarget = null;
  let isLoading = false;
  let clickCount = 0;
  let attachTimer = null;

  function log(...args) {
    if (SETTINGS.debug) {
      console.log("[EasyOrders Infinite Scroll]", ...args);
    }
  }

  function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function isLoadMoreButton(button) {
    if (!button || button.tagName !== "BUTTON") return false;

    const text = normalizeText(button.textContent);

    return SETTINGS.loadMoreTexts.some((label) => text.includes(label));
  }

  function findLoadMoreButton() {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find(isLoadMoreButton) || null;
  }

  function canClick(button) {
    if (!button || !button.isConnected) return false;
    if (button.disabled) return false;
    if (button.getAttribute("aria-disabled") === "true") return false;

    const style = window.getComputedStyle(button);
    if (style.display === "none" || style.visibility === "hidden") return false;

    return true;
  }

  function createOrMoveSentinel(button) {
    let sentinel = document.getElementById("eo-infinite-scroll-sentinel");

    if (!sentinel) {
      sentinel = document.createElement("div");
      sentinel.id = "eo-infinite-scroll-sentinel";
      sentinel.style.width = "100%";
      sentinel.style.height = "1px";
      sentinel.style.pointerEvents = "none";
    }

    const wrapper = button.parentElement || button;

    if (wrapper.nextSibling !== sentinel) {
      wrapper.parentNode.insertBefore(sentinel, wrapper.nextSibling);
    }

    return sentinel;
  }

  function waitForProductsToLoad(oldHeight, oldButton) {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const newHeight = document.documentElement.scrollHeight;
      const buttonChanged = !oldButton.isConnected || findLoadMoreButton() !== oldButton;
      const pageGotLonger = newHeight > oldHeight + 80;
      const timeout = Date.now() - startTime > 8000;

      if (pageGotLonger || buttonChanged || timeout) {
        clearInterval(timer);
        isLoading = false;

        log("Ready for next load");

        setTimeout(() => {
          attachObserver();
        }, 500);
      }
    }, 300);
  }

  function clickLoadMore(button) {
    if (isLoading) return;
    if (!canClick(button)) return;
    if (clickCount >= SETTINGS.maxClicks) return;

    isLoading = true;
    clickCount++;

    const oldHeight = document.documentElement.scrollHeight;

    log("Click load more", clickCount);

    button.click();

    waitForProductsToLoad(oldHeight, button);
  }

  function attachObserver() {
    const button = findLoadMoreButton();

    if (!button) {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      currentTarget = null;
      log("No load more button found");
      return;
    }

    const sentinel = createOrMoveSentinel(button);

    if (currentTarget === sentinel) return;

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      function (entries) {
        const entry = entries[0];

        if (entry && entry.isIntersecting) {
          const latestButton = findLoadMoreButton();

          if (latestButton) {
            clickLoadMore(latestButton);
          }
        }
      },
      {
        root: null,
        rootMargin: SETTINGS.rootMargin,
        threshold: 0
      }
    );

    currentTarget = sentinel;
    observer.observe(sentinel);

    log("Observer attached");
  }

  function scheduleAttach() {
    clearTimeout(attachTimer);
    attachTimer = setTimeout(attachObserver, 300);
  }

  function start() {
    attachObserver();

    mutationObserver = new MutationObserver(scheduleAttach);

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    setInterval(attachObserver, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();