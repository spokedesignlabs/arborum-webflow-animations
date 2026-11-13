/* Arborum website: animations and interactions for Webflow
 * Entry point. Each section finds its own Webflow element and quietly skips itself when the element
 * isn't on the page, so this one file loads on every page (Home and About).
 * Order matters a little: smooth scrolling and pop-ups first, because sections use them.
 */
import css from './styles/index.js';
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

if (!window.__arborumAnim) {
  window.__arborumAnim = __VERSION__;
  const st = document.createElement('style'); st.id = 'arborum-anim'; st.textContent = css; document.head.appendChild(st);
  const parts = [
    ['smooth scroll', initSmoothScroll], ['pop-ups', initPopups], ['buttons', initButtons], ['reveal', initReveal],
    ['hero globe', initHeroGlobe], ['statement + energy', initStatementEnergy], ['one world model', initOneWorldModel],
    ['use cases', initUseCases], ['beyond energy', initBeyondEnergy], ['world model', initWorldModel],
    ['about network', initAboutNetwork], ['footer dots', initFooterDots]
  ];
  // one part failing never stops the others
  parts.forEach(([name, fn]) => { try { fn() } catch (e) { console.error('[arborum] ' + name + ':', e) } });
}
