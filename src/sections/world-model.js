/* The World Model playground
 * A ripple network with ten options (Weather, Price, …) sitting on its nodes.
 *  - Click an option: a wave spreads from it across the network. Each other option is marked
 *    "Affected" at the moment the wave reaches it (nearest first), and an info window explains the option.
 *  - While nobody has clicked, a wave starts from one of the first four options every 3.6 seconds.
 * Attaches to: .home-world_network with its .home-world_chip children
 * Styles: src/styles/world-model.css
 */
import { RM, $$, clamp, debounce, visible, keyable } from '../core/utils.js';
import Net from '../core/net.js';
import { openWindow } from '../ui/popups.js';

// [label, x, y] as a share of the network's width and height: each option sits on the nearest node
const TAGS = [['Weather', .09, .28], ['Price', .29, .22], ['Transmission', .5, .26], ['Policy', .7, .22], ['Fault', .9, .3], ['Demand', .18, .64], ['Market', .39, .6], ['Storage', .6, .66], ['Asset', .79, .6], ['Grievance', .93, .7]];
const SPEED = 360; // wave speed in px per second; "Affected" timing uses the same number

// Info window text for each option
const INFO = {
  Weather: 'Weather forecasts feed into the model to capture their impact on both demand and generation. It accounts for heatwaves, cloud cover and wind patterns to produce block-level forecasts of load, generation and prices.',
  Demand: 'The model learns demand patterns across hours, seasons and emerging loads such as data centres and EV charging. It adapts to changing consumption patterns to forecast demand and plan generation, procurement and storage.',
  Price: 'Fuel costs and market prices shape the economics of power generation. The model tracks these changes across the generation mix to identify cost shifts and guide procurement, scheduling and bidding decisions.',
  Market: 'Day-ahead and real-time markets bring together prices, supply and competing bids. The model adapts to changing market conditions to recommend bids and schedules that balance commercial returns with delivery commitments.',
  Transmission: 'The model accounts for transmission capacity, line limits and substation constraints to anticipate congestion, curtailment and regional price differences before they affect grid operations.',
  Storage: 'The model evaluates market prices, grid demand and generation to determine when batteries and pumped hydro should charge, discharge or hold. It optimises dispatch to maximise asset value while meeting operational constraints.',
  Policy: 'Tariffs, renewable purchase obligations and grid codes shape how power assets operate. The model incorporates regulatory changes to assess their impact on generation, scheduling and market economics.',
  Asset: 'Every turbine, transformer, server and telecom tower wears down with use. Early signs of trouble show up in temperature, vibration and output long before a breakdown. The model reads these signals so that maintenance is planned on time instead of forced by failure.',
  Fault: 'A single failure rarely stays where it started. A tripped feeder, a failed cooling unit or a cut fibre link can set off hundreds of alarms in a grid control room or a network operations centre. The model traces those alarms back to the root cause, so teams fix the problem and not the symptoms.',
  Grievance: 'Every complaint is a signal about something real in the network. A high bill, a power cut or a dropped connection usually traces back to a specific event on the ground. The model links each grievance to that event, so customers get an answer based on facts.'
};

export default function initWorldModel() {
  const pg = document.querySelector('.home-world_network');
  if (!pg) return;
  pg.classList.add('wf-wm');
  pg.style.backgroundImage = 'none';
  const cv = document.createElement('canvas'); cv.className = 'wf-anim'; cv.setAttribute('aria-hidden', 'true');
  pg.prepend(cv);

  // match Webflow chips to the option list by their text
  const chips = $$('.home-world_chip', pg);
  const tagEls = TAGS.map(([s]) => chips.find(c => c.textContent.trim() === s)).filter(Boolean);
  tagEls.forEach(el => { el.classList.add('wf-tag'); el.setAttribute('role', 'button'); el.setAttribute('aria-haspopup', 'dialog') });

  const wm = Net(cv, {
    seed: 21, spacing: 112, speed: SPEED,
    fade: (y, H) => clamp(Math.min(y, H - y) / (H * .14)),
    onBuild: (ns, W, H) => {
      tagEls.forEach(el => {
        const t = TAGS.find(t => t[0] === el.textContent.trim()), n = nearestIn(ns, W * t[1], H * t[2]);
        el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; el.__n = n;
      });
    }
  });
  function nearestIn(ns, x, y) { let b = ns[0], bd = 1e12; for (const n of ns) { const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd) { bd = d; b = n } } return b }

  let touched = false, tms = [];
  // "Affected" appears on each option when the wave reaches it
  function affect(b) {
    tms.forEach(clearTimeout); tms = [];
    tagEls.forEach(t => t.classList.remove('hit'));
    const x0 = parseFloat(b.style.left), y0 = parseFloat(b.style.top);
    tagEls.forEach(t => {
      if (t === b || t.offsetParent === null) return;
      const d = Math.hypot(parseFloat(t.style.left) - x0, parseFloat(t.style.top) - y0), ms = RM ? 0 : d / SPEED * 1000;
      tms.push(setTimeout(() => { t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit') }, ms));
      tms.push(setTimeout(() => t.classList.remove('hit'), ms + 2200));
    });
  }
  function tap(el) {
    touched = true;
    tagEls.forEach(e => e.classList.toggle('on', e === el));
    if (el.__n) wm.ripple(el.__n.x, el.__n.y, 6);
    affect(el);
    const k = el.textContent.trim();
    el.classList.add('dw-on');
    openWindow(el, { t: k, p: INFO[k] || '' }, { wide: true, width: 520, align: 'center', step: 450, onClose: t => t.classList.remove('dw-on') });
  }
  tagEls.forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); tap(el) });
    keyable(el, () => tap(el));
  });

  let wmVis = false, idx = 2;
  visible(pg, v => { wmVis = v; wm.run(v) });
  setInterval(() => {
    if (!wmVis || touched || document.hidden || RM) return;
    const el = tagEls[idx]; if (!el || !el.__n) return;
    tagEls.forEach((e, k) => e.classList.toggle('on', k === idx));
    wm.ripple(el.__n.x, el.__n.y, 5);
    idx = (idx + 1) % 4;
  }, 3600);

  wm.build();
  addEventListener('resize', debounce(() => wm.build()));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => wm.build());
}
