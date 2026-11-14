/* Smooth scrolling and in-page links
 *  - Lenis gives the page the soft, eased scrolling (wheel and trackpad). Touch scrolling stays native.
 *  - Every in-page link glides to its section instead of jumping:
 *      hero button      → the "One World Model" section, just after the Energy story (as in the design)
 *      header "Energy"  → part-way into the pinned Energy section, where the text is showing
 *      header "Beyond Energy" → the start of the Beyond Energy story
 *      footer links     → their section (also works when arriving from the About page)
 *  - The header chapter marker highlights the section you are in.
 * The chapter marker's active look (brand blue, semibold, full underline) is set here because it follows the scroll.
 */
import Lenis from 'lenis';
import { RM, $, $$ } from '../core/utils.js';

let lenis = null;
export const getLenis = () => lenis;

// Where each link should land. Pinned sections land part-way in, so their content is visible.
function targetY(hash) {
  const el = hash && document.getElementById(hash.slice(1));
  if (!el) return null;
  const r = el.getBoundingClientRect(), top = r.top + scrollY, travel = Math.max(0, r.height - innerHeight);
  if (hash === '#energy') return top + travel * .45;
  if (hash === '#beyond') return top + travel * .16;
  return top;
}

export function scrollToY(y) {
  if (y == null) return;
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
}

export default function initSmoothScroll() {
  if (!RM) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: 1 });
    document.documentElement.style.scrollBehavior = 'auto';
    // keep GSAP ScrollTrigger (loaded by the Webflow template) in step, if it is on the page
    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf) })(performance.now());
    window.__lenis = lenis;
  }

  // In-page links. This listens before anything else on the page (capture phase) and stops the click there,
  // because Webflow's own anchor scrolling ignores "prevented" clicks: it would jump to the link's section
  // first and then this glide would pull the page on, which looks like a sudden jump (seen on phones).
  const heroBtn = $('.section_home-hero .button');
  const owm = $('.section_home-owm');
  addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    let y = null;
    if (a === heroBtn && owm) y = owm.getBoundingClientRect().top + scrollY - 40; // hero button: past the Energy story to One World Model
    else {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.hash.length < 2) return;
      y = targetY(url.hash);
      if (y == null) return;
      history.replaceState(null, '', url.hash);
    }
    e.preventDefault(); e.stopPropagation();
    scrollToY(y);
  }, true);

  // arriving with a hash (e.g. /#beyond from the About page)
  if (location.hash.length > 1) addEventListener('load', () => setTimeout(() => { const y = targetY(location.hash); if (y != null) { if (lenis) lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y) } }, 350));

  // chapter marker: Energy while the Energy story is on screen, Beyond Energy for the Beyond story
  const links = $$('.header_chapter-link'), en = $('#energy'), be = $('#beyond'), wo = $('#world-model') || $('.section_home-world');
  if (links.length && en && be) {
    const ch = () => {
      const mk = innerHeight * .5, p = en.getBoundingClientRect(), b = be.getBoundingClientRect(), w = wo ? wo.getBoundingClientRect().top : 1e9;
      const c1 = p.top <= mk && b.top > mk, c2 = b.top <= mk && w > mk;
      [c1, c2].forEach((on, k) => { if (!links[k]) return; const l = links[k]; l.style.color = on ? '#0071B1' : ''; l.style.fontWeight = on ? '600' : ''; l.style.setProperty('background-size', on ? '100% 1.5px' : '', on ? 'important' : ''); l.style.setProperty('background-position', on ? '0% 100%' : '', on ? 'important' : ''); l.toggleAttribute('aria-current', on) });
    };
    addEventListener('scroll', ch, { passive: true }); ch();
  }
}
