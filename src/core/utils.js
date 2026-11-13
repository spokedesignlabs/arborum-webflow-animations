/* Shared helpers used by every section.
 * Colours, maths, canvas sizing, "is it on screen" and the reduced-motion flag.
 */

// Reduced motion: respects the OS setting. Add ?motion=1 to the URL to force motion on.
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion=1/.test(location.search);
document.documentElement.classList.toggle('rm', RM);

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Brand colours as [r,g,b]
export const NAVY = [5, 19, 28], DEEP = [0, 113, 177], LIGHT = [109, 194, 242], CREAM = [230, 213, 183], PEACH = [242, 191, 149], SIG = [77, 173, 255], VIO = [0, 113, 177];

export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// Seeded random, so every network is drawn the same way on every visit
let seed = 7;
export const setSeed = v => { seed = v };
export const rnd = (a = 1, b) => { seed = (seed * 16807) % 2147483647; const r = seed / 2147483647; return b === undefined ? r * a : a + r * (b - a) };

// Size a canvas to its box at a capped pixel ratio; returns the 2D context and size in CSS pixels
export const DPR = Math.min(devicePixelRatio || 1, 1.5);
export function fit(c, h) { const d = DPR, r = c.getBoundingClientRect(); const w = r.width, hh = h || r.height; c.width = w * d; c.height = hh * d; const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return { x, w, h: hh } }

// Calls cb(true/false) as the element comes on and off screen
export function visible(el, cb) { if (!('IntersectionObserver' in window)) { cb(true); return } new IntersectionObserver(e => cb(e[0].isIntersecting), { rootMargin: '120px' }).observe(el) }

export function debounce(f, ms) { let t; return function () { clearTimeout(t); t = setTimeout(f, ms || 150) } }

// Keep a section's real content above the canvas we add behind it
export function lift(host) { [].forEach.call(host.children, ch => { if (ch.classList.contains('wf-anim') || ch.id === 'gfx' || ch.classList.contains('wf-hero-fade')) return; if (getComputedStyle(ch).position === 'static') ch.style.position = 'relative'; ch.style.zIndex = ch.style.zIndex || '1' }) }

// Run after the page has loaded (fonts and images in place), like the original design build
export function onLoad(fn, delay = 0) { if (document.readyState === 'complete') setTimeout(fn, delay); else addEventListener('load', () => setTimeout(fn, delay)) }

// Make a non-button element work with the keyboard
export function keyable(el, fn) { if (!el.hasAttribute('tabindex')) el.tabIndex = 0; el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e) } }) }

export const SVGNS = 'http://www.w3.org/2000/svg';
