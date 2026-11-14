/* Power use cases
 * Three tabs. Desktop and tablet: a thin bar fills along the top of the open tab over 7 seconds, then the
 * next tab opens (round and round) while the section is on screen. Clicking a tab opens it and starts its
 * 7 seconds again; the rotation carries on from there. Phones: a stacked list; the open item shows its photo
 * and text directly under it, as an accordion: tapping an item folds the open one shut and unfolds the tapped one
 * (no auto-switching on phones).
 * Switch: powerUseCases (off: no bar and no auto-switching; the tabs still work when clicked).
 * Webflow elements: .home-usecases_tab ×3 (each with .home-usecases_label, .home-usecases_icon,
 *   .home-usecases_progress), .home-usecases_panel (.home-usecases_card, .home-usecases_photo)
 * Images: Webflow asset URLs below (CDN + file name).
 */
import { RM, ON, $, $$, keyable } from '../core/utils.js';

const CDN = 'https://cdn.prod.website-files.com/6af68d8e7acb8dbd77201062/';
const UC = [
  { k: 'Power generators', t: 'Generation Forecast + Scheduling', d: 'High-accuracy generation forecast and smarter, block-level scheduling decisions across day-ahead and intraday markets.', i: '6af69ac735c5dc2d29c69745_arborum-generation-licensed.jpg', m: '6af69ac61ea333a9ea2210d4_arborum-generation-licensed-m.jpg', p: '50% 50%' },
  { k: 'Power distributors', t: 'Load Forecast + Scheduling', d: 'High-accuracy demand forecasting and intelligent scheduling to balance demand and supply across every block.', i: '6af69ac5505d0468f3762034_arborum-distribution-licensed.jpg', m: '6af69ac5505d0468f3762034_arborum-distribution-licensed.jpg', p: '62% 50%' },
  { k: 'Battery energy storage systems', t: 'Battery Charging + Discharging Optimisation', d: 'AI-powered battery optimisation to maximise returns, reduce deviations and respond dynamically to changing grid conditions.', i: '6af69ac415bf88c09c359668_arborum-bess-licensed.jpg', m: '6af69ac415bf88c09c359668_arborum-bess-licensed.jpg', p: '50% 60%' }
];
const ROTATE_MS = 7000;

export default function initUseCases() {
  const tabs = $$('.home-usecases_tab'), panel = $('.home-usecases_panel');
  if (tabs.length !== 3 || !panel) return;
  const mq = matchMedia('(max-width:767px)');
  const card = $('.home-usecases_card', panel), photo = $('.home-usecases_photo', panel);
  const K = $('.home-usecases_kicker', card), T = $('.home-usecases_title', card), D = $('.home-usecases_text', card);
  const bars = tabs.map(t => $('.home-usecases_progress', t));
  let cur = 0, sw, since = performance.now(), vis = false;
  UC.forEach(u => [u.i, u.m].forEach(s => { const im = new Image(); im.src = CDN + s }));
  card.style.transition = 'opacity 220ms ease, filter 220ms ease'; // a light blur bridges old and new text

  const autoOn = ON('powerUseCases');
  const auto = () => autoOn && vis && !RM && !mq.matches && !document.hidden; // phones: tap only
  // phones: the panel sits right under the open tab, and the photo sits above the text (never behind it)
  function layout() {
    tabs.forEach((t, j) => { t.style.order = mq.matches ? String(j <= cur ? j * 2 : j * 2 + 2) : '' });
    panel.style.order = mq.matches ? String(cur * 2 + 1) : '';
    panel.style.backgroundImage = mq.matches ? 'none' : 'url(' + CDN + UC[cur].i + ')';
    panel.style.backgroundPosition = UC[cur].p;
  }
  // Phones: a real accordion. The open item's content folds shut where it was while the tapped item's content
  // unfolds under it, both at once, so nothing jumps; the page just slides smoothly. (One shared panel in Webflow:
  // a copy of it folds shut in the old place while the real one, with the new content, opens in the new place.)
  const ACC_MS = 320, ACC_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  let ghost = null;
  function accordion(fill) {
    if (ghost) { ghost.remove(); ghost = null }
    const H = panel.offsetHeight, mb = getComputedStyle(panel).marginBottom, oldOrder = panel.style.order;
    if (!RM) {
      ghost = panel.cloneNode(true); ghost.setAttribute('aria-hidden', 'true'); ghost.removeAttribute('id');
      Object.assign(ghost.style, { order: oldOrder, height: H + 'px', overflow: 'hidden', transition: 'none', pointerEvents: 'none' });
      panel.parentElement.appendChild(ghost);
    }
    fill(); layout();
    if (RM) return;
    const h = panel.offsetHeight;
    Object.assign(panel.style, { height: '0px', marginBottom: '0px', overflow: 'hidden', opacity: '0', transition: 'none' });
    void panel.offsetHeight;
    const tr = `height ${ACC_MS}ms ${ACC_EASE}, margin-bottom ${ACC_MS}ms ${ACC_EASE}, opacity ${ACC_MS}ms ease`;
    Object.assign(panel.style, { transition: tr, height: h + 'px', marginBottom: mb, opacity: '1' });
    Object.assign(ghost.style, { transition: tr, height: '0px', marginBottom: '0px', opacity: '0' });
    const g = ghost;
    setTimeout(() => {
      g.remove(); if (ghost === g) ghost = null;
      ['height', 'marginBottom', 'overflow', 'opacity', 'transition'].forEach(k => panel.style[k] = '');
      // if the tapped item slid up under the header, bring it gently back into view
      const t = tabs[cur].getBoundingClientRect().top;
      if (t < 72) { const y = scrollY + t - 80, ln = window.__lenis; if (ln) ln.scrollTo(y, { duration: .5 }); else scrollTo({ top: y, behavior: 'smooth' }) }
    }, ACC_MS + 40);
  }
  function set(i) {
    if (i === cur) return; cur = i; since = performance.now();
    tabs.forEach((t, j) => {
      const on = j === i, l = $('.home-usecases_label', t), ic = $('.home-usecases_icon', t);
      t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on);
      if (l) l.classList.toggle('is-active', on);
      if (ic) { ic.classList.toggle('is-active', on); ic.textContent = on ? '−' : '+' }
    });
    const fill = () => { const u = UC[i]; K.textContent = u.k; T.textContent = u.t; D.textContent = u.d; if (photo) { photo.style.backgroundImage = 'url(' + CDN + u.m + ')'; photo.style.backgroundPosition = u.p } };
    clearTimeout(sw);
    if (mq.matches) { accordion(fill); return }
    card.style.opacity = '0'; card.style.filter = RM ? '' : 'blur(2px)';
    sw = setTimeout(() => { fill(); layout(); card.style.opacity = ''; card.style.filter = '' }, RM ? 0 : 220);
    layout();
  }
  const pick = j => { set(j); since = performance.now() };
  tabs.forEach((t, j) => {
    t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', j === 0);
    t.addEventListener('click', () => pick(j));
    keyable(t, () => pick(j));
  });
  mq.addEventListener('change', layout); layout();
  // the script keeps the tapped item in place itself, so the browser's own scroll anchoring must not add a second shift
  const sec = panel.closest('section'); if (sec) sec.style.overflowAnchor = 'none';

  new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !vis) since = performance.now(); vis = v }, { threshold: .3 }).observe(panel);

  // progress bars: the open tab's bar fills over ROTATE_MS, then the next tab opens
  (function loop(t) {
    let p = 1;
    if (auto()) { p = Math.min(1, (t - since) / ROTATE_MS); if (p >= 1) { set((cur + 1) % 3); p = 0 } }
    else if (autoOn && !mq.matches) { since = t; p = 0 } // paused off screen: start again from empty
    bars.forEach((b, j) => { if (b) b.style.transform = 'scaleX(' + (j === cur ? (!autoOn || mq.matches || RM ? 1 : p) : 0) + ')' });
    requestAnimationFrame(loop);
  })(performance.now());
}
