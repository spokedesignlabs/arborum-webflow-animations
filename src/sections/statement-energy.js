/* Statement → Energy
 * The scroll story from the hero into the Energy photo:
 *  1. Threads: thin lines run down from the hero, pass either side of
 *     "AI for critical decisions and continuous innovation." and curve onto the top of the Energy section.
 *  2. Pin: the Energy section stays on screen while you scroll (it is made taller and its content
 *     sits in a sticky "stage"). The photo fades in from the cream background and slowly zooms in.
 *  3. The threads continue on the photo and land on the three tower tops.
 *  4. The "01 · Our first frontier / Energy" title, then the heading, then the paragraph fade in.
 *  5. Each tower top gets a pulsing point; hover or tap it for a small card.
 *  6. "critical decisions" becomes a highlighted phrase that opens an info window.
 * Attaches to: .section_home-hero, .section_home-statement, #energy (.home-energy_photo, .home-energy_scrim,
 *              .home-energy_title, .home-energy_copy)
 * Styles: src/styles/statement-energy.css
 */
import { RM, $, clamp, DPR, debounce, onLoad, SVGNS } from '../core/utils.js';
import { makeTrigger } from '../ui/popups.js';

// The photo is 1536×1024. Tower tops in photo pixels, with the card text for each.
const IMG = [1536, 1024];
const FOCUS = [730, 560]; // the point the zoom moves towards
const ZOOM = 0.28;        // how much the photo zooms in over the pinned scroll
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

export default function initStatementEnergy() {
  const hero = $('.section_home-hero'), bridge = $('.section_home-statement'), pin = $('#energy');
  if (!hero || !bridge || !pin) return;
  const ph = pin.querySelector('.home-energy_photo');
  const heading = bridge.querySelector('h2');

  // "critical decisions" → info window
  const hl = bridge.querySelector('.home-statement_highlight');
  if (hl) makeTrigger(hl, CRITICAL, { width: 440 });

  // ---- Pin: move the section's content into a sticky stage ----
  const stage = document.createElement('div');
  stage.className = 'wf-stage';
  while (pin.firstChild) stage.appendChild(pin.firstChild);
  pin.appendChild(stage);
  pin.classList.add('wf-pin');
  const title = stage.querySelector('.home-energy_title'), copy = stage.querySelector('.home-energy_copy');
  // text pieces fade in one after another: wf-e0 title, wf-e1 heading, wf-e2 paragraph
  [title, copy && copy.querySelector('h3'), copy && copy.querySelector('p')].forEach((el, i) => el && el.classList.add('wf-e' + i));

  // Threads on the photo (canvas inside the stage)
  const stc = document.createElement('canvas'); stc.className = 'wf-sthreads'; stc.setAttribute('aria-hidden', 'true');
  stage.appendChild(stc);
  let stx = null, cW = 0, cH = 0;

  // Threads from the hero down past the statement (one SVG over hero + statement)
  const host = pin.parentElement;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'wf-threads'); svg.setAttribute('aria-hidden', 'true');
  host.insertBefore(svg, host.firstChild);
  let paths = [];

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
  const card = document.createElement('div'); card.className = 'wf-tcard'; card.setAttribute('role', 'tooltip'); stage.appendChild(card);
  let hots = [], openI = -1;
  function show(i) {
    const d = TOWERS[i], b = hots[i]; openI = i;
    card.innerHTML = '<div class="k">Arborum view</div><h5>' + d[2] + '</h5><dl><dt>What it is</dt><dd>' + d[3] + '</dd><dt>Status</dt><dd>' + d[4] + '</dd><dt>Model sees</dt><dd>' + d[5] + '</dd></dl>';
    const x = parseFloat(b.style.left), y = parseFloat(b.style.top), W = stage.offsetWidth, w = card.offsetWidth || 250;
    let left = x + 26; if (left + w > W - 24) left = x - 26 - w;
    card.style.left = Math.max(16, left) + 'px';
    card.style.top = Math.min(Math.max(80, y - 60), stage.offsetHeight - card.offsetHeight - 24) + 'px';
    card.classList.add('in');
  }
  function hide() { openI = -1; card.classList.remove('in'); hots.forEach(h => h.__tap = false) }

  let ENTRY = [], stageS = 0, stageE = 0;

  function build() {
    if (!stage.offsetWidth) return;
    // tower points
    hots.forEach(h => h.remove());
    hots = TOWERS.map((p, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'wf-thot';
      b.setAttribute('aria-label', 'Details for ' + p[2]);
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('mouseleave', () => { if (!b.__tap) hide() });
      b.addEventListener('focus', () => show(i)); b.addEventListener('blur', hide);
      b.addEventListener('click', e => { e.stopPropagation(); b.__tap = true; openI === i ? hide() : show(i) });
      stage.appendChild(b); return b;
    });
    // canvas on the photo
    cW = stage.offsetWidth; cH = stage.offsetHeight;
    stc.width = cW * DPR; stc.height = cH * DPR; stx = stc.getContext('2d'); stx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // the hero → statement threads end where the photo threads start
    ENTRY = tips(1);
    svg.innerHTML = ''; paths = [];
    const R = host.getBoundingClientRect(), pr = pin.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    const W = R.width, H = pr.top - R.top + 2;
    svg.style.height = H + 'px'; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const sy = hr.top - R.top + hero.offsetHeight * .98;
    const rg = document.createRange(); rg.selectNodeContents(heading); const tr = rg.getBoundingClientRect();
    const tb = tr.bottom - R.top + 18;
    let nR = ENTRY.filter(t => t[0] > W / 2).length, nL = 0;
    ENTRY.forEach(t => {
      const ex = t[0], ey = pr.top - R.top;
      const sx = ex > W / 2 ? Math.min(W - 10, tr.right + 44 + (--nR) * 56) : Math.max(10, tr.left - 44 - (nL++) * 56);
      const mid = tb + (ey - tb) * .5;
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', `M${sx} ${sy} L${sx} ${tb} C ${sx} ${mid}, ${ex} ${mid}, ${ex} ${ey}`);
      svg.appendChild(p);
      const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = RM ? 0 : L;
      const dot = document.createElementNS(SVGNS, 'circle'); dot.setAttribute('r', '4'); svg.appendChild(dot);
      paths.push({ p, L, dot });
    });
    tick();
  }

  function drawStage() {
    if (!stx || !cW) return;
    const f = stx; f.clearRect(0, 0, cW, cH);
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
    // 1. hero → statement threads
    const top = hero.getBoundingClientRect().top + scrollY;
    // draws between 45% down the hero and the statement leaving the screen (at least half a screen of scroll)
    const a = top + hero.offsetHeight * .45, b = Math.max(a + vh * .5, top + hero.offsetHeight + bridge.offsetHeight - vh * .92);
    const prog = clamp((scrollY - a) / (b - a));
    paths.forEach(({ p, L, dot }, i) => {
      const q = clamp(prog * 1.12 - i * .04);
      if (!RM) p.style.strokeDashoffset = L * (1 - q);
      const pt = p.getPointAtLength(L * q);
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); dot.style.opacity = q > 0 && q < 1 ? 1 : 0;
    });
    // 2. pinned stage progress
    const pr = pin.getBoundingClientRect(), trav = Math.max(1, pr.height - vh);
    stageS = clamp(-pr.top / trav);
    stageE = RM ? 1 : clamp((vh * .92 - pr.top) / (vh * .92 + trav * .06));
    const enter = RM ? 1 : clamp((vh - pr.top) / vh);
    zoom = 1 + ZOOM * (RM ? 0 : stageS);
    // photo framing follows the zoom
    if (ph) {
      const o = cover([0, 0]), e = cover(IMG);
      ph.style.backgroundSize = (e[0] - o[0]).toFixed(1) + 'px ' + (e[1] - o[1]).toFixed(1) + 'px';
      ph.style.backgroundPosition = o[0].toFixed(1) + 'px ' + o[1].toFixed(1) + 'px';
      stage.style.setProperty('--hp', (e[1] - o[1]).toFixed(0) + 'px');
    }
    stage.classList.toggle('r1eport', stage.offsetWidth < stage.offsetHeight);
    stage.style.setProperty('--en', enter.toFixed(3));
    hots.forEach((h, i) => { const q = cover(TOWERS[i]); h.style.left = q[0] + 'px'; h.style.top = q[1] + 'px' });
    stage.classList.toggle('is-hot', stageS > .06);
    if (stageS <= .06) hide();
    // 4. text
    stage.classList.toggle('is-a', RM || stageS > .12);
    stage.classList.toggle('is-b', RM || stageS > .42);
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
