/* Gentle reveal: blocks fade up as they come into view (Home and About).
 * Add a class to REVEAL to include more blocks.
 * Styles: src/styles/base.css (.wf-rv)
 */
import { RM, $$ } from '../core/utils.js';

const REVEAL = [
  // Home (the Energy text has its own stepped reveal in statement-energy.js)
  '.home-statement_component', '.home-owm_component', '.home-usecases_component',
  '.home-world_heading', '.home-world_steps', '.home-world_ctas',
  // About
  '.about-block_component', '.about-partners_component'
];

export default function initReveal() {
  if (RM || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('wf-in'); io.unobserve(e.target) } }), { threshold: .12 });
  $$(REVEAL.join(',')).forEach(el => { el.classList.add('wf-rv'); io.observe(el) });
}
