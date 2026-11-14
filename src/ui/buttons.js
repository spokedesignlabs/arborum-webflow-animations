/* Button hovers
 *  - Bracket buttons ([ Explore our World Models ], [ Read Whitepaper ]): the brackets open out and take the
 *    hover colour (cream on dark backgrounds, brand blue elsewhere). The label colour is a Webflow hover style.
 * Everything else (solid button, link underlines) is plain Webflow hover styling.
 */
function brackets(btn, on) {
  const bs = btn.querySelectorAll('.button_bracket');
  const col = on ? (btn.classList.contains('is-on-dark') ? '#E6D5B7' : '#0071B1') : '';
  bs.forEach(b => {
    b.style.transition = on ? 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1),border-color 200ms ease' : 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1),border-color 160ms ease';
    b.style.transform = on ? `translateX(${b.classList.contains('is-right') ? 5 : -5}px)` : '';
    b.style.borderColor = col;
  });
}

export default function initButtons() {
  document.querySelectorAll('.button').forEach(el => {
    if (!el.querySelector('.button_bracket')) return;
    el.addEventListener('pointerenter', () => brackets(el, true));
    el.addEventListener('pointerleave', () => brackets(el, false));
    el.addEventListener('focus', () => brackets(el, true));
    el.addEventListener('blur', () => brackets(el, false));
  });
}
