/* Las Piñas Doctors Hospital — site.js (vanilla, no dependencies) */
(function () {
  "use strict";

  /* mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
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
      dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
    };
    var timer = setInterval(function () { show(idx + 1); }, 5200);
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        clearInterval(timer);
        show(i);
        timer = setInterval(function () { show(idx + 1); }, 5200);
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

    var openAt = function (i) {
      cur = (i + galItems.length) % galItems.length;
      var item = galItems[cur];
      lbImg.src = item.querySelector("img").src;
      lbImg.alt = item.getAttribute("data-title") || "";
      lbTitle.textContent = item.getAttribute("data-title") || "";
      lbText.textContent = item.getAttribute("data-desc") || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    };

    galItems.forEach(function (item, i) {
      item.addEventListener("click", function () { openAt(i); });
    });
    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", function () { openAt(cur - 1); });
    lightbox.querySelector(".lb-next").addEventListener("click", function () { openAt(cur + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") openAt(cur - 1);
      if (e.key === "ArrowRight") openAt(cur + 1);
    });
  }

  /* contact form (static site — friendly confirmation, no backend) */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.querySelector(".form-note");
      var name = (document.querySelector("#cf-name").value || "").trim();
      note.textContent = "Thank you" + (name ? ", " + name : "") +
        "! Your message has been noted. For urgent concerns, our emergency room is open 24/7.";
      note.classList.add("show");
      form.reset();
      note.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
})();
