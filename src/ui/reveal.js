/* Gentle reveal: blocks fade up as they come into view (Home and About).
 * Add a class to REVEAL to include more blocks. Nothing is hidden until this script runs,
 * so with the script off every block simply shows.
 */
import { RM, $$, play } from '../core/utils.js';

const REVEAL = [
  // Home (the Energy text has its own stepped reveal in statement-energy.js)
  '.home-statement_component', '.home-owm_component', '.home-usecases_component',
  '.home-world_heading', '.home-world_steps', '.home-world_ctas',
  // About
  '.about-block_component', '.about-partners_component'
];

export default function initReveal() {
  if (RM || !('IntersectionObserver' in window)) return;
  const els = $$(REVEAL.join(',')).filter(el => el.getBoundingClientRect().top > innerHeight); // leave what is already on screen
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    play(e.target, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'ease', fill: 'none' });
    e.target.style.opacity = ''; e.target.style.transform = '';
  }), { threshold: .12 });
  els.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(18px)'; io.observe(el) });
}
