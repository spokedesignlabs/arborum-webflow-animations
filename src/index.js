/* Arborum website: animations and interactions for Webflow
 * Entry point. This file holds behaviour only. Every element (canvases, pop-up, cards, progress bars)
 * and every style lives in Webflow. Each part finds its own Webflow elements by class and quietly skips
 * itself when they aren't on the page, so this one file loads on every page (Home and About).
 *
 * ON / OFF, ONE ANIMATION AT A TIME
 *   In Webflow: Site settings > Custom code > Footer code holds a list like this. Set a name to false and
 *   publish to switch that animation off (the section then shows its normal Webflow look):
 *     window.arborumAnimations = { heroGlobe: true, frontierThreads: true, oneWorldModel: true,
 *       powerUseCases: true, beyondEnergy: true, worldModel: true, footerLogo: true };
 *   What each name controls is in the README. Removing the whole script switches everything off.
 */
import initSmoothScroll from './ui/smooth-scroll.js';
import initPopups from './ui/popups.js';
import initButtons from './ui/buttons.js';
import initReveal from './ui/reveal.js';
import initHeader from './ui/header.js';
import initHeroGlobe from './sections/hero-globe.js';
import initStatementEnergy from './sections/statement-energy.js';
import initOneWorldModel from './sections/one-world-model.js';
import initUseCases from './sections/use-cases.js';
import initBeyondEnergy from './sections/beyond-energy.js';
import initWorldModel from './sections/world-model.js';
import initAboutNetwork from './sections/about-network.js';
import initFooterDots from './sections/footer-dots.js';

function start() {
  if (window.__arborumAnim) return;
  window.__arborumAnim = __VERSION__;
  const parts = [
    ['smooth scroll', initSmoothScroll], ['pop-ups', initPopups], ['buttons', initButtons], ['reveal', initReveal],
    ['header', initHeader], ['hero globe', initHeroGlobe], ['statement + energy', initStatementEnergy],
    ['one world model', initOneWorldModel], ['use cases', initUseCases], ['beyond energy', initBeyondEnergy],
    ['world model', initWorldModel], ['about network', initAboutNetwork], ['footer', initFooterDots]
  ];
  // one part failing never stops the others
  parts.forEach(([name, fn]) => { try { fn() } catch (e) { console.error('[arborum] ' + name + ':', e) } });
}

// wait for the whole page's HTML, so the switches in Webflow's footer code are read wherever they sit
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
