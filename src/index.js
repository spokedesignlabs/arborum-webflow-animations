/* Arborum website: animations and interactions for Webflow
 * Entry point. This file holds behaviour only. Every element (canvases, pop-up, cards, progress bars)
 * and every style lives in Webflow. Each part finds its own Webflow elements by class and quietly skips
 * itself when they aren't on the page, so this one file loads on every page (Home and About).
 *
 * ON / OFF
 *   The page works and looks finished without this script (Webflow shows its static images instead).
 *   Turn the animations off in any of these ways:
 *     1. Remove the "arborumanimations" script in Webflow: Site settings > Custom code (then publish).
 *     2. Give the Body element the custom attribute  data-animations = off  (in Webflow, then publish).
 *     3. Share a link ending in  ?animations=off  (nothing to publish; only that visit is static).
 */
import initSmoothScroll from './ui/smooth-scroll.js';
import initPopups from './ui/popups.js';
import initButtons from './ui/buttons.js';
import initReveal from './ui/reveal.js';
import initHeroGlobe from './sections/hero-globe.js';
import initStatementEnergy from './sections/statement-energy.js';
import initOneWorldModel from './sections/one-world-model.js';
import initUseCases from './sections/use-cases.js';
import initBeyondEnergy from './sections/beyond-energy.js';
import initWorldModel from './sections/world-model.js';
import initAboutNetwork from './sections/about-network.js';
import initFooterDots from './sections/footer-dots.js';

const off = /[?&]animations=off\b/.test(location.search)
  || document.documentElement.getAttribute('data-animations') === 'off'
  || (document.body && document.body.getAttribute('data-animations') === 'off');

if (!window.__arborumAnim && !off) {
  window.__arborumAnim = __VERSION__;
  const parts = [
    ['smooth scroll', initSmoothScroll], ['pop-ups', initPopups], ['buttons', initButtons], ['reveal', initReveal],
    ['hero globe', initHeroGlobe], ['statement + energy', initStatementEnergy], ['one world model', initOneWorldModel],
    ['use cases', initUseCases], ['beyond energy', initBeyondEnergy], ['world model', initWorldModel],
    ['about network', initAboutNetwork], ['footer', initFooterDots]
  ];
  // one part failing never stops the others
  parts.forEach(([name, fn]) => { try { fn() } catch (e) { console.error('[arborum] ' + name + ':', e) } });
}
