# Arborum · Webflow animations and interactions

The motion and interaction code for the Arborum Webflow site (Home and About).
Webflow loads one built file, `dist/arborum.min.js`, from jsDelivr.

**This repo holds behaviour only: JavaScript and data.** Every element (canvases, the pop-up, the tower
cards, progress bars) and every style lives in Webflow, on Client-First classes. The script finds those
elements by class, draws on the canvases and moves things with inline values while it runs. If a part's
elements aren't on the page, that part skips itself, so the same file loads on every page. If one part
fails, the others keep running.

The design reference is the approved HTML build (Figma page **Design Feedback 4**).

## Turning animations on and off, one at a time

Each animation has its own switch in Webflow: **Site settings > Custom code > Footer code**. Set a name to
`false` and publish to switch that animation off; set it back to `true` to turn it on again. A switched-off
section shows its normal Webflow design.

| Name | What it switches | When it's off |
|---|---|---|
| `heroGlobe` | Hero: the turning globe you can drag and click | The hero shows its static globe picture |
| `frontierThreads` | 01 Our first frontier (Energy): the threads from the hero onto the towers | No threads; the Energy pin, zoom, text and tower points stay |
| `oneWorldModel` | One World Model: lines and moving dots | Just the two lists and the title |
| `powerUseCases` | Power use cases: the progress bar and tabs switching on their own | No bar, no auto-switching; tabs still work when clicked |
| `beyondEnergy` | 02 Beyond Energy: the network that changes as you scroll | No network; the text still changes as you scroll |
| `worldModel` | 03 The World Model: network, waves, "Affected" tags, info windows | The static network picture with the options in place |
| `footerLogo` | Footer: the light reveal and shine on the Arborum logo | The plain white logo |

Removing the `arborumanimations` script (Site settings > Custom code) switches everything off at once; the
site still looks finished.

The animations play even when a computer has "reduce motion" turned on. To respect that setting instead,
set `FOLLOW_OS_REDUCED_MOTION = true` in `src/core/utils.js`.

## Which file does what

| What you see | File | Webflow elements it uses |
|---|---|---|
| Hero globe: drag to turn it, click to send a pulse | `src/sections/hero-globe.js` (+ `src/data/globe.json`) | `.section_home-hero` > `canvas.home-hero_globe`, `canvas.home-hero_dots`, `.home-hero_fade` |
| Threads from the hero past "AI for critical decisions…" onto the Energy photo; Energy pins, photo fades in and zooms, threads land on the towers, text arrives in steps, tower points with cards | `src/sections/statement-energy.js` | `canvas.home-statement_threads` (first child of `.main-wrapper`), `#energy` > `.home-energy_stage` > `canvas.home-energy_threads`, `.home-energy_point` ×3, `.home-energy_card` |
| One World Model: lines draw in from the dependencies and out to the decisions, dots travel along them | `src/sections/one-world-model.js` | `.home-owm_component` > `canvas.home-owm_lines` |
| Power use cases: progress bar fills for 7 seconds, then the next tab opens; a click restarts the 7 seconds; stacked list on phones | `src/sections/use-cases.js` | `.home-usecases_tab` ×3 (each with `.home-usecases_progress`), `.home-usecases_panel` |
| Beyond Energy: network morph, copy changes at 34% and 67%, network labels highlight | `src/sections/beyond-energy.js` | `#beyond` > `.home-beyond_sticky` > `canvas.home-beyond_canvas`, `.home-beyond_trigger` (the h3 text) |
| World Model playground: runs through the options every 4 seconds (wave + "Affected" tags); a click does the same, opens the info window and restarts the timer; own layout on phones | `src/sections/world-model.js` | `.home-world_network` > `canvas.home-world_canvas`, `.home-world_chip` (each with `.home-world_affected`) |
| About hero network plane | `src/sections/about-network.js` | `.section_about-hero` > `canvas.about-hero_canvas` |
| Footer dot field and the light reveal and shine on the Arborum wordmark | `src/sections/footer-dots.js` | `.footer_component` > `canvas.footer_dots`, `img.footer_wordmark` + `canvas.footer_wordmark-canvas` |
| Smooth scrolling (Lenis), in-page links glide to their section, chapter marker | `src/ui/smooth-scroll.js` | whole page, `.header_chapter-link` |
| Logo comes back as a small bar when you scroll up | `src/ui/header.js` | `.header_left` |
| Info windows ("critical decisions", World Model options) and the "link pending" toast | `src/ui/popups.js` | `.popup_component`, `.toast_component` (both on every page) |
| Button and link hovers that follow the pointer | `src/ui/buttons.js` | `.button`, `.header_link`, `.header_chapter-link`, `.footer_link` |
| Blocks fading up as they come into view | `src/ui/reveal.js` | see the list in the file |

Shared code: `src/core/utils.js` (colours, maths, canvas sizing, the reduced-motion switch) and
`src/core/net.js` (the ripple network used by the World Model). `src/index.js` starts every part in order
and reads the switches.

## Common changes

- **Look of anything** (colours, sizes, spacing, hover states): change the class in Webflow.
- **Text in a pop-up or card:** the constants at the top of the section file (`CRITICAL`, `TOWERS`,
  `INFO`, `COPY`).
- **A real link arrives** (dashboard, whitepaper, contact form, social): set it in Webflow. Links that
  still point to `#` show the toast; the messages are in `PENDING` in `src/ui/popups.js`.
- **Energy photo replaced:** keep the 1536×1024 framing so the tower points in `TOWERS` still fit.
- **Scroll feel:** `lerp` in `src/ui/smooth-scroll.js` (lower is smoother and slower).
- **Energy zoom or pin length:** `ZOOM` and `PIN` in `statement-energy.js`.
- **Use case timing:** `ROTATE_MS` in `use-cases.js`. **World Model timing:** `AUTO_MS` in `world-model.js`.

## Build

```bash
npm install
npm run build
```

`npm run watch` rebuilds on every save. Output: `dist/arborum.js` (readable) and `dist/arborum.min.js`.

## Release

1. Bump `version` in `package.json`, run `npm run build`, commit (include `dist/`).
2. Tag it: `git tag 1.4.14 && git push origin main --tags`.
3. The file is then at
   `https://cdn.jsdelivr.net/gh/spokedesignlabs/arborum-webflow-animations@1.4.14/dist/arborum.min.js`
4. Work out its integrity hash:
   `curl -s <that URL> | openssl dgst -sha384 -binary | openssl base64 -A` (prefix `sha384-`).
5. In Webflow, register the new hosted script version with that URL and hash, swap it in the site
   footer, and publish.

Always load a tagged version, never a branch, so the hash stays valid.

## Accessibility

Options, tabs, tower points and highlighted phrases work with the keyboard (Tab, then Enter or Space);
Escape closes a pop-up. See above for the reduce-motion switch.

## Licences

Lenis (smooth scrolling) is MIT licensed and bundled into the built file.
