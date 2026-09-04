/* Portfolio interactions: theme toggle, mobile nav, active section, year. */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");
  var themeToggle = document.querySelector(".theme-toggle");
  var yearEl = document.getElementById("year");

  /* ---------- Footer year ---------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Theme ---------- */
  var STORAGE_KEY = "portfolio-theme";
  var mediaDark = window.matchMedia("(prefers-color-scheme: dark)");

  function readStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* storage unavailable; ignore */
    }
  }

  function currentIsDark() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "dark") return true;
    if (explicit === "light") return false;
    return mediaDark.matches;
  }

  function applyTheme(value) {
    if (value === "dark" || value === "light") {
      root.setAttribute("data-theme", value);
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      var dark = currentIsDark();
      themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
      var label = themeToggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = dark ? "Light mode" : "Dark mode";
    }
  }

  applyTheme(readStoredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentIsDark() ? "light" : "dark";
      // If the choice matches the system preference, drop the override
      // so the page keeps following the OS setting.
      if ((next === "dark") === mediaDark.matches) {
        storeTheme(null);
        applyTheme(null);
      } else {
        storeTheme(next);
        applyTheme(next);
      }
    });
  }

  if (mediaDark.addEventListener) {
    mediaDark.addEventListener("change", function () {
      if (!readStoredTheme()) applyTheme(null);
    });
  }

  /* ---------- Mobile nav ---------- */
  function closeNav() {
    if (!navList || !navToggle) return;
    navList.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".nav-toggle-label").textContent = "Menu";
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
    });

    navList.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) closeNav();
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Active section link ---------- */
  var sectionLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-list a[href^="#"]')
  );
  var sections = sectionLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          sectionLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();
