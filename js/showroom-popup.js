/* Showroom "opening soon" announcement.
   Self-contained: injects its own markup and styles so the same file serves
   the Design Canvas home page (loaded after </x-dc>, outside the React root)
   and the static sub-pages. Shows once per browser session, after a short
   delay, and never on the Ads landing page, thanks or redirect pages — those
   simply do not load it.
   To retire it, remove the <script> tag from each page; nothing else
   references it. */
(function () {
  'use strict';

  var KEY = 'se-showroom-popup-v1';
  var DELAY = 2600;
  var PHOTO = '/img/p02.jpg';

  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = [
    '.se-pop{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(13,13,13,.66);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transition:opacity .38s ease}',
    '.se-pop.is-on{opacity:1}',
    '.se-pop-card{position:relative;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);width:100%;max-width:900px;max-height:calc(100vh - 40px);max-height:calc(100dvh - 40px);overflow:hidden;background:#0D0D0D;color:#F4F2EE;border:1px solid rgba(226,184,102,.28);box-shadow:0 40px 120px rgba(0,0,0,.55);transform:translateY(22px) scale(.98);opacity:0;transition:transform .5s cubic-bezier(.22,.61,.36,1),opacity .5s ease}',
    '.se-pop.is-on .se-pop-card{transform:none;opacity:1}',
    '.se-pop-card::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;z-index:2;background:linear-gradient(90deg,#8A5F18,#E2B866,#8A5F18)}',
    '.se-pop-shot{position:relative;min-height:100%;overflow:hidden;background:#141414}',
    '.se-pop-shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:60% 55%;display:block;transform:scale(1.08);transition:transform 1.6s cubic-bezier(.22,.61,.36,1)}',
    '.se-pop.is-on .se-pop-shot img{transform:scale(1)}',
    '.se-pop-shot::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,13,13,0) 45%,rgba(13,13,13,.72) 100%)}',
    '.se-pop-badge{position:absolute;left:22px;bottom:22px;z-index:1;display:inline-flex;align-items:center;gap:9px;padding:9px 14px;background:rgba(13,13,13,.62);border:1px solid rgba(226,184,102,.4);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:600 10.5px/1 Archivo,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#E2B866}',
    '.se-pop-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:#E2B866;box-shadow:0 0 0 0 rgba(226,184,102,.6);animation:sePulse 2.2s ease-out infinite}',
    '@keyframes sePulse{to{box-shadow:0 0 0 9px rgba(226,184,102,0)}}',
    '.se-pop-body{position:relative;padding:52px 48px 44px}',
    '.se-pop-x{position:absolute;top:12px;right:12px;z-index:3;width:42px;height:42px;border:0;background:transparent;color:#F4F2EE;font:300 30px/1 Montserrat,system-ui,sans-serif;cursor:pointer;opacity:.7;transition:opacity .25s,transform .25s}',
    '.se-pop-x:hover,.se-pop-x:focus-visible{opacity:1;transform:rotate(90deg);outline:none}',
    '.se-pop-eyebrow{display:inline-flex;align-items:center;gap:10px;font:600 11px/1 Archivo,system-ui,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#E2B866;margin:0 0 18px}',
    '.se-pop-eyebrow::before{content:"";width:22px;height:1px;background:#E2B866}',
    '.se-pop-h{margin:0 0 14px;font:600 clamp(26px,3vw,34px)/1.12 Montserrat,system-ui,sans-serif;letter-spacing:-.01em;color:#FFF}',
    '.se-pop-h em{font-style:italic;font-weight:300;color:#E2B866}',
    '.se-pop-p{margin:0 0 22px;font:400 15px/1.7 Archivo,system-ui,sans-serif;color:rgba(244,242,238,.78)}',
    '.se-pop-list{list-style:none;margin:0 0 30px;padding:22px 0 0;border-top:1px solid rgba(244,242,238,.12);display:grid;gap:10px}',
    '.se-pop-list li{display:flex;align-items:flex-start;gap:12px;font:400 14px/1.5 Archivo,system-ui,sans-serif;color:rgba(244,242,238,.86)}',
    '.se-pop-list svg{flex:none;width:18px;height:18px;margin-top:2px;color:#E2B866}',
    '.se-pop-actions{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}',
    '.se-pop-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 28px;background:#4E5738;color:#F4F2EE;font:600 13px/1 Archivo,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;transition:background .3s,transform .3s}',
    '.se-pop-cta svg{width:16px;height:16px;transition:transform .3s}',
    '.se-pop-cta:hover,.se-pop-cta:focus-visible{background:#63704A;color:#F4F2EE;transform:translateY(-2px);outline:none}',
    '.se-pop-cta:hover svg{transform:translateX(4px)}',
    '.se-pop-later{border:0;background:transparent;padding:0;color:rgba(244,242,238,.62);font:400 13px/1 Archivo,system-ui,sans-serif;letter-spacing:.06em;text-decoration:underline;text-underline-offset:4px;cursor:pointer;transition:color .25s}',
    '.se-pop-later:hover,.se-pop-later:focus-visible{color:#E2B866;outline:none}',
    '@media (max-width:760px){.se-pop{align-items:flex-end;padding:0}.se-pop-card{grid-template-columns:1fr;max-width:none;max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow:auto;border-left:0;border-right:0;border-bottom:0;transform:translateY(40px)}.se-pop-shot{min-height:0;aspect-ratio:16/10}.se-pop-badge{left:16px;bottom:16px}.se-pop-body{padding:30px 22px 32px}.se-pop-eyebrow{margin-bottom:12px}.se-pop-h{font-size:24px}.se-pop-p{font-size:14px;margin-bottom:18px}.se-pop-list{padding-top:16px;margin-bottom:22px;gap:8px}.se-pop-list li{font-size:13.5px}.se-pop-cta{width:100%}.se-pop-x{top:8px;right:8px;background:rgba(13,13,13,.55);border-radius:50%}}',
    '@media (prefers-reduced-motion:reduce){.se-pop,.se-pop-card,.se-pop-x,.se-pop-cta,.se-pop-shot img{transition:none;transform:none}.se-pop-badge::before{animation:none}}'
  ].join('');

  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var html =
    '<div class="se-pop-card" role="dialog" aria-modal="true" aria-labelledby="se-pop-title" aria-describedby="se-pop-desc">' +
      '<div class="se-pop-shot">' +
        '<img src="' + PHOTO + '" alt="Waterfall quartz island fabricated and installed by Stone Elegance" width="1086" height="1448" decoding="async">' +
        '<span class="se-pop-badge">Clifton, NJ</span>' +
      '</div>' +
      '<div class="se-pop-body">' +
        '<button class="se-pop-x" type="button" aria-label="Close" data-se-close>&times;</button>' +
        '<p class="se-pop-eyebrow">Coming soon</p>' +
        '<h2 class="se-pop-h" id="se-pop-title">Our new showroom is <em>opening soon.</em></h2>' +
        '<p class="se-pop-p" id="se-pop-desc">A dedicated space to see the stone before it becomes your countertop. Until the doors open, we keep fabricating and installing every day.</p>' +
        '<ul class="se-pop-list">' +
          '<li>' + check + 'Full granite, quartz, marble and quartzite slabs on display</li>' +
          '<li>' + check + 'Edge profiles, finishes and sinks you can touch and compare</li>' +
          '<li>' + check + 'One-on-one design help with our team</li>' +
        '</ul>' +
        '<div class="se-pop-actions">' +
          '<a class="se-pop-cta" href="/#contact" data-se-close>Get a free quote' + arrow + '</a>' +
          '<button class="se-pop-later" type="button" data-se-close>Maybe later</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  function open() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'se-pop';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    var prevFocus = document.activeElement;
    var done = false;

    function close() {
      if (done) return;
      done = true;
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      document.removeEventListener('keydown', onKey);
      wrap.classList.remove('is-on');
      var remove = function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      };
      if (reduce) remove(); else setTimeout(remove, 400);
    }

    function onKey(e) { if (e.key === 'Escape') close(); }

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.closest('[data-se-close]')) close();
    });
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wrap.classList.add('is-on');
        var x = wrap.querySelector('.se-pop-x');
        if (x) x.focus({ preventScroll: true });
      });
    });
  }

  function schedule() { setTimeout(open, DELAY); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();
})();
