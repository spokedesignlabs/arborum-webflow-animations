/* Hero entrance (Home): the first thing a visitor sees, so it is calm and deliberate.
 *  1. "World Models for Complex Networks" arrives word by word: each word comes into focus from a soft blur
 *     while rising a fraction of its own height. Long, gentle ease; the words overlap, so it reads as one breath.
 *  2. The paragraph follows, the same way but quieter.
 *  3. The globe rises into place underneath; its first pulse follows a moment later (see hero-globe.js).
 * Reduced motion: everything simply shows.
 * Webflow: Home page head code holds a small style that keeps the title, paragraph hidden until this runs
 *   (with a fallback that shows them after 2.5s if the script never loads).
 * Webflow elements: .section_home-hero h1, .home-hero_text, canvas.home-hero_globe, canvas.home-hero_dots
 */
import { RM, $, $$ } from '../core/utils.js';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // long, soft settle
const START = 200;        // ms after load before the first word
const WORD_MS = 1100, WORD_GAP = 90, WORD_RISE = '.32em', WORD_BLUR = 10;
const TEXT_DELAY = 750, TEXT_MS = 1000;
const GLOBE_DELAY = 500, GLOBE_MS = 1800, GLOBE_RISE = 36;

export default function initHeroTitle() {
  const hero = $('.section_home-hero');
  if (!hero) return;
  const h1 = $('h1', hero), p = $('.home-hero_text', hero), canv = $$('canvas', hero);
  const show = el => { if (el) { el.style.animation = 'none'; el.style.opacity = '1' } };
  [h1, p].forEach(show);
  if (RM || !h1 || !h1.animate) return;

  // split the title into words (spaces stay as text, so it reads and wraps exactly as before)
  const words = [];
  [...h1.childNodes].forEach(n => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(t => {
      if (!t) return;
      if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return }
      const s = document.createElement('span');
      s.textContent = t; s.style.display = 'inline-block'; s.style.willChange = 'transform, filter, opacity';
      frag.appendChild(s); words.push(s);
    });
    n.replaceWith(frag);
  });

  words.forEach((w, i) => {
    const a = w.animate([
      { opacity: 0, transform: `translateY(${WORD_RISE})`, filter: `blur(${WORD_BLUR}px)` },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ], { duration: WORD_MS, delay: START + i * WORD_GAP, easing: EASE, fill: 'backwards' });
    a.onfinish = () => { w.style.willChange = '' };
  });
  if (p) p.animate([
    { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
    { opacity: 1, transform: 'none', filter: 'blur(0)' }
  ], { duration: TEXT_MS, delay: START + TEXT_DELAY, easing: EASE, fill: 'backwards' });
  // the globe: from nothing to its Webflow opacity, rising into place (uses `translate`, so it never fights a transform)
  canv.forEach(c => {
    const o = getComputedStyle(c).opacity;
    c.animate([{ opacity: 0, translate: `0 ${GLOBE_RISE}px` }, { opacity: o, translate: '0 0' }],
      { duration: GLOBE_MS, delay: START + GLOBE_DELAY, easing: EASE, fill: 'backwards' });
  });
}
