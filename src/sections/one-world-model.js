/* One World Model: threads in, threads out
 * When the section comes into view, curved lines draw in from each dependency (left) to "One World Model",
 * then out to each decision (right). Small dots keep travelling along them. Hover an item to highlight
 * its line. Desktop and tablet only (not on phones).
 * Webflow elements: .home-owm_component > canvas.home-owm_lines, .home-owm_list ×2 (.home-owm_item), .home-owm_title
 */
import { RM, $, $$, clamp, DPR, debounce, onLoad, canvasIn } from '../core/utils.js';

const IN = '#0071B1', OUT = '#6DC2F2';
const DRAW_MS = 1300, STAGGER_MS = 70, OUT_DELAY_MS = 900; // how the lines draw in
const DOT_MS = 3200; // one trip of a dot along its line

export default function initOneWorldModel() {
  const dep = $('.home-owm_component');
  const cv = canvasIn(dep, 'home-owm_lines');
  if (!cv) return;
  const lists = $$('.home-owm_list', dep), title = $('.home-owm_title', dep);
  if (lists.length < 2 || !title) return;
  cv.setAttribute('aria-hidden', 'true');
  let x = null, W = 0, H = 0, lines = [], on = false, seenAt = 0, hot = -1, raf = 0;

  // cubic curve from (x0,y0) to (x1,y1), sampled so it can be drawn part of the way
  function curve(x0, y0, x1, y1) {
    const mx = (x0 + x1) / 2, pts = []; let L = 0;
    for (let k = 0; k <= 48; k++) {
      const u = k / 48, v = 1 - u;
      const p = [v * v * v * x0 + 3 * v * v * u * mx + 3 * v * u * u * mx + u * u * u * x1, v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * y1 + u * u * u * y1];
      if (k) L += Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]);
      pts.push([p[0], p[1], L]);
    }
    return { pts, L };
  }
  const at = (c, d) => { for (let i = 1; i < c.pts.length; i++) if (c.pts[i][2] >= d) { const a = c.pts[i - 1], b = c.pts[i], k = (d - a[2]) / (b[2] - a[2] || 1); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k] } return c.pts[c.pts.length - 1] };

  function build() {
    const r = dep.getBoundingClientRect();
    lines = []; W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR; x = cv.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!W || innerWidth < 768) { x.clearRect(0, 0, W, H); return }
    const ct = title.getBoundingClientRect(), cy = ct.top - r.top + ct.height / 2, lx = ct.left - r.left - 18, rx = ct.right - r.left + 18;
    $$('.home-owm_item', lists[0]).forEach((s, i) => { const b = s.getBoundingClientRect(); lines.push({ el: s, c: curve(b.right - r.left + 14, b.top - r.top + b.height / 2, lx, cy), col: IN, i, side: 0 }) });
    $$('.home-owm_item', lists[1]).forEach((s, i) => { const b = s.getBoundingClientRect(); lines.push({ el: s, c: curve(rx, cy, b.left - r.left - 14, b.top - r.top + b.height / 2), col: OUT, i, side: 1 }) });
    lines.forEach((l, k) => { l.el.onmouseenter = () => { hot = k; kick() }; l.el.onmouseleave = () => { hot = -1; kick() } });
    kick();
  }

  function draw(t) {
    if (!x) return;
    x.clearRect(0, 0, W, H);
    const age = seenAt ? t - seenAt : 0;
    let busy = false;
    for (let k = 0; k < lines.length; k++) {
      const l = lines[k], c = l.c;
      const q = RM ? 1 : seenAt ? clamp((age - (l.side ? OUT_DELAY_MS : 0) - l.i * STAGGER_MS) / DRAW_MS) : 0;
      if (q < 1) busy = true;
      if (q <= 0) continue;
      const e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; // ease in-out
      x.globalAlpha = hot < 0 ? .5 : hot === k ? 1 : .14;
      x.strokeStyle = l.col; x.lineWidth = hot === k ? 1.6 : 1.2;
      x.beginPath(); x.moveTo(c.pts[0][0], c.pts[0][1]);
      const lim = c.L * e; for (const p of c.pts) { if (p[2] > lim) { const m = at(c, lim); x.lineTo(m[0], m[1]); break } x.lineTo(p[0], p[1]) }
      x.stroke();
      // travelling dot
      if (!RM && q >= 1) {
        const u = (t / DOT_MS + l.i / 6 + (l.side ? .5 : 0)) % 1, p = at(c, c.L * u);
        x.globalAlpha = Math.sin(u * Math.PI); x.fillStyle = l.col;
        x.beginPath(); x.arc(p[0], p[1], 2.6, 0, 6.283); x.fill();
      }
    }
    x.globalAlpha = 1;
    return busy;
  }

  function loop(t) { raf = 0; if (!on) return; draw(t); if (!RM) raf = requestAnimationFrame(loop) }
  function kick() { if (RM) { draw(performance.now()); return } if (on && !raf) raf = requestAnimationFrame(loop) }

  if ('IntersectionObserver' in window) new IntersectionObserver(e => { on = e[0].isIntersecting; if (on && !seenAt && e[0].intersectionRatio >= .3) seenAt = performance.now(); kick() }, { threshold: [0, .3] }).observe(dep);
  else { on = true; seenAt = 1 }
  onLoad(build, 100);
  addEventListener('resize', debounce(build));
}
