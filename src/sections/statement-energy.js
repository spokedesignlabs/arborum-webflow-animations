/* Statement → Energy
 * The scroll story from the hero into the Energy photo:
 *  1. Threads: thin lines draw down from the hero as you scroll, pass either side of
 *     "AI for critical decisions and continuous innovation." and curve onto the top of the Energy section.
 *  2. Pin: the Energy section stays on screen while you scroll (it is made taller and its stage is sticky).
 *     The photo fades in from the cream background and slowly zooms in.
 *  3. The threads continue on the photo and land on the three tower tops.
 *  4. The "01 · Our first frontier / Energy" title, then the heading, then the paragraph fade in.
 *  5. Each tower top gets a pulsing point; hover or tap it for a small card.
 *  6. "critical decisions" opens an info window.
 *
 * Webflow elements (all styled in Webflow):
 *   canvas.home-statement_threads   first child of .main-wrapper (threads over the hero and statement)
 *   .home-statement_highlight       the "critical decisions" phrase
 *   #energy > .home-energy_stage    wraps .home-energy_photo, .home-energy_scrim, .home-energy_padding and:
 *     canvas.home-energy_threads, .home-energy_point ×3,
 *     .home-energy_card (> .home-energy_card-title, .home-energy_card-value ×3)
 * Switch: frontierThreads (off: no threads; the pin, zoom, text and tower points stay).
 * The pin itself (section height, sticky stage, photo framing) is applied here, so with the script off
 * the Energy section is a normal full-screen section.
 */
import { RM, ON, $, $$, clamp, DPR, debounce, onLoad, canvasIn, play } from '../core/utils.js';
import { makeTrigger } from '../ui/popups.js';

// The photo is 1536×1024. Tower tops in photo pixels, with the card text for each.
const IMG = [1536, 1024];
const FOCUS = [730, 560]; // the point the zoom moves towards
const ZOOM = 0.28;        // how much the photo zooms in over the pinned scroll
const PIN = { desktop: '270vh', phone: '230vh' }; // how long the Energy section stays on screen
const TOWERS = [
  [402, 497, 'Transmission line', 'Moves power from plants to cities', 'Carrying load', 'Hot afternoons lower how much it can carry'],
  [668, 497, 'Grid corridor', 'A shared route for many lines', 'Linked', 'A fault here reroutes power across the grid'],
  [1062, 380, 'Demand ahead', 'Cities at the end of the line', 'Rising', 'Evening peak on its way']
];
const CRITICAL = {
  k: 'Critical decisions', t: 'Decisions that cannot wait',
  p: 'Some decisions keep a city running: how much power to make, when to store it, where to send it. They have to be right, and they have to be made fast.',
  l: ['A storm is forecast for tomorrow', 'Wind output will drop', 'Gas plants need to be ready', 'The plan is set before the storm arrives']
};
const SCRIM = 'linear-gradient(rgba(5,19,28,0) 0%,rgba(5,19,28,.12) 35%,rgba(5,19,28,.62) 62%,rgba(5,19,28,.9) 100%)';
const SCRIM_PORTRAIT = hp => `linear-gradient(rgba(5,19,28,0) 0,rgba(5,19,28,0) ${hp * .5}px,rgba(5,19,28,.45) ${hp * .8}px,#05131C ${hp}px,#05131C 100%)`;

export default function initStatementEnergy() {
  const hero = $('.section_home-hero'), bridge = $('.section_home-statement'), pin = $('#energy');
  const stage = pin && $('.home-energy_stage', pin);
  if (!hero || !bridge || !stage) return;
  const ph = $('.home-energy_photo', stage), scrim = $('.home-energy_scrim', stage), pad = $('.home-energy_padding', stage);
  const heading = bridge.querySelector('h2');

  // "critical decisions" → info window
  const hl = $('.home-statement_highlight', bridge);
  if (hl) makeTrigger(hl, CRITICAL, { width: 440 });

  // ---- Pin (only while the script runs) ----
  const phone = matchMedia('(max-width:767px)');
  const pinStyle = () => Object.assign(pin.style, { height: phone.matches ? PIN.phone : PIN.desktop, minHeight: '0', padding: '0', overflow: 'visible', display: 'block', backgroundColor: '#F3F2EE' });
  if (!RM) {
    pinStyle(); phone.addEventListener('change', pinStyle);
    Object.assign(stage.style, { position: 'sticky', top: '0', height: '100svh', overflow: 'hidden', backgroundColor: '#F3F2EE' });
    if (ph) Object.assign(ph.style, { position: 'absolute', inset: '0', zIndex: '0', backgroundRepeat: 'no-repeat' });
    if (scrim) Object.assign(scrim.style, { position: 'absolute', inset: '0', zIndex: '1', pointerEvents: 'none' });
    if (pad) Object.assign(pad.style, { position: 'relative', zIndex: '4', width: '100%' });
  }

  // text pieces fade in one after another: title, heading, paragraph
  const copy = $('.home-energy_copy', stage);
  const texts = [$('.home-energy_title', stage), copy && copy.querySelector('h3'), copy && copy.querySelector('p')].filter(Boolean);
  if (!RM) texts.forEach((el, i) => { el.style.transition = `opacity .7s ${i === 1 ? '.12s' : '0s'},transform .7s cubic-bezier(.2,.7,.2,1) ${i === 1 ? '.12s' : '0s'}`; el.style.opacity = '0'; el.style.transform = 'translateY(22px)' });
  const showText = (el, on) => { el.style.opacity = on ? '1' : '0'; el.style.transform = on ? 'none' : 'translateY(22px)' };

  // ---- Photo framing: same maths for the photo and the tower points ----
  let zoom = 1;
  function cover(p, z = zoom) {
    const W = stage.offsetWidth, H = stage.offsetHeight, P = W < H;
    const k = P ? Math.min(W / 760, H * .78 / IMG[1]) : Math.max(W / IMG[0], H / IMG[1]);
    const zz = P ? 1 : z;
    const ox = P ? Math.min(0, Math.max(W - IMG[0] * k, W / 2 - FOCUS[0] * k)) : (W - IMG[0] * k) / 2;
    const oy = P ? 0 : (H - IMG[1] * k) / 2;
    const b = q => [ox + q[0] * k, oy + q[1] * k], fs = b(FOCUS), bp = b(p);
    return [fs[0] + (bp[0] - fs[0]) * zz, fs[1] + (bp[1] - fs[1]) * zz];
  }
  const tips = z => TOWERS.map(p => cover(p, z)).sort((a, b) => b[0] - a[0]);

  // ---- Tower points and card ----
  const hots = $$('.home-energy_point', stage).slice(0, TOWERS.length);
  const card = $('.home-energy_card', stage);
  const cTitle = card && $('.home-energy_card-title', card), cVals = card ? $$('.home-energy_card-value', card) : [];
  let openI = -1, hotOn = false;
  if (card) card.setAttribute('role', 'tooltip');
  function show(i) {
    if (!card) return;
    const d = TOWERS[i], b = hots[i]; openI = i;
    if (cTitle) cTitle.textContent = d[2];
    cVals.forEach((v, k) => v.textContent = d[3 + k] || '');
    const x = parseFloat(b.style.left), y = parseFloat(b.style.top), W = stage.offsetWidth, w = card.offsetWidth || 250;
    let left = x + 26; if (left + w > W - 24) left = x - 26 - w;
    card.style.left = Math.max(16, left) + 'px';
    card.style.top = Math.min(Math.max(80, y - 60), stage.offsetHeight - card.offsetHeight - 24) + 'px';
    card.style.opacity = '1'; card.style.transform = 'none';
  }
  function hide() { openI = -1; if (card) { card.style.opacity = ''; card.style.transform = '' } hots.forEach(h => h.__tap = false) }
  hots.forEach((b, i) => {
    b.setAttribute('role', 'button'); b.tabIndex = 0; b.setAttribute('aria-label', 'Details for ' + TOWERS[i][2]);
    b.addEventListener('mouseenter', () => show(i));
    b.addEventListener('mouseleave', () => { if (!b.__tap) hide() });
    b.addEventListener('focus', () => show(i)); b.addEventListener('blur', hide);
    b.addEventListener('click', e => { e.stopPropagation(); b.__tap = true; openI === i ? hide() : show(i) });
    // soft ping around each point
    if (!RM) play(b, [{ boxShadow: '0 0 0 0 rgba(109,194,242,.55)' }, { boxShadow: '0 0 0 14px rgba(109,194,242,0)', offset: .7 }, { boxShadow: '0 0 0 0 rgba(109,194,242,0)' }], { duration: 2400, iterations: Infinity, easing: 'ease-out', fill: 'none' });
  });
  const setHot = on => { if (on === hotOn) return; hotOn = on; hots.forEach(b => { b.style.opacity = on ? '1' : ''; b.style.pointerEvents = on ? 'auto' : '' }) };

  // ---- Canvases ----
  const threadsOn = ON('frontierThreads');
  const tc = threadsOn ? canvasIn(document, 'home-statement_threads') : null; // hero → statement
  const sc = threadsOn ? canvasIn(stage, 'home-energy_threads') : null;       // on the photo
  let tx = null, tW = 0, tH = 0, sx = null, cW = 0, cH = 0, threads = [], ENTRY = [], stageS = 0, stageE = 0, prog = 0;

  // a thread is a list of points with running lengths, so it can be drawn part of the way
  function polyline(pts) { let L = 0; const out = [[pts[0][0], pts[0][1], 0]]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); out.push([pts[i][0], pts[i][1], L]) } return { pts: out, L } }
  function strokePart(c, t, q) {
    const lim = t.L * q; let last = t.pts[0];
    c.beginPath(); c.moveTo(last[0], last[1]);
    for (const p of t.pts) { if (p[2] > lim) { const k = (lim - last[2]) / (p[2] - last[2] || 1); last = [last[0] + (p[0] - last[0]) * k, last[1] + (p[1] - last[1]) * k]; c.lineTo(last[0], last[1]); break } c.lineTo(p[0], p[1]); last = p }
    c.stroke(); return last;
  }

  function build() {
    if (!stage.offsetWidth) return;
    ENTRY = tips(1);
    if (sc) { cW = stage.offsetWidth; cH = stage.offsetHeight; sc.width = cW * DPR; sc.height = cH * DPR; sx = sc.getContext('2d'); sx.setTransform(DPR, 0, 0, DPR, 0, 0) }
    if (tc) {
      const host = tc.offsetParent || document.body;
      const R = host.getBoundingClientRect(), pr = pin.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      tW = R.width; tH = pr.top - R.top + 2;
      tc.style.height = tH + 'px'; tc.width = tW * DPR; tc.height = tH * DPR; tx = tc.getContext('2d'); tx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const sy = hr.top - R.top + hero.offsetHeight * .98;
      const rg = document.createRange(); rg.selectNodeContents(heading); const tr = rg.getBoundingClientRect();
      const tl = tr.left - R.left, trr = tr.right - R.left, tb = tr.bottom - R.top + 18;
      let nR = ENTRY.filter(t => t[0] > tW / 2).length, nL = 0;
      threads = ENTRY.map(t => {
        const ex = t[0], ey = pr.top - R.top;
        const x0 = ex > tW / 2 ? Math.min(tW - 10, trr + 44 + (--nR) * 56) : Math.max(10, tl - 44 - (nL++) * 56);
        const mid = tb + (ey - tb) * .5, pts = [[x0, sy], [x0, tb]];
        for (let k = 1; k <= 40; k++) { const u = k / 40, v = 1 - u; pts.push([v * v * v * x0 + 3 * v * v * u * x0 + 3 * v * u * u * ex + u * u * u * ex, v * v * v * tb + 3 * v * v * u * mid + 3 * v * u * u * mid + u * u * u * ey]) }
        return polyline(pts);
      });
    }
    tick();
  }

  function drawThreads() {
    if (!tx) return;
    tx.clearRect(0, 0, tW, tH);
    tx.lineWidth = 1.2; tx.strokeStyle = 'rgba(5,19,28,.5)'; tx.fillStyle = '#05131C';
    threads.forEach((t, i) => {
      const q = RM ? 1 : clamp(prog * 1.12 - i * .04); if (q <= 0) return;
      const tip = strokePart(tx, t, q);
      if (q < 1) { tx.beginPath(); tx.arc(tip[0], tip[1], 4, 0, 6.283); tx.fill() }
    });
  }

  function drawStage() {
    if (!sx || !cW) return;
    const f = sx; f.clearRect(0, 0, cW, cH);
    tips().forEach((t, i) => {
      const e = ENTRY[i]; if (!e) return;
      const q = clamp(stageE * 1.08 - i * .04); if (q <= 0) return;
      const B = u => { const v = 1 - u, x0 = e[0], y0 = 0, x1 = e[0], y1 = t[1] * .5, x2 = t[0], y2 = t[1] * .55, x3 = t[0], y3 = t[1]; return [v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3, v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3] };
      const gg = f.createLinearGradient(0, 0, 0, cH * .42);
      gg.addColorStop(0, 'rgba(5,19,28,.5)'); gg.addColorStop(.55, 'rgba(5,19,28,.35)'); gg.addColorStop(1, 'rgba(255,255,255,.85)');
      f.strokeStyle = gg; f.lineWidth = 1.3; f.beginPath(); f.moveTo(e[0], 0);
      for (let k = 1; k <= 40; k++) { const p = B(k / 40 * q); f.lineTo(p[0], p[1]) }
      f.stroke();
      const h = B(q); f.fillStyle = h[1] < cH * .3 ? '#05131C' : '#fff';
      f.beginPath(); f.arc(h[0], h[1], q < 1 ? 4 : 2.6, 0, 6.283); f.fill();
      if (q >= 1) { f.strokeStyle = 'rgba(255,255,255,.6)'; f.beginPath(); f.arc(h[0], h[1], 7, 0, 6.283); f.stroke() }
    });
  }

  function tick() {
    const vh = innerHeight;
    // 1. hero → statement threads: draw between 45% down the hero and the statement leaving the screen
    const top = hero.getBoundingClientRect().top + scrollY;
    const a = top + hero.offsetHeight * .45, b = Math.max(a + vh * .5, top + hero.offsetHeight + bridge.offsetHeight - vh * .92);
    prog = clamp((scrollY - a) / (b - a));
    drawThreads();
    // 2. pinned stage progress
    const pr = pin.getBoundingClientRect(), trav = Math.max(1, pr.height - vh);
    stageS = clamp(-pr.top / trav);
    stageE = RM ? 1 : clamp((vh * .92 - pr.top) / (vh * .92 + trav * .06));
    const enter = RM ? 1 : clamp((vh - pr.top) / vh);
    zoom = 1 + ZOOM * (RM ? 0 : stageS);
    const portrait = stage.offsetWidth < stage.offsetHeight;
    // photo framing follows the zoom; it fades in from the cream at the top as the section arrives
    if (ph && !RM) {
      const o = cover([0, 0]), e = cover(IMG), hp = e[1] - o[1];
      ph.style.backgroundSize = (e[0] - o[0]).toFixed(1) + 'px ' + hp.toFixed(1) + 'px';
      ph.style.backgroundPosition = o[0].toFixed(1) + 'px ' + o[1].toFixed(1) + 'px';
      const m = `linear-gradient(transparent 0,rgba(0,0,0,.35) ${(4 + (1 - enter) * 16).toFixed(2)}%,#000 ${(16 + (1 - enter) * 34).toFixed(2)}%)`;
      ph.style.webkitMaskImage = ph.style.maskImage = m;
      if (scrim) scrim.style.backgroundImage = portrait ? SCRIM_PORTRAIT(hp) : SCRIM;
      stage.style.backgroundColor = portrait ? '#05131C' : '#F3F2EE';
    }
    hots.forEach((h, i) => { const q = cover(TOWERS[i]); h.style.left = q[0] + 'px'; h.style.top = q[1] + 'px' });
    setHot(stageS > .06);
    if (stageS <= .06 && openI >= 0) hide();
    // 4. text
    if (!RM) texts.forEach((el, i) => showText(el, stageS > (i < 2 ? .12 : .42)));
    drawStage();
  }

  addEventListener('scroll', tick, { passive: true });
  document.addEventListener('click', hide);
  let lw = innerWidth;
  addEventListener('resize', debounce(() => { if (innerWidth !== lw) { lw = innerWidth; build() } else tick() }));
  onLoad(build, 300);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => onLoad(build, 300));
  tick();
}
