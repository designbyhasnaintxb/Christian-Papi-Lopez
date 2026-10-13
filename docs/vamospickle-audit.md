# VamosPickle — current-site audit & redesign map

**Date:** 2026-10-13
**Scope:** www.vamospickle.com (home, /about, /shop, /collabs/*, /pov/*) → the redesigned single-page site in `Christian Papi Lopez/`.

## How this audit was done (read first)

The build environment's network policy **blocked direct access to www.vamospickle.com**, so the pages, images and video could not be opened or downloaded from here. Instead, the site's text was recovered from the search engine's index of these URLs:

| URL (indexed) | Title |
|---|---|
| `/` | VamosPickle |
| `/about` | About |
| `/shop` | Shop |
| `/collabs/cracked-racquets-tournament` | CrackedRacquets x VamosPickle Tournament |
| `/collabs/vamospickle-x-concord-neighborhood-center` | VamosPickle X Concord Neighborhood Center |
| `/pov/pov-1` | Tennis or Pickle? Why not both?! |
| `/pov/pov-2` | Major League Pickleball Format for the Win? |
| `/pov/pov-3` | VamosPickle on the Go. |
| `/pov/pov-4` | It's all about the Kids. |

What this means in practice:

- **Copy:** short brand lines (tagline, About intro, CTAs, product names) came back verbatim and are used as-is. Longer passages (POV posts, collab descriptions) came back as summaries, so on the new site they are **light rewrites that keep the facts**, not quotes. Every one of those is listed under **VERIFY** below.
- **Images & video:** **none could be retrieved.** The new site does not use stock to fill the gap. Every media slot shows a labelled, on-brand placeholder until the real VamosPickle file is dropped in (see `docs/media-manifest.md`). The A–D ranking is therefore defined **per slot** (what each slot needs). Ranking the actual photos and clips still has to happen once they're pulled.
- **Things the audit could not see:** the mobile presentation, footer details, contact email/phone, the Instagram handle, any embedded video, and whether any testimonials exist on the live site. These are flagged under VERIFY.

To finish the media step, allow `www.vamospickle.com` (and its image CDN) in the environment's network settings, or export the originals from the current site builder into `media-src/`.

---

## Content inventory & classification

### KEEP (used verbatim)

| Content | Source | Where it lives now |
|---|---|---|
| "Everyone deserves high level pickleball." | Home headline | Hero H1, footer statement, OG title, Organization `slogan` |
| "Introducing VamosPickle, born from a spirited conversation between Christian "Papi" Lopez and his two racquet-sport-loving daughters. Inspired by their passion for Pickleball, we set out to democratize high-level training for Youth and Adult players." | /about | Meet Papi — lead paragraph |
| "Recognizing a gap in quality instruction at the foundational level, we envisioned a platform offering meticulously curated classes and events, fostering confidence and improvement." | /about | Meet Papi — second paragraph |
| "Connect with us for your next Private Event, Clinic, Class or Collaboration." | /about | Events intro + footer CTA |
| "Book your own event, class, or clinic today." | Home / POV pages | Events convergence CTA headline |
| "Reach out to Elevate Your Game!" | Home | Inquiry section label |
| "Get in Touch" | Home | Footer button |
| Program vocabulary: Private Event · Clinic · Class · Collaboration | Home / About | Inquiry step 1 options, events copy |
| Product names: VamosPickle T-Shirt (Black, Green, White), VamosPickle Hoodie (Black), Game to Eleven Socks (Pattern, Block, Two Tone), all "Coming Soon" | /shop | Shop section, status kept as "Coming soon" |
| Collab titles: "CrackedRacquets x VamosPickle Tournament", "VamosPickle X Concord Neighborhood Center", "Butler University x VamosPickle" | /collabs/*, home | Collabs timeline |
| POV titles (all four) | /pov/* | "From Papi's POV" rail |

### REWRITE LIGHTLY (facts kept, wording tightened)

| Content | Original (as indexed) | New treatment |
|---|---|---|
| Papi's experience | About: "over 30 years of racquet sport expertise"; roots in "New York City, South America and now the Midwest" | Fact row: "30+ years of racquet-sport expertise" · "NYC · S. America · Midwest" |
| Pull quote | POV-4: "everyone is High level at a VamosPickle clinic/class/event" | "Everyone is high level at a VamosPickle clinic / class / event." (casing normalised only) |
| Big quote | POV-1: "What has to happen now is simple - learn to play pickleball at a higher level." | Same words, en dash typography |
| POV summaries | Four posts | One- to two-line summaries on cards |
| Collab descriptions | Concord: reached out to enhance summer program, kids across several age levels, hoped to return summer 2024. Cracked Racquets: inaugural May 2023, May 2024 Carmel edition announced | One line each, dates kept |

### REPOSITION (moved to where it does more work)

| Content | Was | Now |
|---|---|---|
| Youth camp content (POV-4: weeklong camp in Carmel, IN; footwork → strokes → mindset) | A blog post | **The backbone of the Methodology section** (feet → strokes → mind) and the Youth audience card |
| Tennis-vs-pickleball POV (POV-1) | A blog post | Methodology step 04, "A racquet-sport perspective", plus the big quote |
| Collabs | Separate pages | One scannable timeline + text credibility strip (no logo wall) |
| "Connect with us…" CTA | About page footer | Events section intro and footer |
| Shop | Its own page | Compact brand-extension section near the end (status preserved, not a homepage focus) |

### REDESIGN (new presentation)

1. **Hero:** brand line as the H1, media-first frame for Papi coaching, court-line draw, and a looping "Vamos Path" ball trajectory. A meta row answers who, formats, level and session length within seconds.
2. **Training formats:** one interactive court. 1 / 4 / 8 players / larger programs / youth. Dots re-arrange and the view zooms out to multiple courts with extra coaches. Every format has its own CTA that pre-fills the inquiry.
3. **Methodology:** "Not random drills. A training system." Four steps taken from Papi's own writing, with a sticky court visual that redraws per step.
4. **Inquiry:** a four-step "Find your training format" flow (format → who → level → contact). It is inquiry-first, with no prices, calendar or fake confirmation. Netlify Forms backend; without JS it degrades to a single plain form.
5. **New identity:** VAMOS / PICKLE stacked wordmark with a ball path through VAMOS landing beside PICKLE (6 s loop), a VP monogram where V's right arm is P's stem, a new palette and self-hosted type (Bricolage Grotesque / Instrument Sans / Barlow Condensed).

### VERIFY before launch (open questions for Papi)

| # | Item | Why |
|---|---|---|
| 1 | **All media.** Pull every photo/video from the current site and rank them (manifest has slots) | Couldn't be downloaded here |
| 2 | **Direct contact details** (email, phone, Instagram handle) | Home shows "contact" and "instagram" links, but their targets weren't in the index. The new site only offers the form until these are confirmed |
| 3 | **Testimonials** | None found on the indexed pages. Section 07 carries Papi's POV writing instead, with a commented template ready for real, approved reviews |
| 4 | **Video** | Unknown whether the live site embeds any. The "Training in motion" section is built for 1 main film + 3 clips |
| 4b | **Inquiry routing** | Form submissions land in Netlify (form name `training-inquiry`). Set the notification email in Netlify → Forms before launch |
| 5 | **Years of experience:** About says 30+; a third-party club bio says 40 years of playing | The site uses the About figure (30+) |
| 6 | **Butler University details:** Dec 9, 2023 session; "Butler University Community Outreach Program"; Apr 27, 2024 free beginner event at the Butler Tennis Bubble with Big Brothers Big Sisters of Central Indiana | Wording came from index summaries. Confirm partner names and that VamosPickle ran the Apr 27 event |
| 7 | **Cracked Racquets 2024 (Carmel)** | Announced on the site. Did it happen? Update the copy if so |
| 8 | **MLP POV** | Indexed summary says Papi's team won its first MLP-format event. Not stated on the new site until confirmed |
| 9 | **Levels served** | Brief says intermediate → advanced. The current About copy and the Butler beginner event mention the foundational level. The inquiry offers Intermediate / Advanced / Other-not sure. Add "Newer player" if Papi wants beginners |
| 10 | **Program format details** (1:1, groups of 4, clinics of 8, larger programs with extra coaches, 1–1.5 h sessions) | Come from the discovery brief, not the current site. Confirm the names Papi uses for them |
| 11 | **Facility affiliation** | A third-party club (Indianapolis Pickleball Club, IPC East) lists Papi as an instructor. Deliberately **not** on the site, per the brief |
| 12 | **Old URLs** | `/about` and `/shop` 301 to their sections. `/pov/*` and `/collabs/*` temporarily 302 to the homepage sections. Migrate the full posts or keep the redirects |
| 13 | **Shop** | Still "Coming soon"? If a store is live, link it from the product cards |

---

## Image & video curation (by slot)

Each asset gets one job, and no image repeats across Hero / About / Programs / Gallery.

| Tier | Slot(s) | What it must show |
|---|---|---|
| **A — hero/campaign** | `hero`, `video-main` | Papi coaching mid-drill, energy and movement. He is the face of the brand |
| **A** | `papi` | Papi portrait (ideally with his daughters, since the founding story is theirs) |
| **B — program/coaching** | `prog-private`, `prog-small`, `prog-clinic`, `prog-large`, `prog-youth` | One honest image per format, matching the player count shown on the court |
| **B** | `youth`, `adult`, `clip-1..3` | Youth camp footwork; intermediate/advanced adults at intensity; footwork / live-rally / youth clips |
| **C — community/support** | `gallery-1..6` | Clinics, demos, Papi playing, events, community |
| **C** | `shop-tee`, `shop-hoodie`, `shop-socks` | Product shots |
| **D — don't use prominently** | anything blurry, low-res, posed-without-action, or off-brand | Archive, or use small in the gallery only |

## Homepage flow (as built)

01 Hero → 02 Meet Papi → 03 Training formats → 04 How Vamos trains → 05 Training in motion + gallery → 06 Youth / adults / events / collabs → 07 From Papi's POV (testimonial slot) → 08 Inquiry → 09 Shop → 10 Footer.

## 60-second test

| Question | Answered by |
|---|---|
| What is VamosPickle? | Hero H1 + lede + meta row |
| Who is Coach Papi? | Hero label, Meet Papi |
| What training formats exist? | Hero meta row; Training formats court |
| What makes his system different? | Methodology (feet → strokes → mind → racquet-sport perspective) |
| Does he train youth? | Hero meta, Youth tab, Youth card |
| Adult / advanced players? | Hero meta ("Intermediate → advanced"), "High level is the standard." card |
| Can I ask about a clinic? | Clinic tab CTA, adult card CTA, inquiry step 1 |
| Can I ask about a private event? | "Plan a pickleball event" CTA, inquiry step 1 |
| How do I contact him? | Header CTA on every scroll position, inquiry section, footer. **Weak point:** no direct email/phone until VERIFY #2 is answered |
