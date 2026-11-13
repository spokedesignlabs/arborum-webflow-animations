# Arborum · Webflow animations

One script that adds the live canvas animations to the Arborum Webflow site
(Home and About). It finds each Webflow section by its Client-First class and
replaces that section's still image with the live version. Missing sections are
skipped, so the same file can load on every page.

| Part | Webflow section it attaches to |
|---|---|
| Globe (drag to turn, tap to send a pulse) | `.section_home-hero` |
| Threads landing on the tower tops + tower cards | `.section_home-statement`, `#energy .home-energy_photo` |
| Beyond Energy morph (network → tunnel → constellation) | `#beyond .home-beyond_sticky` |
| World Model ripple network | `.home-world_network` |
| Footer dots | `.footer_component` |
| About network plane | `.section_about-hero` |

The tab switching, Beyond Energy copy changes and option clicks live in the
Webflow page custom code; this file only draws.

## Loading it in Webflow

Registered as a hosted script in Site settings → Custom code (footer), served by
jsDelivr from a tagged release, e.g.

    https://cdn.jsdelivr.net/gh/<owner>/arborum-webflow-animations@1.0.0/arborum-webflow-animations.min.js

Always load a tagged version (not a branch) so the integrity hash stays valid.
To ship a change: edit, bump the version, tag, and update the script version in Webflow.

Respects `prefers-reduced-motion`. Add `?motion=1` to the URL to force motion on.
