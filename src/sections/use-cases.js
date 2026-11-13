/* Power use cases
 * Three tabs. Desktop and tablet: tabs across the top, the card changes, and it moves to the next tab
 * every 7 seconds until someone clicks. Phones: a stacked list; the open item shows its photo and text
 * directly under it (no auto-rotate).
 * Attaches to: .home-usecases_tab ×3, .home-usecases_panel (.home-usecases_card, .home-usecases_photo)
 * Images: Webflow asset URLs below (CDN + file name).
 */
import { RM, $, $$, keyable } from '../core/utils.js';

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
  const card = panel.querySelector('.home-usecases_card'), photo = panel.querySelector('.home-usecases_photo');
  const K = card.querySelector('.home-usecases_kicker'), T = card.querySelector('.home-usecases_title'), D = card.querySelector('.home-usecases_text');
  let cur = 0, touched = false, sw;
  UC.forEach(u => [u.i, u.m].forEach(s => { const im = new Image(); im.src = CDN + s }));

  // phones: the panel sits right under the open tab
  function order() { tabs.forEach((t, j) => { t.style.order = mq.matches ? String(j <= cur ? j * 2 : j * 2 + 2) : '' }); panel.style.order = mq.matches ? String(cur * 2 + 1) : '' }
  function set(i) {
    if (i === cur) return; cur = i;
    tabs.forEach((t, j) => {
      const on = j === i, l = t.querySelector('.home-usecases_label'), ic = t.querySelector('.home-usecases_icon');
      t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on);
      if (l) l.classList.toggle('is-active', on);
      if (ic) { ic.classList.toggle('is-active', on); ic.textContent = on ? '−' : '+' }
    });
    card.classList.add('is-out'); clearTimeout(sw);
    sw = setTimeout(() => {
      const u = UC[i]; K.textContent = u.k; T.textContent = u.t; D.textContent = u.d;
      panel.style.backgroundImage = 'url(' + CDN + u.i + ')'; panel.style.backgroundPosition = u.p;
      if (photo) { photo.style.backgroundImage = 'url(' + CDN + u.m + ')'; photo.style.backgroundPosition = u.p }
      card.classList.remove('is-out');
    }, RM ? 0 : 220);
    order();
  }
  tabs.forEach((t, j) => {
    t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', j === 0);
    t.addEventListener('click', () => { touched = true; set(j) });
    keyable(t, () => { touched = true; set(j) });
  });
  mq.addEventListener('change', order); order();
  let vis = false;
  new IntersectionObserver(es => { vis = es[0].isIntersecting }, { threshold: .3 }).observe(panel);
  setInterval(() => { if (vis && !touched && !RM && !mq.matches && !document.hidden) set((cur + 1) % 3) }, ROTATE_MS);
}
