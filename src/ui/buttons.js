/* Button and link hovers
 *  - Bracket buttons ([ Explore our World Models ], [ Read Whitepaper ]): the brackets open out and take the
 *    hover colour (cream on dark backgrounds, brand blue elsewhere). The label colour is a Webflow hover style.
 *  - Solid button (Explore Energy Dashboard): a soft sky-to-peach glow follows the pointer.
 *  - Header and footer links: a gradient glow follows the pointer across the text.
 * The resting looks, label hover colours and transitions are Webflow styles; this file adds only the
 * parts that follow the pointer or move a child element.
 */
const BTN = '.button', LINK = '.header_link,.header_chapter-link,.footer_link';
const GLOW = (x, y) => `radial-gradient(150px 110px at ${x}px ${y}px,#F2BF95,#E6D5B7 42%,#6DC2F2 100%)`;
const TEXT_GLOW = (x, light) => light
  ? `radial-gradient(70px 44px at ${x}px 50%,#F2BF95,#E6D5B7 42%,#fff 130%)`
  : `radial-gradient(70px 44px at ${x}px 50%,#0071B1,#2E9BDA 60%,#05131C 130%)`;

function brackets(btn, on) {
  const bs = btn.querySelectorAll('.button_bracket');
  const col = on ? (btn.classList.contains('is-on-dark') ? '#E6D5B7' : '#0071B1') : '';
  bs.forEach(b => {
    b.style.transition = 'transform .35s cubic-bezier(.2,.7,.2,1),border-color .3s';
    b.style.transform = on ? `translateX(${b.classList.contains('is-right') ? 5 : -5}px)` : '';
    b.style.borderColor = col;
  });
  return bs.length > 0;
}

export default function initButtons() {
  const enter = el => {
    if (el.matches(BTN)) { if (!brackets(el, true)) el.__solid = true }
    else { el.style.webkitBackgroundClip = el.style.backgroundClip = 'text'; el.style.color = 'transparent' }
  };
  const leave = el => {
    if (el.matches(BTN)) { brackets(el, false); el.style.backgroundImage = '' }
    else { el.style.backgroundImage = ''; el.style.color = ''; el.style.webkitBackgroundClip = el.style.backgroundClip = '' }
  };
  const move = (el, e) => {
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (el.matches(BTN)) { if (el.__solid) el.style.backgroundImage = GLOW(x, y) }
    else el.style.backgroundImage = TEXT_GLOW(x, el.matches('.footer_link'));
  };
  document.querySelectorAll(BTN + ',' + LINK).forEach(el => {
    el.addEventListener('pointerenter', e => { enter(el); move(el, e) });
    el.addEventListener('pointermove', e => move(el, e), { passive: true });
    el.addEventListener('pointerleave', () => leave(el));
    el.addEventListener('focus', () => { if (el.matches(BTN)) brackets(el, true) });
    el.addEventListener('blur', () => leave(el));
  });
}
