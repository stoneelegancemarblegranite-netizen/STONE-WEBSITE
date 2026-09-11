/* =============================================================================
   Stone Elegance — shared behaviour for the static sub-pages.

   Deliberately small and defensive. Nothing here is required to read the page:
   the reveal states are only armed after this file runs, so if the script is
   blocked or fails the content stays visible, exactly like the home page.
   ============================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- mobile menu -------------------------------------------------------- */
  var btn = doc.querySelector('[data-menu-button]');
  var panel = doc.querySelector('[data-menu-panel]');

  function setMenu(open) {
    if (!panel || !btn) return;
    panel.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (btn && panel) {
    setMenu(false);
    btn.addEventListener('click', function () {
      setMenu(panel.getAttribute('data-open') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* --- gallery carousel --------------------------------------------------- */
  /* Progressive enhancement: the rail already scrolls and snaps with touch,
     trackpad or keyboard on its own. These buttons only add click paging, and
     they wrap around at either end the way the home page's material rail does. */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-rail-wrap]'), function (wrap) {
    var rail = wrap.querySelector('[data-rail]');
    if (!rail) return;

    function page(dir) {
      var card = rail.querySelector('figure');
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 14;
      var stride = card ? card.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;
      var max = rail.scrollWidth - rail.clientWidth;
      var target = rail.scrollLeft + dir * stride;
      if (dir > 0 && rail.scrollLeft >= max - 4) target = 0;        // wrap to start
      if (dir < 0 && rail.scrollLeft <= 4) target = max;            // wrap to end
      rail.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: reduced ? 'auto' : 'smooth' });
    }

    var prev = wrap.querySelector('[data-rail-prev]');
    var next = wrap.querySelector('[data-rail-next]');
    if (prev) prev.addEventListener('click', function () { page(-1); });
    if (next) next.addEventListener('click', function () { page(1); });
  });

  /* --- scroll reveal ------------------------------------------------------ */
  var targets = doc.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    // Nothing is hidden in this branch — the reveal CSS is never armed.
    return;
  }

  root.setAttribute('data-reveal-on', '');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

  // Safety net: anything still hidden after load (an observer that never fired,
  // an element already past the viewport) is shown unconditionally.
  window.addEventListener('load', function () {
    setTimeout(function () {
      Array.prototype.forEach.call(doc.querySelectorAll('[data-reveal]:not(.is-in)'), function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight) el.classList.add('is-in');
      });
    }, 400);
  });
})();
