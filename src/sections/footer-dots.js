/* Footer (Home + About)
 *  - Dot field: soft breathing dots over the sky gradient, fading in towards the bottom. They don't react to the pointer.
 *  - Arborum logo: sits in white. Once it is in view, a wave of the brand colours (cream and peach) sweeps through it
 *    left to right, then a softer, fainter wave drifts back right to left. No hover effect. Scroll back up and it resets.
 * Switch: footerLogo (off: the plain white logo image from Webflow). The dots always run.
 * Webflow elements: .footer_component > canvas.footer_dots, img.footer_wordmark (shown when the logo animation
 *   is off) and canvas.footer_wordmark-canvas right after it (hidden in Webflow; the script shows it).
 */
import { RM, ON, $, clamp, mix, rgba, DPR, fit, visible, debounce, lift, canvasIn } from '../core/utils.js';


export default function initFooterDots() {
  const foot = $('.footer_component');
  const dc = canvasIn(foot, 'footer_dots');
  if (!dc) return;
  dc.setAttribute('aria-hidden', 'true'); lift(foot);
  // the sky gradient the dots sit on (replaces the static footer picture while the script runs)
  const mq = matchMedia('(max-width:767px)');
  const bg = () => { foot.style.backgroundImage = mq.matches ? 'linear-gradient(#F3F2EE 0,#F2BF95 14%,#E6D5B7 38%,#6DC2F2 68%,#0071B1 100%)' : 'linear-gradient(#F3F2EE 0,#F2BF95 18%,#E6D5B7 34%,#6DC2F2 54%,#0071B1 84%)' };
  bg(); mq.addEventListener('change', bg);

  let df, fOn = false, fLast = 0;
  const buildDots = () => { df = fit(dc) };
  buildDots(); addEventListener('resize', debounce(buildDots));

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
  // The logo sits in white. Once it is in view, a cream-and-peach wave sweeps through it left to right, then a softer,
  // fainter wave drifts back right to left. Scroll back up and it resets.
  const WAVE_AT = .2, WAVE_S = 1.7, BACK_GAP = .15, BACK_S = 1.5, BACK_STRENGTH = .45;
  const img = $('.footer_wordmark', foot), wc = canvasIn(foot, 'footer_wordmark-canvas');
  const logoOn = ON('footerLogo') && img && wc;
  let wx = null, ww = 0, wh = 0, off = null, ox = null, ready = false, state = 'rest', t0 = 0;
  const pic = new Image(); pic.crossOrigin = 'anonymous';
  function buildWord() {
    if (!ready) return;
    ww = wc.getBoundingClientRect().width; if (!ww) return;
    wh = ww * pic.naturalHeight / pic.naturalWidth;
    wc.style.height = wh + 'px'; wc.width = ww * DPR; wc.height = wh * DPR; wx = wc.getContext('2d'); wx.setTransform(DPR, 0, 0, DPR, 0, 0);
    off = off || document.createElement('canvas'); off.width = wc.width; off.height = wc.height; ox = off.getContext('2d'); ox.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawWord(performance.now());
  }
  // one band of colour at its place in the sweep (dir 1 = left to right, -1 = back)
  function band(o, w, dir, strength) {
    const sm = w < .5 ? 2 * w * w : 1 - Math.pow(-2 * w + 2, 2) / 2, pos = dir > 0 ? sm : 1 - sm, c = ww * (-.25 + 1.5 * pos), bw = ww * (dir > 0 ? .16 : .12);
    const cream = rgba(mix([255, 255, 255], [230, 213, 183], strength)), peach = rgba(mix([255, 255, 255], [242, 191, 149], strength));
    // one full-width gradient: white everywhere except the band (filling only the band would erase the rest)
    const g = o.createLinearGradient(0, 0, ww, 0), at = x => clamp(x / ww);
    g.addColorStop(0, '#fff'); g.addColorStop(at(c - bw), '#fff'); g.addColorStop(at(c - bw * .4), cream);
    g.addColorStop(at(c), peach); g.addColorStop(at(c + bw * .4), cream); g.addColorStop(at(c + bw), '#fff'); g.addColorStop(1, '#fff');
    o.globalCompositeOperation = 'source-in'; o.fillStyle = g; o.fillRect(0, 0, ww, wh);
  }
  function drawWord(t) {
    if (!wx) return;
    wx.clearRect(0, 0, ww, wh);
    if (state === 'rest') { wx.drawImage(pic, 0, 0, ww, wh); return }
    const e = (t - t0) / 1000, o = ox;
    o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, ww, wh); o.drawImage(pic, 0, 0, ww, wh);
    const w1 = (e - WAVE_AT) / WAVE_S, w2 = (e - WAVE_AT - WAVE_S - BACK_GAP) / BACK_S;
    if (w1 > 0 && w1 < 1) band(o, w1, 1, 1);
    else if (w2 > 0 && w2 < 1) band(o, w2, -1, BACK_STRENGTH);
    wx.save(); wx.setTransform(1, 0, 0, 1, 0, 0); wx.drawImage(off, 0, 0); wx.restore();
  }
  // plays once the logo is well in view; resets when it is out of view below
  function flowCheck() {
    const r = wc.getBoundingClientRect();
    if (state === 'rest' && r.bottom < innerHeight - 10 && !RM) { state = 'shown'; t0 = performance.now() }
    else if (state === 'shown' && r.top > innerHeight) state = 'rest';
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
      if (logoOn) drawWord(t);
      if (t - fLast > 33) { drawDots(t); fLast = t }
    }
    requestAnimationFrame(loop);
  })(0);
}
