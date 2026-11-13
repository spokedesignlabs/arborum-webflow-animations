/* Pop-ups
 * 1. Info window: the white panel with corner marks that opens under a highlighted phrase
 *    ("critical decisions", "Different networks…") or a World Model option. One panel, shared.
 * 2. Toast: the small message at the bottom for links Arborum hasn't sent yet.
 *
 * Webflow elements (styles are on these classes in Webflow; the panel and toast are hidden by default):
 *   .popup_component  > .popup_scan, .popup_close, .popup_kicker, .popup_title, .popup_text,
 *                       .popup_list > .popup_step ×4 (> .popup_step-dot, .popup_step-text)
 *   .toast_component
 * This file only shows, places and animates them.
 */
import { RM, $, $$, keyable, play } from '../core/utils.js';

let dw, K, T, P, L, steps = [], cur = null, timer, onClose = null, openY = 0;

function ensure() {
  if (dw !== undefined) return !!dw;
  dw = $('.popup_component');
  if (!dw) return false;
  K = $('.popup_kicker', dw); T = $('.popup_title', dw); P = $('.popup_text', dw); L = $('.popup_list', dw);
  steps = $$('.popup_step', dw);
  dw.id = dw.id || 'dw';
  dw.setAttribute('role', 'dialog'); dw.setAttribute('aria-modal', 'false');
  if (T) { T.id = T.id || 'dwT'; dw.setAttribute('aria-labelledby', T.id) }
  const x = $('.popup_close', dw);
  if (x) { x.setAttribute('role', 'button'); x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closeWindow); keyable(x, closeWindow) }
  dw.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', closeWindow);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWindow() });
  // close once the page has really scrolled away (smooth scrolling keeps sending small scroll events)
  addEventListener('scroll', () => { if (cur && Math.abs(scrollY - openY) > 80) closeWindow() }, { passive: true });
  return true;
}

function stepOn(s, on) {
  const t = $('.popup_step-text', s), d = $('.popup_step-dot', s);
  if (t) t.style.color = on ? '#05131C' : '';
  if (d) d.style.backgroundColor = on ? '#0071B1' : '';
}

/* Open the panel under `trigger`.
 * d = { k: kicker, t: title, p: paragraph, l: [steps] }
 * opts.wide: the larger World Model style (title + paragraph only), opts.width, opts.step (ms between steps),
 * opts.align: 'left' (panel starts at the trigger) or 'center', opts.onClose: called when this panel closes */
export function openWindow(trigger, d, opts = {}) {
  if (!ensure()) return;
  if (cur === trigger) { closeWindow(); return }
  closeWindow();
  cur = trigger; onClose = opts.onClose || null; openY = scrollY;
  trigger.setAttribute('aria-expanded', 'true');
  const list = d.l || [], wide = !!opts.wide;
  if (K) { K.textContent = d.k || ''; K.style.display = wide || !d.k ? 'none' : '' }
  if (T) { T.textContent = d.t; T.style.fontSize = wide ? '28px' : ''; T.style.marginTop = wide ? '0' : '' }
  if (P) P.textContent = d.p;
  steps.forEach((s, i) => { const t = $('.popup_step-text', s); if (t) t.textContent = list[i] || ''; s.style.display = i < list.length ? '' : 'none'; stepOn(s, false) });
  if (L) L.style.display = wide || !list.length ? 'none' : '';
  dw.style.padding = wide ? '30px 32px 26px' : '';
  dw.style.display = 'block';
  const r = trigger.getBoundingClientRect(), w = Math.min(opts.width || 440, innerWidth - 32);
  dw.style.width = w + 'px';
  const x = Math.min(Math.max(16, opts.align === 'center' ? r.left + r.width / 2 - w / 2 : r.left), innerWidth - w - 16);
  let y = r.bottom + 14;
  dw.style.left = x + 'px'; dw.style.top = y + 'px';
  const h = dw.offsetHeight;
  if (y + h > innerHeight - 16) { y = Math.max(16, r.top - h - 14); dw.style.top = y + 'px' }
  if (!RM) {
    play(dw, [{ opacity: 0, transform: 'translateY(8px) scale(.98)', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
    play($('.popup_scan', dw), [{ top: '0%', opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .9 }, { top: '100%', opacity: 0 }], { duration: 1000, easing: 'ease-out' });
  }
  const shown = steps.slice(0, list.length);
  if (RM) { shown.forEach(s => stepOn(s, true)); return }
  let i = 0; clearTimeout(timer);
  (function step() { if (!cur) return; if (i < shown.length) { stepOn(shown[i], true); i++; timer = setTimeout(step, opts.step || 600) } })();
}

export function closeWindow() {
  if (!cur) return;
  cur.setAttribute('aria-expanded', 'false');
  const t = cur, f = onClose; cur = null; onClose = null;
  dw.style.display = 'none'; clearTimeout(timer);
  f && f(t);
}

/* Make a Webflow element (a highlighted phrase) open the panel. Its highlight style is set in Webflow;
 * while its window is open the highlight fills the whole phrase. */
export function makeTrigger(el, d, opts) {
  el.setAttribute('role', 'button'); el.setAttribute('aria-expanded', 'false');
  if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
  const on = v => { el.style.backgroundSize = v ? '100% 100%' : '' };
  const open = e => {
    e && e.stopPropagation();
    openWindow(el, typeof d === 'function' ? d() : d, Object.assign({ onClose: () => on(false) }, opts));
    on(cur === el);
  };
  el.addEventListener('click', open);
  keyable(el, open);
  return el;
}

/* ---- Toast for links that are still to come ---- */
let toast, tt;
export function showToast(msg) {
  if (toast === undefined) { toast = $('.toast_component'); if (toast) toast.setAttribute('role', 'status') }
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = '1'; toast.style.transform = 'translate(-50%,0)';
  clearTimeout(tt); tt = setTimeout(() => { toast.style.opacity = ''; toast.style.transform = '' }, 2200);
}

// Links in Webflow that still point to "#": say what's missing instead of jumping to the top.
// Change these when Arborum sends the real links (or just set the link in Webflow; then no toast shows).
const PENDING = [
  [/energy dashboard/i, 'Energy dashboard link pending from client'],
  [/live energy/i, 'Dashboard link pending from client'],
  [/whitepaper/i, 'Whitepaper link pending from client'],
  [/contact/i, 'Contact form link (Google Form or Typeform) pending from client'],
  [/linkedin/i, 'LinkedIn link pending from client'],
  [/^x$|twitter/i, 'X link pending from client'],
  [/facebook/i, 'Facebook link pending from client']
];

export default function initPopups() {
  $$('a[href="#"]').forEach(a => {
    const label = (a.getAttribute('aria-label') || a.textContent).trim();
    const hit = PENDING.find(([re]) => re.test(label));
    a.addEventListener('click', e => { e.preventDefault(); showToast(a.dataset.t || (hit ? hit[1] : 'Link coming soon')) });
  });
}
