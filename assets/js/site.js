/* Las Piñas Doctors Hospital — site.js (vanilla, no dependencies) */
(function () {
  "use strict";

  /* mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    var closeNav = function (restoreFocus) {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a")) closeNav(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && links.classList.contains("open")) {
        event.preventDefault();
        closeNav(true);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && links.classList.contains("open")) closeNav(false);
    });
  }

  /* hero crossfade slideshow */
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dots button");
  if (slides.length > 1) {
    var idx = 0;
    var show = function (n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("on", i === idx); });
      dots.forEach(function (d, i) {
        var selected = i === idx;
        d.classList.toggle("on", selected);
        d.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    };
    show(0);
    var timer = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? null : setInterval(function () { show(idx + 1); }, 5200);
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        clearInterval(timer);
        show(i);
        timer = null; // Manual selection stays selected; avoid unexpected resumed rotation.
      });
    });
  }

  /* animated counters in stats strip */
  var stats = document.querySelectorAll(".stat b[data-count]");
  if (stats.length && "IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        statObs.unobserve(e.target);
        var el = e.target;
        var end = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    stats.forEach(function (s) { statObs.observe(s); });
  }

  /* reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { revObs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* gallery lightbox */
  var galItems = Array.prototype.slice.call(document.querySelectorAll(".gal-item"));
  var lightbox = document.querySelector(".lightbox");
  if (galItems.length && lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbTitle = lightbox.querySelector(".lb-caption h3");
    var lbText = lightbox.querySelector(".lb-caption p");
    var cur = 0;
    var closeButton = lightbox.querySelector(".lb-close");
    var previousFocus = null;

    var openAt = function (i) {
      cur = (i + galItems.length) % galItems.length;
      var item = galItems[cur];
      lbImg.src = item.querySelector("img").src;
      lbImg.alt = item.getAttribute("data-title") || "";
      lbTitle.textContent = item.getAttribute("data-title") || "";
      lbText.textContent = item.getAttribute("data-desc") || "";
      var justOpened = !lightbox.classList.contains("open");
      if (justOpened) previousFocus = document.activeElement;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      if (justOpened) closeButton.focus();
    };
    var close = function () {
      if (!lightbox.classList.contains("open")) return;
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    };

    galItems.forEach(function (item, i) {
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.setAttribute("aria-haspopup", "dialog");
      item.setAttribute("aria-label", "View " + (item.getAttribute("data-title") || "hospital photo"));
      item.addEventListener("click", function () { openAt(i); });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openAt(i);
        }
      });
    });
    closeButton.addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", function () { openAt(cur - 1); });
    lightbox.querySelector(".lb-next").addEventListener("click", function () { openAt(cur + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); openAt(cur - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); openAt(cur + 1); }
      if (e.key === "Tab") {
        var controls = [closeButton, lightbox.querySelector(".lb-prev"), lightbox.querySelector(".lb-next")];
        var first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        } else if (!lightbox.contains(document.activeElement)) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* Static demonstration: never claim a message was delivered without a backend. */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form-note");
      if (!note) return;
      note.textContent = "Not sent: this static website has no connected message-delivery service. " +
        "Your entries remain on this page and have not been submitted. " +
        "Please use a verified official hospital contact channel instead.";
      note.classList.add("show");
      note.scrollIntoView({ behavior: "auto", block: "nearest" });
    });
  }
})();
