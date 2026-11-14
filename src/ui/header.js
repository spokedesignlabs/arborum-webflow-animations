/* Header: the whole nav moves as one
 * The Webflow header sits at the top of the page. Once you are past the top, it becomes two floating pills of the
 * same height: the logo and "About" on the left, the chapter marker (Energy → Beyond Energy) on the right.
 * Scrolling down tucks both away together; scrolling up brings both back together. Back at the top, the header
 * returns to normal. Both pills sit on the page grid (the same left and right edges as the titles), which the
 * Webflow styles set through --nav-inset.
 * Webflow elements: .header_component > .header_left (.header_logo, .header_divider, .header_link), .header_chapter
 */
import { $ } from '../core/utils.js';

const SHOW_AFTER = 140; // px from the top before the pills take over
const IN = 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)', OUT = 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)';

export default function initHeader() {
  const left = $('.header_component .header_left');
  if (!left) return;
  const chapter = $('.header_component .header_chapter'); // not on every page
  const logo = $('.header_logo', left), div = $('.header_divider', left), link = $('.header_link', left);
  const phone = matchMedia('(max-width:767px)');
  let bar = false, shown = true, lastY = scrollY;

  // the floating left pill matches the chapter pill's height exactly
  const pillH = () => (chapter && chapter.offsetHeight) || (phone.matches ? 32 : 40);

  function setBar(on) {
    if (on === bar) return; bar = on;
    if (on) {
      const h = pillH();
      Object.assign(left.style, {
        position: 'fixed', top: phone.matches ? '16px' : '20px', left: 'var(--nav-inset, 24px)', zIndex: '61',
        height: h + 'px', boxSizing: 'border-box', padding: phone.matches ? '0 10px' : '0 14px',
        backgroundColor: 'rgba(255,255,255,.92)', border: '1px solid rgba(5,19,28,.14)', transform: 'translateY(-160%)', transition: 'none'
      });
      if (logo) { logo.style.filter = 'brightness(0)'; logo.style.height = Math.round(h * .5) + 'px'; logo.style.width = 'auto' } // dark logo, sized to the pill
      if (div) div.style.backgroundColor = 'rgba(5,19,28,.2)';
      if (link) link.style.color = '#05131C';
      if (chapter) { chapter.style.transition = OUT; chapter.style.transform = 'translateY(-160%)' } // leaves with the logo
      shown = false;
    } else {
      ['position', 'top', 'left', 'zIndex', 'height', 'boxSizing', 'padding', 'backgroundColor', 'border', 'transform', 'transition'].forEach(k => left.style[k] = '');
      if (logo) { logo.style.filter = ''; logo.style.height = ''; logo.style.width = '' }
      if (div) div.style.backgroundColor = '';
      if (link) link.style.color = '';
      if (chapter) { chapter.style.transition = IN; chapter.style.transform = '' }
      shown = true;
    }
  }
  // both pills slide together: in over 300ms on the drawer curve, out faster (200ms)
  function show(on) {
    if (on === shown) return; shown = on;
    [left, chapter].forEach(el => { if (!el) return; el.style.transition = on ? IN : OUT; el.style.transform = on ? 'none' : 'translateY(-160%)' });
  }

  addEventListener('scroll', () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (y < SHOW_AFTER) { setBar(false); return }
    setBar(true);
    if (Math.abs(dy) > 2) show(dy < 0);
  }, { passive: true });
  // the grid edge: where the page content starts (measured, because Webflow's page padding changes per breakpoint)
  // (the first container that is actually shown, so a hidden section such as the About hero is skipped)
  const inset = () => {
    const grid = [...document.querySelectorAll('main .padding-global .container-large')].find(c => c.offsetWidth > 0);
    if (grid) document.documentElement.style.setProperty('--nav-inset', Math.round(grid.getBoundingClientRect().left) + 'px');
  };
  inset();
  addEventListener('resize', () => { inset(); if (bar) { setBar(false); setBar(true); show(true) } });
}
