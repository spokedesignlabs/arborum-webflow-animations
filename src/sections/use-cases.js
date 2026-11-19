/* Power use cases
 * Three tabs. Desktop and tablet: a thin bar fills along the top of the open tab over 7 seconds, then the
 * next tab opens (round and round) while the section is on screen. Clicking a tab opens it and starts its
 * 7 seconds again; the rotation carries on from there. Phones: a stacked list; the open item shows its photo
 * and text directly under it, as an accordion: tapping an item folds the open one shut and unfolds the tapped one
 * (no auto-switching on phones).
 * Switch: powerUseCases (off: no bar and no auto-switching; the tabs still work when clicked).
 * Webflow elements: .home-usecases_tab ×3 (each with .home-usecases_label, .home-usecases_icon,
 *   .home-usecases_progress), .home-usecases_panel (.home-usecases_card, .home-usecases_photo)
 * Content: the Webflow CMS collection "Power use cases" (one item per tab, sorted by its Order field), shown on
 *   Home in the hidden list .home-usecases_data. Each item holds [data-uc] elements bound to the fields:
 *   order, kicker, title, text, focus, photo (image), phone (image, optional). The client edits text and photos
 *   in the CMS; the values below are only a fallback if that list is missing or empty.
 */
import { RM, ON, $, $$, keyable } from '../core/utils.js';

const CDN = 'https://cdn.prod.website-files.com/6af68d8e7acb8dbd77201062/';
const FALLBACK = [
  { k: 'Power generators', t: 'Generation Forecast + Scheduling', d: 'High-accuracy generation forecast and smarter, block-level scheduling decisions across day-ahead and intraday markets.', i: '6af69ac735c5dc2d29c69745_arborum-generation-licensed.jpg', m: '6af69ac61ea333a9ea2210d4_arborum-generation-licensed-m.jpg', p: '50% 50%' },
  { k: 'Power distributors', t: 'Load Forecast + Scheduling', d: 'High-accuracy demand forecasting and intelligent scheduling to balance demand and supply across every block.', i: '6af69ac5505d0468f3762034_arborum-distribution-licensed.jpg', m: '6af69ac5505d0468f3762034_arborum-distribution-licensed.jpg', p: '62% 50%' },
  { k: 'Battery energy storage systems', t: 'Battery Charging + Discharging Optimisation', d: 'AI-powered battery optimisation to maximise returns, reduce deviations and respond dynamically to changing grid conditions.', i: '6af69ac415bf88c09c359668_arborum-bess-licensed.jpg', m: '6af69ac415bf88c09c359668_arborum-bess-licensed.jpg', p: '50% 60%' }
].map(u => ({ ...u, i: CDN + u.i, m: CDN + u.m }));
const ROTATE_MS = 7000;

// Read the three use cases from the CMS list on the page; any missing field keeps the built-in value.
function readCMS() {
  const items = $$('.home-usecases_data .w-dyn-item');
  if (!items.length) return FALLBACK;
  const txt = (el, k) => { const n = el.querySelector('[data-uc="' + k + '"]'); return n && !n.classList.contains('w-dyn-bind-empty') ? n.textContent.trim() : '' };
  const src = (el, k) => { const n = el.querySelector('img[data-uc="' + k + '"]'); return n && !n.classList.contains('w-dyn-bind-empty') ? (n.getAttribute('src') || '') : '' };
  const list = items.map((el, j) => ({ el, o: parseFloat(txt(el, 'order')) || j + 1 })).sort((a, b) => a.o - b.o).slice(0, 3);
  return FALLBACK.map((f, j) => {
    const el = list[j] && list[j].el; if (!el) return f;
    const i = src(el, 'photo') || f.i;
    return { k: txt(el, 'kicker') || f.k, t: txt(el, 'title') || f.t, d: txt(el, 'text') || f.d, i, m: src(el, 'phone') || i, p: txt(el, 'focus') || f.p };
  });
}

export default function initUseCases() {
  const tabs = $$('.home-usecases_tab'), panel = $('.home-usecases_panel');
  if (tabs.length !== 3 || !panel) return;
  const mq = matchMedia('(max-width:767px)');
  const card = $('.home-usecases_card', panel), photo = $('.home-usecases_photo', panel);
  const K = $('.home-usecases_kicker', card), T = $('.home-usecases_title', card), D = $('.home-usecases_text', card);
  const bars = tabs.map(t => $('.home-usecases_progress', t));
  const UC = readCMS();
  let cur = 0, sw, since = performance.now(), vis = false;
  UC.forEach(u => [u.i, u.m].forEach(s => { const im = new Image(); im.src = s }));
  // the panel in Webflow holds the first use case; show the CMS version of it straight away
  if (K) K.textContent = UC[0].k;
  if (T) T.textContent = UC[0].t;
  if (D) D.textContent = UC[0].d;
  if (photo) { photo.style.backgroundImage = 'url(' + UC[0].m + ')'; photo.style.backgroundPosition = UC[0].p }
  card.style.transition = 'opacity 220ms ease, filter 220ms ease'; // a light blur bridges old and new text

  const autoOn = ON('powerUseCases');
  const auto = () => autoOn && vis && !RM && !mq.matches && !document.hidden; // phones: tap only
  // phones: the panel sits right under the open tab, and the photo sits above the text (never behind it)
  function layout() {
    if (cur < 0 && !mq.matches) return set(0); // all closed only exists on phones; on a wider screen open the first again
    panel.style.display = cur < 0 ? 'none' : ''; // phones: every item closed
    if (cur < 0) { tabs.forEach((t, j) => { t.style.order = String(j * 2) }); return }
    tabs.forEach((t, j) => { t.style.order = mq.matches ? String(j <= cur ? j * 2 : j * 2 + 2) : '' });
    panel.style.order = mq.matches ? String(cur * 2 + 1) : '';
    panel.style.backgroundImage = mq.matches ? 'none' : 'url(' + UC[cur].i + ')';
    panel.style.backgroundPosition = UC[cur].p;
  }
  // Phones: a real accordion. The open item's content folds shut where it was while the tapped item's content
  // unfolds under it, both at once, so nothing jumps; the page just slides smoothly. (One shared panel in Webflow:
  // a copy of it folds shut in the old place while the real one, with the new content, opens in the new place.)
  const ACC_MS = 320, ACC_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  let ghost = null;
  let closing = 0;
  const clearAnim = () => ['height', 'marginBottom', 'overflow', 'opacity', 'transition'].forEach(k => panel.style[k] = '');
  function accordion(fill, from) {
    if (ghost) { ghost.remove(); ghost = null }
    clearTimeout(closing); clearAnim();
    const H = panel.offsetHeight, mb = getComputedStyle(panel).marginBottom, oldOrder = panel.style.order;
    if (from < 0) { // opening from "all closed": nothing to fold shut, just unfold under the tapped item
      fill(); layout(); if (RM) return;
      const h = panel.offsetHeight;
      Object.assign(panel.style, { height: '0px', marginBottom: '0px', overflow: 'hidden', opacity: '0', transition: 'none' });
      void panel.offsetHeight;
      Object.assign(panel.style, { transition: `height ${ACC_MS}ms ${ACC_EASE}, margin-bottom ${ACC_MS}ms ${ACC_EASE}, opacity ${ACC_MS}ms ease`, height: h + 'px', marginBottom: mb, opacity: '1' });
      closing = setTimeout(clearAnim, ACC_MS + 40);
      return;
    }
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
    closing = setTimeout(() => {
      g.remove(); if (ghost === g) ghost = null;
      clearAnim();
      if (cur < 0) return;
      // if the tapped item slid up under the header, bring it gently back into view
      const t = tabs[cur].getBoundingClientRect().top;
      if (t < 72) { const y = scrollY + t - 80, ln = window.__lenis; if (ln) ln.scrollTo(y, { duration: .5 }); else scrollTo({ top: y, behavior: 'smooth' }) }
    }, ACC_MS + 40);
  }
  const mark = i => tabs.forEach((t, j) => {
    const on = j === i, l = $('.home-usecases_label', t), ic = $('.home-usecases_icon', t);
    t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); t.setAttribute('aria-expanded', on);
    if (l) l.classList.toggle('is-active', on);
    if (ic) { ic.classList.toggle('is-active', on); ic.textContent = on ? '−' : '+' }
  });
  // Phones: tapping the open item again folds it shut, leaving every item closed
  function closeAll() {
    if (ghost) { ghost.remove(); ghost = null }
    clearTimeout(closing); cur = -1; mark(-1);
    if (RM) { layout(); return }
    clearAnim();
    Object.assign(panel.style, { height: panel.offsetHeight + 'px', overflow: 'hidden', transition: 'none' });
    void panel.offsetHeight;
    Object.assign(panel.style, { transition: `height ${ACC_MS}ms ${ACC_EASE}, margin-bottom ${ACC_MS}ms ${ACC_EASE}, opacity ${ACC_MS}ms ease`, height: '0px', marginBottom: '0px', opacity: '0' });
    closing = setTimeout(() => { clearAnim(); layout() }, ACC_MS + 40);
  }
  function set(i) {
    if (i === cur) { if (mq.matches) closeAll(); return }
    const from = cur; cur = i; since = performance.now();
    mark(i);
    const fill = () => { const u = UC[i]; K.textContent = u.k; T.textContent = u.t; D.textContent = u.d; if (photo) { photo.style.backgroundImage = 'url(' + u.m + ')'; photo.style.backgroundPosition = u.p } };
    clearTimeout(sw);
    if (mq.matches) { accordion(fill, from); return }
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
