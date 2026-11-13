/* One World Model: threads in, threads out
 * Curved lines draw in from each dependency (left) to "One World Model", then out to each decision (right).
 * Small dots travel along them. Hover an item to highlight its line. Desktop and tablet only (not on phones).
 * Attaches to: .home-owm_component (.home-owm_list ×2, .home-owm_title, .home-owm_item)
 * Styles: src/styles/sections.css
 */
import { RM, $$, debounce, onLoad, SVGNS } from '../core/utils.js';

export default function initOneWorldModel() {
  const dep = document.querySelector('.home-owm_component');
  if (!dep) return;
  const lists = $$('.home-owm_list', dep), title = dep.querySelector('.home-owm_title');
  if (lists.length < 2 || !title) return;
  if (getComputedStyle(dep).position === 'static') dep.style.position = 'relative';
  const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'wf-dep'); svg.setAttribute('aria-hidden', 'true');
  dep.prepend(svg);
  let P = [], on = false, seen = false;

  function build() {
    const r = dep.getBoundingClientRect();
    svg.innerHTML = ''; P = [];
    if (!r.width || innerWidth < 768) return;
    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    const ct = title.getBoundingClientRect(), cy = ct.top - r.top + ct.height / 2, lx = ct.left - r.left - 18, rx = ct.right - r.left + 18;
    const add = (el, x0, y0, x1, y1, col, i, side) => {
      const p = document.createElementNS(SVGNS, 'path'), mx = (x0 + x1) / 2;
      p.setAttribute('d', `M${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`); p.setAttribute('stroke', col); svg.appendChild(p);
      const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = (seen || RM) ? 0 : L;
      p.style.transitionDelay = (side ? .9 : 0) + i * .07 + 's,0s';
      const d = document.createElementNS(SVGNS, 'circle'); d.setAttribute('r', '2.6'); d.setAttribute('fill', col); svg.appendChild(d);
      P.push({ p, L, d, i, side });
      el.onmouseenter = () => { dep.classList.add('wf-dim'); p.classList.add('hot') };
      el.onmouseleave = () => { dep.classList.remove('wf-dim'); p.classList.remove('hot') };
    };
    $$('.home-owm_item', lists[0]).forEach((s, i) => { const b = s.getBoundingClientRect(); add(s, b.right - r.left + 14, b.top - r.top + b.height / 2, lx, cy, '#0071B1', i, 0) });
    $$('.home-owm_item', lists[1]).forEach((s, i) => { const b = s.getBoundingClientRect(); add(s, rx, cy, b.left - r.left - 14, b.top - r.top + b.height / 2, '#6DC2F2', i, 1) });
  }

  if ('IntersectionObserver' in window) new IntersectionObserver(e => { on = e[0].isIntersecting; if (on && !seen) { seen = true; P.forEach(o => o.p.style.strokeDashoffset = 0) } }, { threshold: .3 }).observe(dep);
  else seen = true;
  (function loop(t) {
    if (on && P.length && !RM) for (const o of P) {
      const u = (t / 3200 + o.i / 6 + (o.side ? .5 : 0)) % 1, pt = o.p.getPointAtLength(o.L * u);
      o.d.setAttribute('cx', pt.x); o.d.setAttribute('cy', pt.y); o.d.style.opacity = Math.sin(u * Math.PI);
    }
    requestAnimationFrame(loop);
  })(0);
  onLoad(build, 100);
  addEventListener('resize', debounce(build));
}
