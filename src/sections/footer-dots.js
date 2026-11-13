/* Footer (Home + About)
 *  - Dot field: breathing dots over the sky gradient, fading in towards the bottom; dots near the pointer brighten.
 *  - Arborum wordmark: it rests softly see-through. When you reach the bottom of the page, white light
 *    sweeps across it once, left to right; a peach glint then drifts across it and follows the pointer.
 *    Scroll back up and it resets. The pointer stays the normal arrow everywhere.
 * Webflow elements: .footer_component > canvas.footer_dots, img.footer_wordmark (shown when the script is off)
 *   and canvas.footer_wordmark-canvas right after it (hidden in Webflow; the script shows it and hides the image).
 */
import { RM, $, clamp, DPR, fit, visible, debounce, lift, canvasIn } from '../core/utils.js';

const SWEEP_MS = 1500;

export default function initFooterDots() {
  const foot = $('.footer_component');
  const dc = canvasIn(foot, 'footer_dots');
  if (!dc) return;
  dc.setAttribute('aria-hidden', 'true'); lift(foot);
  // the sky gradient the dots sit on (replaces the static footer picture while the script runs)
  const mq = matchMedia('(max-width:767px)');
  const bg = () => { foot.style.backgroundImage = mq.matches ? 'linear-gradient(#F3F2EE 0,#F2BF95 14%,#E6D5B7 38%,#6DC2F2 68%,#0071B1 100%)' : 'linear-gradient(#F3F2EE 0,#F2BF95 18%,#E6D5B7 34%,#6DC2F2 54%,#0071B1 84%)' };
  bg(); mq.addEventListener('change', bg);

  let df, fOn = false, mxy = null, hov = false, tx = .6, lx = .6, fLast = 0;
  const buildDots = () => { df = fit(dc) };
  buildDots(); addEventListener('resize', debounce(buildDots));
  foot.addEventListener('pointermove', e => { const r = foot.getBoundingClientRect(); mxy = { x: e.clientX - r.left, y: e.clientY - r.top }; tx = (e.clientX - r.left) / r.width; hov = true });
  foot.addEventListener('pointerleave', () => { mxy = null; hov = false });

  function drawDots(t) {
    const { x, w: W, h: H } = df; x.clearRect(0, 0, W, H);
    const s = 22, T = RM ? 0 : t / 5200;
    for (let y = 0, j = 0; y < H + s; y += s * .866, j++) {
      const fade = clamp((y / H - .35) / .4); // nothing in the top third, full by three quarters down
      if (fade <= 0) continue;
      for (let i = 0; i < W / s + 2; i++) {
        const X = (i + .5 * (j % 2)) * s;
        let v = .5 + .27 * Math.sin(X / 190 + T) + .23 * Math.sin(y / 130 - T * 1.3 + X / 420); v = Math.max(0, (v - .42) * 1.75);
        let g = 0; if (mxy) { const d = Math.hypot(X - mxy.x, y - mxy.y); g = Math.exp(-d * d / (2 * 125 * 125)) }
        x.fillStyle = 'rgba(255,255,255,' + (clamp(.05 + v * .2 + g * .55) * fade).toFixed(3) + ')';
        x.beginPath(); x.arc(X, y, .9 + v * 3.6 + g * 3.4, 0, 6.283); x.fill();
      }
    }
  }

  // ---- Wordmark ----
  const img = $('.footer_wordmark', foot), wc = canvasIn(foot, 'footer_wordmark-canvas');
  let wx = null, ww = 0, wh = 0, off = null, ox = null, ready = false, f = -14, flowed = false, flowRaf = 0;
  function buildWord() {
    if (!ready) return;
    ww = wc.parentElement.clientWidth ? wc.getBoundingClientRect().width : 0; if (!ww) return;
    wh = ww * pic.naturalHeight / pic.naturalWidth;
    wc.style.height = wh + 'px'; wc.width = ww * DPR; wc.height = wh * DPR; wx = wc.getContext('2d'); wx.setTransform(DPR, 0, 0, DPR, 0, 0);
    off = off || document.createElement('canvas'); off.width = wc.width; off.height = wc.height; ox = off.getContext('2d'); ox.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawWord();
  }
  function drawWord() {
    if (!wx) return;
    wx.clearRect(0, 0, ww, wh);
    wx.globalAlpha = .28; wx.drawImage(pic, 0, 0, ww, wh); wx.globalAlpha = 1; // resting: soft, see-through white
    if (f <= -14) return;
    // the light: white with a peach band, cut to the letters, revealed from the left up to f%
    ox.globalCompositeOperation = 'source-over'; ox.clearRect(0, 0, ww, wh);
    ox.drawImage(pic, 0, 0, ww, wh);
    ox.globalCompositeOperation = 'source-in';
    const span = ww * 2.4, x0 = (ww - span) * lx, g = ox.createLinearGradient(x0, 0, x0 + span, 0);
    g.addColorStop(0, '#fff'); g.addColorStop(.42, '#fff'); g.addColorStop(.5, '#F2BF95'); g.addColorStop(.58, '#fff'); g.addColorStop(1, '#fff');
    ox.fillStyle = g; ox.fillRect(0, 0, ww, wh);
    ox.globalCompositeOperation = 'destination-in';
    const a = ww * f / 100, m = ox.createLinearGradient(a, 0, a + ww * .14, 0);
    m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
    ox.fillStyle = m; ox.fillRect(0, 0, ww, wh);
    wx.setTransform(1, 0, 0, 1, 0, 0); wx.drawImage(off, 0, 0); wx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function flowCheck() {
    const dist = document.documentElement.scrollHeight - (scrollY + innerHeight);
    if (dist <= 8 && !flowed) {
      flowed = true;
      if (RM) { f = 114; drawWord(); return }
      const t0 = performance.now(); cancelAnimationFrame(flowRaf);
      (function g(t) { const k = clamp((t - t0) / SWEEP_MS), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; f = -14 + 128 * e; if (k < 1) flowRaf = requestAnimationFrame(g) })(t0);
    } else if (dist > 160 && flowed) { flowed = false; cancelAnimationFrame(flowRaf); f = -14; drawWord() }
  }
  const pic = new Image();
  if (img && wc) {
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
      if (t - fLast > 33) { drawDots(t); drawWord(); fLast = t }
    }
    requestAnimationFrame(loop);
  })(0);
}
