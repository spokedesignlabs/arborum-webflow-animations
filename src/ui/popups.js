/* Pop-ups
 * 1. Info window: the white panel with corner marks that opens under a highlighted phrase
 *    ("critical decisions", "Different networks…") or a World Model option. One panel is shared.
 * 2. Toast: the small message at the bottom for links Arborum hasn't sent yet.
 * Styles: src/styles/popups.css
 */
import { RM, $$ } from '../core/utils.js';

let dw, K, T, P, L, cur = null, timer, onClose = null;

function ensure() {
  if (dw) return;
  dw = document.createElement('div');
  dw.className = 'dw'; dw.id = 'dw'; dw.hidden = true;
  dw.setAttribute('role', 'dialog'); dw.setAttribute('aria-modal', 'false'); dw.setAttribute('aria-labelledby', 'dwT');
  dw.innerHTML = '<i class="dw-c tl"></i><i class="dw-c tr"></i><i class="dw-c bl"></i><i class="dw-c br"></i><span class="dw-scan"></span>'
    + '<button type="button" class="dw-x" aria-label="Close">×</button>'
    + '<div class="dw-k" id="dwK"></div><h4 id="dwT"></h4><p id="dwP"></p><ol id="dwL"></ol>';
  document.body.appendChild(dw);
  K = dw.querySelector('#dwK'); T = dw.querySelector('#dwT'); P = dw.querySelector('#dwP'); L = dw.querySelector('#dwL');
  dw.querySelector('.dw-x').addEventListener('click', closeWindow);
  dw.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', closeWindow);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWindow() });
  addEventListener('scroll', closeWindow, { passive: true });
}

/* Open the panel under `trigger`.
 * d = { k: kicker, t: title, p: paragraph, l: [steps] }
 * opts.wide: the larger World Model style (title + paragraph only), opts.width, opts.step (ms between steps),
 * opts.align: 'left' (panel starts at the trigger) or 'center'
 * opts.onClose: called when this panel closes */
export function openWindow(trigger, d, opts = {}) {
  ensure();
  if (cur === trigger) { closeWindow(); return }
  closeWindow();
  cur = trigger; onClose = opts.onClose || null;
  trigger.setAttribute('aria-expanded', 'true');
  K.textContent = d.k || ''; T.textContent = d.t; P.textContent = d.p;
  L.innerHTML = (d.l || []).map(x => '<li>' + x + '</li>').join('');
  dw.classList.toggle('wide', !!opts.wide);
  dw.hidden = false;
  const r = trigger.getBoundingClientRect(), w = Math.min(opts.width || 440, innerWidth - 32);
  dw.style.width = w + 'px';
  const x = Math.min(Math.max(16, opts.align === 'center' ? r.left + r.width / 2 - w / 2 : r.left), innerWidth - w - 16);
  let y = r.bottom + 14;
  dw.style.left = x + 'px'; dw.style.top = y + 'px';
  const h = dw.offsetHeight;
  if (y + h > innerHeight - 16) { y = Math.max(16, r.top - h - 14); dw.style.top = y + 'px' }
  dw.classList.remove('in'); void dw.offsetWidth; dw.classList.add('in');
  const li = [...L.children];
  if (RM) { li.forEach(x => x.classList.add('on')); return }
  let i = 0; clearTimeout(timer);
  (function step() { if (!cur) return; if (i < li.length) { li[i].classList.add('on'); i++; timer = setTimeout(step, opts.step || 600) } })();
}

export function closeWindow() {
  if (!cur) return;
  cur.setAttribute('aria-expanded', 'false');
  const t = cur, f = onClose; cur = null; onClose = null;
  dw.hidden = true; dw.classList.remove('wide'); clearTimeout(timer);
  f && f(t);
}

/* Turn an element into a highlighted phrase that opens the panel */
export function makeTrigger(el, d, opts) {
  let b = el;
  if (el.tagName !== 'BUTTON') {
    b = document.createElement('button');
    b.type = 'button';
    while (el.firstChild) b.appendChild(el.firstChild);
    el.appendChild(b);
  }
  b.classList.add('dw-trig');
  b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'dw');
  b.addEventListener('click', e => {
    e.stopPropagation();
    openWindow(b, typeof d === 'function' ? d() : d, Object.assign({ onClose: t => t.classList.remove('on') }, opts));
    b.classList.toggle('on', cur === b);
  });
  return b;
}

/* ---- Toast for links that are still to come ---- */
let toast, tt;
export function showToast(msg) {
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast) }
  toast.textContent = msg; toast.classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 2200);
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
