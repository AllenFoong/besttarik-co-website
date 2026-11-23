# Best Tarik & Co website: project brief and status

Last updated: 23 Nov 2026, 16:00. Read this first in any new chat about this project.

## Working rules (more than one chat in this project)
- This brief is the **shared memory** between chats. Each chat runs in its own workspace and **cannot see the other chat's local files or unpushed work**. Only GitHub `main` and this brief are shared.
- Start of every chat: read this brief, then `git pull` the latest `main` before editing.
- End of every chat: push to `main`, then update this brief (what changed, what is still pending). Keep the **Session log** below short (one block per chat session).
- Don't edit the same section in two chats at the same time (e.g. both chats changed the hero caption font on 23 Nov and caused a merge conflict). If two chats are open, split the work by section.

## The brand
- **Best Tarik & Co**: teh tarik brand from Johor Bahru, Malaysia. Teh tarik poured over silky soy beancurd (taufufah).
- Five flavours: **Premium**, **Cham** (salted coffee cream), **Matcha**, **Taro**, **Jasmine Seasalt**.
- Instagram: @besttarik.co. Stalls: car-boot / cart pop-ups at Jalan Sri Pelangi and Johor Jaya, JB.
- Award: **TNCSEA Shining Business Award 2026, Shining Malaysian Beverage Innovation Excellence Award** (ceremony 16 Sep 2026, D Theatre, Hextar World, Petaling Jaya).
- The site is a **showcase and brand story, not an online shop**. English copy.

## Links
- Live site (GitHub Pages): https://allenfoong.github.io/besttarik-co-website/
- Source code: https://github.com/AllenFoong/besttarik-co-website (public, branch `main`)
- Claude artifacts: Version 3 (current) https://claude.ai/artifact/R4s2rhKtYnakDUmLg86X1W · Version 2 https://claude.ai/artifact/6HXa2eYihXQPsbMu1J4Zjw · Version 1 https://claude.ai/artifact/4eUiMH6weeHDNBqZxSCzbQ
- Full-site preview artifact (used for previews before pushing, 23 Nov): https://claude.ai/artifact/NU2ukeNo58haG65DDuqhKj
- Sheets: "HeroTea 视频拆解" https://claude.ai/artifact/E7fHUc8fyXsXPA1PQVtUR1 · "Hero 视频字幕" https://claude.ai/artifact/Lh1gphDyvEhZe7utckGdmF
- Reference sites: herotea.ca (hero video style), deltacafes.com/en (hero layout + manifesto band + condensed poster titles, since 23 Nov), getlayers "Brewns" and "Soda" templates (original inspiration)

## Design system (Version 3)
- Colours: brand orange `#FC8C27`, cream `#F5EBDD`, cream-2 `#EEDFCB`, tea brown `#382219`; peach `#F2D4BE` (hero text, manifesto band)
- Fonts: **Cormorant Garamond** (display; switched from Bodoni Moda on 23 Nov) + **Manrope** (body, uppercase letter-spaced labels). Exceptions:
  - Hero film chapter headlines (all five) use **Source Serif 4 (upright, not italic)** since 23 Nov (was Bodoni Moda Italic; Lora was briefly used for chapter 04). The rail card labels keep Manrope.
  - **Oswald** (400 + 600, condensed uppercase poster type, Delta style): "THE FIVE WAYS" title and the manifesto band title. Small connecting words are set at ~half size and lighter weight. *(Pending push, see Session log.)*
  - Drinks stage drink name uses **Inter 800** (matches the React Bits FoldText demo).
- Libraries (CDN): Three.js 0.160 (jsDelivr, importmap), GSAP 3.12.2 + ScrollTrigger (cdnjs), Google Fonts
- Single static `index.html` + `a/` assets. No build step. Local test needs a Range-capable server: `python3 tools/rangeserve.py . 8000`

## Page structure (Version 3, top to bottom)
1. **Hero film** (Delta Cafés-style layout since 23 Nov): 38.7 s muted loop `a/hero-16x9.mp4` on every screen. The hero is always the **full viewport height** (`100svh`, min 520 px) at every width; narrower screens just crop the sides of the film. (A 30 px peek of the next section was tried and removed at the user's request.)
   - Bottom-left: small uppercase subtitle + big headline (Source Serif 4, upright; size `clamp(2.2rem, 8.5vw, 4.8rem)`, reduced on 23 Nov), sitting just above the chapter rail. No CTA button (the "Our Five Flavours" pill + arrow were removed on 23 Nov at the user's request).
   - Bottom: scrolling rail of 5 chapter cards, each with a progress line; the playing card lights up and the rail follows it; tap a card to jump to that chapter. Thumbnails `a/ch-1..5.webp` shown at **98 × 62 px** (files 294×186): frames at 0.3 s, 10.5 s (crown splash), 18.5 s (milk swirl), 22.6 s, 29.3 s.
   - Phone header: dark "JB" place pill (to `#find`) left, logo centred (cup above wordmark), dark MENU pill right. Desktop header unchanged. Header turns cream when scrolled.
   - Chapters: 0 s Bold black tea / SELECTED TEA LEAVES · 7.5 s Pulled, not stirred / THE ART OF TARIK · 14 s Silky, never too sweet / MILK MEETS HOT TEA · 22 s Handmade taufufah / SILKY SOY BEANCURD · 28.7 s Five flavours, one pull / PREMIUM · CHAM · MATCHA · TARO · JASMINE SEASALT
2. **Manifesto band** (`#manifesto`, *pending push*): Delta-style brand statement between the film and Drinks. Tea-brown band, everything centred, peach text. Oswald title in 4 lines `PULLED ᵇʸ HAND, / POURED ᵒᵛᵉʳ / SILKY / TAUFUFAH` (small words top-aligned, like Delta's "THAT"). Peach pill "Our Story" + round arrow to `#story`. Body: "Best Tarik & Co is teh tarik from Johor Bahru. Every cup is pulled by hand, poured over silky soy beancurd and finished in one of five ways." Lines rise in one by one on scroll (GSAP; off with reduced motion).
3. **Drinks** (`#drinks`): Version 1's 3D cup stage (Three.js lathe cup wrapped in real photos, floating ingredients, milk bubbles). Left title **"THE FIVE WAYS"** in Oswald (small "THE", big "FIVE" / "WAYS", lines centred on each other, tea brown; *pending push*; was "Five Ways" in Cormorant italic with orange "Five"). Flavour cards and arrows removed on 23 Nov. The bottom-right title shows the current drink name in two lines (e.g. Cham / Teh Tarik) with React Bits **FoldText** (paper fold, hinge top, plain-JS port in `src/fold-text/`; **Inter 800**, letter-spacing -0.02em), folding to the next name on every switch. Auto-advances every ~2.5 s, 4.5 s safety unlock. On phones the name sits centred under the cup.
4. **Our Story**: Born in Johor (pour photo), Why taufufah, The first stall (Johor Jaya cart photo), Milestones (award + photo), Made by hand (stall photo + prep steps).
5. **Brand Highlights**: two columns. Left: React Bits **DepthCarousel** (stacked 3D deck, GSAP tween, arrows + dots, drag/swipe; `tiltDirection: left`, tint tea brown, `captureWheel: false` so the page still scrolls), ported to plain JS (`src/depth-carousel/`). Heading (eyebrow + "Up close.") sits above both columns like other sections. Right: live text panel (count, title, subtitle, 2-sentence description) that follows the active photo. Text stacks above the deck on phones. Replaced CircularCarousel on 23 Nov (FlexCarousel was tried and reverted; both kept in `src/`). 10 photos.
6. **Find Us**: Jalan Sri Pelangi + day stall photo.

## How the hero film was made
- 5 clips generated in **MuleRun with Kling / Kling Omni** (10 s each, 720p, multi-shot prompts, orange studio background, no people/hands/text). Clip 3 was regenerated so milk turns the tea milk-tea coloured with white steam.
- Edited: trimmed and joined with 0.5 s cross-fades. Downloadable master: `BestTarik-hero-video-720p.mp4` (CRF 17).
- **9:16 version (made 23 Nov, not used on the site)**: 5 new native 9:16 Kling clips. MuleRun notes: upload is always a **start frame** (no reference images); Kling V3 Omni takes its aspect ratio from the start frame; only Kling V3 has a ratio picker. Cut to the same chapter timings as the 16:9 film (38.7 s). Files were kept in that chat's workspace only (web copy 720×1280, master 1080×1920), **not in the repo**: if needed again, re-export from the 5 MuleRun results (`result_01..05.mp4`). Not on the site because the user chose Delta's approach (one 16:9 film, sides cropped). Possible use: IG/TikTok.

## Photos
- Real photos came from IG screenshots: cropped (IG UI removed, "we're open" text inpainted), upscaled x4 with Real-ESRGAN (`tools/upscale_photos.py`), web copies are 1280 px WebP in `a/photo-*.webp`.
- "Made by hand" photo comes from a @jbcityguide collab post: confirm permission with the owner.

## Still to do / open questions
- **Push pending work from the 23 Nov "hero / Delta" chat** (manifesto band + THE FIVE WAYS title). It exists only in that chat's workspace and in the preview artifact; if that chat is gone, rebuild from the descriptions above.
- Fill every "To add" in `index.html`: opening hours, WhatsApp number, remaining milestones and dates, story details for the first stall.
- Confirm the official award wording and which stall was actually the first. Founding year is unknown (needed if a "Since ____" headline is wanted).
- Optional: captioned 9:16 hero video for IG/TikTok; Cham/Taro/Jasmine cut-out cups for Highlights.

## Decisions made (don't undo without asking)
- Everything above Our Story is the HeroTea-style film + (manifesto band) + the 3D drink stage. V2's 3D hero, swipe cards and scroll-scrubbed pour were removed.
- Hero layout follows deltacafes.com: one 16:9 film on every screen, full viewport height, sides cropped on narrow screens. No separate 9:16 file on the site. No CTA button in the hero.
- Captions are HTML text over the video, not burned in.
- Earlier versions are kept unchanged (artifacts + `versions/v1`, `versions/v2` in the repo).

## Session log
- **23 Nov, chat "hero / Delta" (this brief's main author today)**: display font → Cormorant Garamond; hero rebuilt in Delta Cafés layout (pills header on phones, headline bottom-left, chapter rail with progress lines + 98×62 start-frame thumbnails, full-height, CTA removed); 9:16 Kling clips generated and edited but not used; "THE FIVE WAYS" Oswald title + manifesto band built and previewed (**not pushed yet**). Pushed commits: `78bac13`, `9077483`, `1d35ba2`, `4a544c7`, `d409847`.
- **Up to 23 Nov, chat "build / components" (the long original chat)**:
  - Earlier days: built V1, V2 and V3; edited the hero film from the 5 Kling clips; cropped and 4× upscaled the real photos; ported V1's 3D drink stage into V3.
  - 23 Nov:
    - Set up the GitHub repo with the first push, README, this brief and `.nojekyll`; GitHub Pages is on.
    - Brand Highlights: CircularCarousel → FlexCarousel (reverted) → **DepthCarousel**, laid out in two columns with a live text panel, the heading above both columns and 2-sentence photo descriptions.
    - Drinks: flavour cards and arrows removed; drink name shown with **FoldText** (Inter 800).
    - Hero captions: all five → **Source Serif 4 upright**, at a smaller size.
    - Hero chapter rail: on phones/tablets (<900 px) a trailing spacer lets every card, including 05, line up with the headline's left edge. Desktop is unchanged.
  - Kept the V3 artifact in sync after each change. Did **not** touch the manifesto band or THE FIVE WAYS.
  - Pushed commits: `4f3d848`, `9b52e83`, `8d3c810`, `e44a3ec`, `2fa7d36`, `2780ee5`, `c28d0a8`, `1b8aa5f`, `54be7b2`, `3d46593`, `d942281`, `064260a`, `4f2f9b7`, `2285cfb`, `a86ca88`, `a89374d`.
  - At close (16:05): `git pull` found nothing new on `main`; the "hero / Delta" chat's manifesto band and THE FIVE WAYS were **not on GitHub yet**.
