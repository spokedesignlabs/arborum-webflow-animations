# Arborum · Webflow animations and interactions

All the motion and interaction code for the Arborum Webflow site (Home and About), in one place.
Webflow loads one built file, `dist/arborum.min.js`, from jsDelivr. Each part finds its own Webflow
section by its Client-First class and skips itself if that section isn't on the page, so the same file
loads on every page. If one part fails, the others keep running.

The design reference is the approved HTML build (Figma page **Design Feedback 4**). The code here is
ported from that build, so the site moves the same way.

## Which file does what

| What you see | File | Webflow element it attaches to |
|---|---|---|
| Hero globe: drag to turn it, click to send a pulse | `src/sections/hero-globe.js` (+ `src/data/globe.json`) | `.section_home-hero` |
| Threads from the hero past "AI for critical decisions…" onto the Energy photo; Energy section pins, photo fades in and zooms, threads land on the towers, text arrives in steps, tower points with cards | `src/sections/statement-energy.js` | `.section_home-statement`, `#energy` |
| One World Model: lines in from the dependencies, out to the decisions | `src/sections/one-world-model.js` | `.home-owm_component` |
| Power use cases: tabs, 7-second auto-rotate, stacked list on phones | `src/sections/use-cases.js` | `.home-usecases_tab`, `.home-usecases_panel` |
| Beyond Energy: network morph on canvas, copy changes at 34% and 67%, network labels | `src/sections/beyond-energy.js` | `#beyond` |
| World Model playground: ripple network, options marked "Affected" as the wave reaches them, info window per option | `src/sections/world-model.js` | `.home-world_network`, `.home-world_chip` |
| About hero network plane | `src/sections/about-network.js` | `.section_about-hero` |
| Footer dot field | `src/sections/footer-dots.js` | `.footer_component` |
| Smooth scrolling (Lenis), in-page links glide to their section, chapter marker | `src/ui/smooth-scroll.js` | whole page, `.header_chapter-link` |
| Info windows ("critical decisions", "Different networks…", World Model options) and the "link pending" toast | `src/ui/popups.js` | `.home-statement_highlight`, Beyond `h3`, links with `href="#"` |
| Button and link hovers | `src/ui/buttons.js` | `.button`, `.header_link`, `.footer_link` |
| Blocks fading up as they come into view | `src/ui/reveal.js` | see the list in the file |

Shared code: `src/core/utils.js` (colours, maths, canvas sizing, reduced motion) and `src/core/net.js`
(the ripple network used by the World Model).

CSS lives next to it in `src/styles/` (one file per area, same names) and is added to the page as one
`<style id="arborum-anim">` block. `src/index.js` starts every part in order.

## Common changes

- **Text in a pop-up or card:** the constants at the top of the section file (`CRITICAL`, `TOWERS`,
  `INFO`, `NETWORKS`, `COPY`).
- **A real link arrives** (dashboard, whitepaper, contact form, social): set it in Webflow. Links that
  still point to `#` show the toast; the messages are in `PENDING` in `src/ui/popups.js`.
- **Energy photo replaced:** keep the 1536×1024 framing and the tower points in `TOWERS` still fit.
- **Scroll feel:** `lerp` in `src/ui/smooth-scroll.js` (lower is smoother and slower).
- **Energy zoom or pin length:** `ZOOM` in `statement-energy.js`, height in `statement-energy.css`.

## Build

```bash
npm install
npm run build
```

`npm run watch` rebuilds on every save. Output: `dist/arborum.js` (readable) and `dist/arborum.min.js`.

To try a change on the live Webflow page before releasing, load `dist/arborum.min.js` in place of the
jsDelivr file (for example with a browser override) and remove nothing else.

## Release

1. Bump `version` in `package.json`, run `npm run build`, commit (include `dist/`).
2. Tag it: `git tag 1.2.0 && git push origin main --tags`.
3. The file is then at
   `https://cdn.jsdelivr.net/gh/spokedesignlabs/arborum-webflow-animations@1.2.0/dist/arborum.min.js`
4. Work out its integrity hash:
   `curl -s <that URL> | openssl dgst -sha384 -binary | openssl base64 -A` (prefix `sha384-`).
5. In Webflow, register the new hosted script version with that URL and hash, swap it in the site
   footer, and publish.

Always load a tagged version, never a branch, so the hash stays valid.

## What stays in Webflow

- Page layout and content, all classes and styles.
- About page head: one CSS rule that hides the Home chapter marker (it has to be there before the page
  draws).
- Home page head: the Finsweet Attributes script from the template.

Everything else (all scripts that used to sit in the page settings) is in this repo.

## Accessibility

Everything respects the OS "reduce motion" setting: no smooth scrolling, the Energy section doesn't pin, nothing auto-plays, and
pop-ups open without animation. Add `?motion=1` to the URL to force motion on for testing. Options,
tabs and labels work with the keyboard (Tab, then Enter or Space); Escape closes a pop-up.

## Licences

Lenis (smooth scrolling) is MIT licensed and bundled into the built file.
