/* Button and link hovers
 *  - Bracket buttons ([ Explore our World Models ], [ Read Whitepaper ]): the brackets open out
 *    and the label changes colour (cream on the hero, brand blue elsewhere).
 *  - Solid button (Explore Energy Dashboard): a soft sky-to-peach glow follows the pointer.
 *  - Header and footer links: a gradient glow follows the pointer across the text.
 * The pointer position is passed to CSS as --mx / --my.
 * Styles: src/styles/buttons.css
 */
export default function initButtons() {
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.button,.header_link,.header_chapter-link,.footer_link');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
}
