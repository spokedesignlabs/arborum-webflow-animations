/* Reveal: one way content appears, on every page.
 * As a block comes into view it fades up gently (16px, 0.7s). Items that belong together (a list, the steps,
 * the investor logos) come in one after another, 60ms apart. Nothing is hidden until this script runs, so with
 * the script off everything simply shows. The hero, the Energy text and Beyond Energy have their own motion.
 *
 * REVEAL: [selector, group]. group = true means "each child of this element, one after another".
 */
import { RM, $$ } from '../core/utils.js';

const MOVE = 16, DURATION = 700, STAGGER = 60, EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
const REVEAL = [
  // Home
  ['.home-statement_component', false],
  ['.home-owm_list', true], ['.home-owm_title', false],
  ['.home-usecases_heading', false], ['.home-usecases_body', false],
  ['.home-world_heading', true], ['.home-world_steps', true], ['.home-world_ctas', true],
  // About
  ['.about-block_heading', true], ['.about-block_copy', true],
  ['.about-partners_heading', true], ['.about-partners_grid', true],
  // Both pages
  ['.footer_top', false], ['.footer_bottom', false]
];

export default function initReveal() {
  if (RM || !('IntersectionObserver' in window)) return;
  const items = [];
  REVEAL.forEach(([sel, group]) => $$(sel).forEach(el => {
    if (group) [...el.children].forEach((ch, i) => items.push([ch, i * STAGGER])); else items.push([el, 0]);
  }));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, delay = el.__rvDelay || 0;
    el.style.transition = `opacity ${DURATION}ms ${EASE} ${delay}ms, transform ${DURATION}ms ${EASE} ${delay}ms`;
    el.style.opacity = '1'; el.style.transform = 'none';
    setTimeout(() => { el.style.transition = ''; el.style.opacity = ''; el.style.transform = '' }, DURATION + delay + 50);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(([el, delay]) => {
    if (el.__rvDelay !== undefined) return;
    el.__rvDelay = delay; el.style.opacity = '0'; el.style.transform = `translateY(${MOVE}px)`;
    io.observe(el);
  });
}
