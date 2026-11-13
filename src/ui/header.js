/* Header: the logo comes back when you scroll up
 * The Webflow header sits at the top of the page, so the logo scrolls away with it. Once you are past the
 * top, scrolling up brings the logo and "About" back as a small white bar in the top-left corner (it matches
 * the chapter marker on the right); scrolling down tucks it away again. Back at the top, it returns to normal.
 * Webflow elements: .header_component > .header_left (.header_logo, .header_divider, .header_link)
 */
import { $ } from '../core/utils.js';

const SHOW_AFTER = 140; // px from the top before the bar takes over

export default function initHeader() {
  const left = $('.header_component .header_left');
  if (!left) return;
  const logo = $('.header_logo', left), div = $('.header_divider', left), link = $('.header_link', left);
  const phone = matchMedia('(max-width:767px)');
  let bar = false, shown = false, lastY = scrollY;

  function setBar(on) {
    if (on === bar) return; bar = on;
    if (on) {
      Object.assign(left.style, {
        position: 'fixed', top: phone.matches ? '16px' : '20px', left: phone.matches ? '16px' : '24px', zIndex: '61',
        padding: phone.matches ? '6px 10px' : '8px 14px', backgroundColor: 'rgba(255,255,255,.92)',
        border: '1px solid rgba(5,19,28,.14)', transform: 'translateY(-160%)', transition: 'none'
      });
      if (logo) logo.style.filter = 'brightness(0)'; // dark logo on the white bar
      if (div) div.style.backgroundColor = 'rgba(5,19,28,.2)';
      if (link) link.style.color = '#05131C';
      void left.offsetWidth; left.style.transition = 'transform .35s cubic-bezier(.2,.7,.2,1)';
    } else {
      ['position', 'top', 'left', 'zIndex', 'padding', 'backgroundColor', 'border', 'transform', 'transition'].forEach(k => left.style[k] = '');
      if (logo) logo.style.filter = '';
      if (div) div.style.backgroundColor = '';
      if (link) link.style.color = '';
      shown = false;
    }
  }
  function show(on) { if (on === shown) return; shown = on; left.style.transform = on ? 'none' : 'translateY(-160%)' }

  addEventListener('scroll', () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (y < SHOW_AFTER) { setBar(false); return }
    setBar(true);
    if (Math.abs(dy) > 2) show(dy < 0);
  }, { passive: true });
}
