# VamosPickle media manifest

Every image and video on the redesigned homepage is a **named slot**. Until a real VamosPickle file exists for a slot, the page shows a labelled court-line placeholder (never stock). Nothing in this repo is stock, AI-generated or borrowed from another coach.

## Workflow

1. Export the **originals** from the current vamospickle.com site builder (or Papi's camera roll / socials) and put them in `media-src/` at the repo root. That folder is git-ignored, so originals stay out of git.
2. Name each file after its slot (extension doesn't matter): `media-src/hero.jpg`, `media-src/clip-2.mov`, …
3. Run:
   ```sh
   cd tools && npm install && npm run media
   ```
   This writes the exact files the page loads into `Christian Papi Lopez/assets/media/`:
   - images as responsive WebP, with AVIF for `hero` and `papi`, smart-cropped to each slot's ratio
   - films as MP4 (H.264) and WebM (VP9), plus a poster frame and, for the main film, an 8-second silent loop
   - `og.jpg`, the 1200×630 share image (made from `og.*` or, failing that, `hero.*`)

   Video needs `ffmpeg` with libx264 and libvpx-vp9.
4. Commit the generated files in `assets/media/` and deploy. Slots without a source keep their placeholder.

## Slots

| Slot | Tier | Shape | Section | Should show |
|---|---|---|---|---|
| `hero` | A | 4:5 | Hero | Papi coaching, high-energy, on court |
| `papi` | A | 4:5 | Meet Papi | Papi portrait, ideally with his daughters |
| `prog-private` | B | 16:10 | Training formats, Private | Papi 1:1 with a player |
| `prog-small` | B | 16:10 | Training formats, Small group | Four players + coach |
| `prog-clinic` | B | 16:10 | Training formats, Clinic | Eight-player clinic |
| `prog-large` | B | 16:10 | Training formats, Larger programs | Multiple courts / additional coaches |
| `prog-youth` | B | 16:10 | Training formats, Youth | Youth group training |
| `youth` | B | 16:10 | Youth card | Youth camp (e.g. Carmel weeklong camp), footwork |
| `adult` | B | 16:10 | Adult & advanced card | Intermediate/advanced adults at intensity |
| `video-main` (+ optional `video-main-poster`) | A | 16:9 | Training in motion | Main training film: Papi running a session |
| `clip-1` (+ poster) | B | 9:16 | Training in motion | Footwork drill |
| `clip-2` (+ poster) | B | 9:16 | Training in motion | Live rally / clinic reps |
| `clip-3` (+ poster) | B | 9:16 | Training in motion | Youth session |
| `gallery-1` … `gallery-6` | C | 4:5 | On court rail | Adult clinic, Papi demonstrating, youth group, Papi playing, event/tournament, community |
| `shop-tee`, `shop-hoodie`, `shop-socks` | C | 1:1 | Shop | Product shots |
| `og` (optional) | — | 1.91:1 | Social share | Defaults to the hero crop |

**Curation rules:** use each asset once (no repeats between Hero / About / Programs / Gallery). Pick the sharpest, most active frames for A-tier slots. Blurry, low-res or no-action shots are D-tier: leave them out or use them small in the gallery. Before launch, update each `<img alt>` in `index.html` to describe the actual photo.

## Temporary demo photos

`Christian Papi Lopez/assets/demo/demo-media.js` fills **empty** slots with hotlinked Pexels stock so the layout can be previewed. Each demo image is badged "Demo photo", and a real file in `assets/media/` always takes precedence. None of them show Papi or VamosPickle. Credits are in `assets/demo/CREDITS.md`.

**Before launch:** delete the `<script src="assets/demo/demo-media.js">` line in `index.html` and the `assets/demo/` folder. This brings back the honest placeholders for any slot still missing real media.
