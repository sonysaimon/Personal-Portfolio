/* Site interactions: mobile nav, archive filter, entry gallery, footer year. */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");

  function setNav(open) {
    navList.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.textContent = open ? "Close" : "Menu";
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      setNav(!navList.classList.contains("is-open"));
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNav(false);
    });
    document.addEventListener("click", function (event) {
      if (header && !header.contains(event.target)) setNav(false);
    });
  }

  /* ---------- Archive filter ---------- */
  var filterList = document.querySelector("[data-filter-list]");
  var filterGrid = document.querySelector("[data-filter-grid]");
  if (filterList && filterGrid) {
    var buttons = filterList.querySelectorAll(".filter-btn");
    var items = filterGrid.querySelectorAll(".grid-item");
    var emptyNote = document.querySelector("[data-filter-empty]");

    filterList.addEventListener("click", function (event) {
      var btn = event.target.closest(".filter-btn");
      if (!btn) return;
      var wanted = btn.getAttribute("data-filter");

      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });

      var shown = 0;
      items.forEach(function (item) {
        var match = wanted === "all" || item.getAttribute("data-category") === wanted;
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (emptyNote) emptyNote.hidden = shown > 0;
    });
  }

  /* ---------- Entry gallery thumbnails ---------- */
  var thumbs = document.querySelector("[data-thumbs]");
  var mainImage = document.querySelector("[data-main-image]");
  if (thumbs && mainImage) {
    thumbs.addEventListener("click", function (event) {
      var btn = event.target.closest("button");
      if (!btn) return;
      var img = btn.querySelector("img");
      if (!img) return;
      mainImage.src = img.getAttribute("src");
      mainImage.alt = img.getAttribute("alt") || "";
      thumbs.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  }
})();
