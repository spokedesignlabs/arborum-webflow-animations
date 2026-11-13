/* Shared helpers used by every section.
 * Colours, maths, canvas sizing, "is it on screen" and the reduced-motion flag.
 */

// Reduced motion. Off by default: the animations play even when the computer's "reduce motion" setting is on.
// Set FOLLOW_OS_REDUCED_MOTION to true to calm everything down for people who turn that setting on.
const FOLLOW_OS_REDUCED_MOTION = false;
export const RM = FOLLOW_OS_REDUCED_MOTION && matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion=1/.test(location.search);

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
export function lift(host) { [].forEach.call(host.children, ch => { if (ch.tagName === 'CANVAS' || /_fade\b/.test(ch.className)) return; if (getComputedStyle(ch).position === 'static') ch.style.position = 'relative'; ch.style.zIndex = ch.style.zIndex || '1' }) }

// Run after the page has loaded (fonts and images in place), like the original design build
export function onLoad(fn, delay = 0) { if (document.readyState === 'complete') setTimeout(fn, delay); else addEventListener('load', () => setTimeout(fn, delay)) }

// Make a non-button element work with the keyboard
export function keyable(el, fn) { if (!el.hasAttribute('tabindex')) el.tabIndex = 0; el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e) } }) }

export const SVGNS = 'http://www.w3.org/2000/svg';

// Find a Webflow canvas by class inside a section (all canvases are placed in Webflow)
export const canvasIn = (host, cls) => host && host.querySelector('canvas.' + cls);

// Short animation on an element (Web Animations API). The end state is kept.
export function play(el, frames, opts) { if (!el || !el.animate) return null; return el.animate(frames, Object.assign({ fill: 'forwards' }, typeof opts === 'number' ? { duration: opts } : opts)) }

// Per-animation switches, set in Webflow (Site settings > Custom code > Footer) as window.arborumAnimations.
// Anything not listed, or the whole list missing, counts as on. Names: see README.
export const ON = name => { const s = window.arborumAnimations; return !s || s[name] !== false };
