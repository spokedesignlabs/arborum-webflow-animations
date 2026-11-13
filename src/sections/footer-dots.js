/* Footer (Home + About)
 *  - Dot field: soft breathing dots over the sky gradient, fading in towards the bottom. They don't react
 *    to the pointer.
 *  - Arborum wordmark: it rests softly see-through. When you reach the bottom of the page the name is revealed:
 *    white light sweeps across it left to right with a bright shine riding the edge, and it settles with a
 *    soft glow. A shine passes across it again every few seconds, and a peach glint drifts across the letters
 *    and follows the pointer. Scroll back up and it resets. The pointer stays the normal arrow.
 * Switch: footerLogo (off: the plain white wordmark image from Webflow). The dots always run.
 * Webflow elements: .footer_component > canvas.footer_dots, img.footer_wordmark (shown when the logo animation
 *   is off) and canvas.footer_wordmark-canvas right after it (hidden in Webflow; the script shows it).
 */
import { RM, ON, $, clamp, DPR, fit, visible, debounce, lift, canvasIn } from '../core/utils.js';

const SWEEP_MS = 1600;  // the reveal
const SHINE_MS = 1300;  // one shine pass after the reveal
const SHINE_EVERY = 6500;
const REST = .16;       // how see-through the name is before the reveal

export default function initFooterDots() {
  const foot = $('.footer_component');
  const dc = canvasIn(foot, 'footer_dots');
  if (!dc) return;
  dc.setAttribute('aria-hidden', 'true'); lift(foot);
  // the sky gradient the dots sit on (replaces the static footer picture while the script runs)
  const mq = matchMedia('(max-width:767px)');
  const bg = () => { foot.style.backgroundImage = mq.matches ? 'linear-gradient(#F3F2EE 0,#F2BF95 14%,#E6D5B7 38%,#6DC2F2 68%,#0071B1 100%)' : 'linear-gradient(#F3F2EE 0,#F2BF95 18%,#E6D5B7 34%,#6DC2F2 54%,#0071B1 84%)' };
  bg(); mq.addEventListener('change', bg);

  let df, fOn = false, hov = false, tx = .6, lx = .6, fLast = 0;
  const buildDots = () => { df = fit(dc) };
  buildDots(); addEventListener('resize', debounce(buildDots));
  foot.addEventListener('pointermove', e => { const r = foot.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; hov = true });
  foot.addEventListener('pointerleave', () => { hov = false });

  function drawDots(t) {
    const { x, w: W, h: H } = df; x.clearRect(0, 0, W, H);
    const s = 22, T = RM ? 0 : t / 5200;
    for (let y = 0, j = 0; y < H + s; y += s * .866, j++) {
      const fade = clamp((y / H - .35) / .4); // nothing in the top third, full by three quarters down
      if (fade <= 0) continue;
      for (let i = 0; i < W / s + 2; i++) {
        const X = (i + .5 * (j % 2)) * s;
        let v = .5 + .27 * Math.sin(X / 190 + T) + .23 * Math.sin(y / 130 - T * 1.3 + X / 420); v = Math.max(0, (v - .42) * 1.75);
        x.fillStyle = 'rgba(255,255,255,' + (clamp(.05 + v * .2) * fade).toFixed(3) + ')';
        x.beginPath(); x.arc(X, y, .9 + v * 3.6, 0, 6.283); x.fill();
      }
    }
  }

  // ---- Wordmark ----
  const img = $('.footer_wordmark', foot), wc = canvasIn(foot, 'footer_wordmark-canvas');
  const logoOn = ON('footerLogo') && img && wc;
  let wx = null, ww = 0, wh = 0, off = null, ox = null, ready = false, f = -14, flowed = false, flowRaf = 0, revealedAt = 0;
  const pic = new Image();
  function buildWord() {
    if (!ready) return;
    ww = wc.getBoundingClientRect().width; if (!ww) return;
    wh = ww * pic.naturalHeight / pic.naturalWidth;
    wc.style.height = wh + 'px'; wc.width = ww * DPR; wc.height = wh * DPR; wx = wc.getContext('2d'); wx.setTransform(DPR, 0, 0, DPR, 0, 0);
    off = off || document.createElement('canvas'); off.width = wc.width; off.height = wc.height; ox = off.getContext('2d'); ox.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawWord(performance.now());
  }
  // where the shine band is, as % across the name (null = none)
  function shineAt(t) {
    if (f < 114) return f > -14 ? f + 7 : null;          // riding the reveal edge
    const k = ((t - revealedAt) % SHINE_EVERY) / SHINE_MS; // then a pass every SHINE_EVERY ms
    return k <= 1 ? -20 + 140 * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) : null;
  }
  function drawWord(t) {
    if (!wx) return;
    wx.clearRect(0, 0, ww, wh);
    wx.globalAlpha = REST; wx.drawImage(pic, 0, 0, ww, wh); wx.globalAlpha = 1; // resting: soft, see-through white
    if (f <= -14) return;
    const o = ox;
    o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, ww, wh);
    o.drawImage(pic, 0, 0, ww, wh);
    // 1. the letters fill with white, with a peach glint that drifts and follows the pointer
    o.globalCompositeOperation = 'source-in';
    const span = ww * 2.4, x0 = (ww - span) * lx, g = o.createLinearGradient(x0, 0, x0 + span, 0);
    g.addColorStop(0, '#fff'); g.addColorStop(.42, '#fff'); g.addColorStop(.5, '#F2BF95'); g.addColorStop(.58, '#fff'); g.addColorStop(1, '#fff');
    o.fillStyle = g; o.fillRect(0, 0, ww, wh);
    // 2. the shine: a bright slanted band of light, only on the letters
    const sh = shineAt(t);
    if (sh != null) {
      o.globalCompositeOperation = 'source-atop';
      const c = ww * sh / 100, bw = ww * .09, b = o.createLinearGradient(c - bw, wh, c + bw, 0);
      b.addColorStop(0, 'rgba(255,255,255,0)'); b.addColorStop(.35, 'rgba(242,191,149,.55)'); b.addColorStop(.5, 'rgba(255,255,255,1)');
      b.addColorStop(.65, 'rgba(109,194,242,.5)'); b.addColorStop(1, 'rgba(255,255,255,0)');
      o.fillStyle = b; o.fillRect(0, 0, ww, wh);
    }
    // 3. reveal from the left up to f%, with a soft edge
    o.globalCompositeOperation = 'destination-in';
    const a = ww * f / 100, m = o.createLinearGradient(a, 0, a + ww * .14, 0);
    m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
    o.fillStyle = m; o.fillRect(0, 0, ww, wh);
    // a soft glow around the revealed letters
    wx.setTransform(1, 0, 0, 1, 0, 0);
    wx.shadowColor = 'rgba(255,255,255,' + (.25 + .25 * clamp((f + 14) / 128)) + ')'; wx.shadowBlur = 22 * DPR;
    wx.drawImage(off, 0, 0);
    wx.shadowBlur = 0; wx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function flowCheck() {
    const dist = document.documentElement.scrollHeight - (scrollY + innerHeight);
    if (dist <= 8 && !flowed) {
      flowed = true;
      if (RM) { f = 114; revealedAt = performance.now(); drawWord(revealedAt); return }
      const t0 = performance.now(); cancelAnimationFrame(flowRaf);
      (function g(t) { const k = clamp((t - t0) / SWEEP_MS), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; f = -14 + 128 * e; if (k < 1) flowRaf = requestAnimationFrame(g); else revealedAt = t })(t0);
    } else if (dist > 160 && flowed) { flowed = false; cancelAnimationFrame(flowRaf); f = -14; drawWord(performance.now()) }
  }
  if (logoOn) {
    wc.setAttribute('role', 'img'); wc.setAttribute('aria-label', img.alt || 'Arborum');
    pic.onload = () => { ready = true; img.style.display = 'none'; wc.style.display = 'block'; buildWord(); flowCheck() };
    pic.src = img.currentSrc || img.src;
    addEventListener('resize', debounce(buildWord));
    addEventListener('scroll', flowCheck, { passive: true });
  }

  visible(foot, v => { fOn = v });
  (function loop(t) {
    if (fOn && df) {
      if (!hov && !RM) tx = .5 + .34 * Math.sin(t / 4300);
      lx += (tx - lx) * .06;
      if (t - fLast > 33) { drawDots(t); if (logoOn) drawWord(t); fLast = t }
    }
    requestAnimationFrame(loop);
  })(0);
}
