# Best Tarik & Co website: project brief and status

Last updated: 23 Nov 2026. Read this first in any new chat about this project.

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
- Sheets: "HeroTea 视频拆解" https://claude.ai/artifact/E7fHUc8fyXsXPA1PQVtUR1 · "Hero 视频字幕" https://claude.ai/artifact/Lh1gphDyvEhZe7utckGdmF
- Reference sites: herotea.ca (hero video style), deltacafes.com/en (hero layout, since 23 Nov), getlayers "Brewns" and "Soda" templates (original inspiration)

## Design system (Version 3)
- Colours: brand orange `#FC8C27`, cream `#F5EBDD`, cream-2 `#EEDFCB`, tea brown `#382219`; hero text peach `#F2D4BE`
- Fonts: **Cormorant Garamond** (display; switched from Bodoni Moda on 23 Nov) + **Manrope** (body, uppercase letter-spaced labels). Exceptions:
  - Hero film chapter headlines (all five) use **Source Serif 4 (upright, not italic)** since 23 Nov (was Bodoni Moda Italic; Lora was briefly used for chapter 04). The rail card labels keep Manrope.
  - Drinks stage drink name uses **Inter 800** (matches the React Bits FoldText demo).
- Libraries (CDN): Three.js 0.160 (jsDelivr, importmap), GSAP 3.12.2 + ScrollTrigger (cdnjs), Google Fonts
- Single static `index.html` + `a/` assets. No build step. Local test needs a Range-capable server: `python3 tools/rangeserve.py . 8000`

## Page structure (Version 3, top to bottom)
1. **Hero film** (Delta Cafés-style layout since 23 Nov): 38.7 s muted loop `a/hero-16x9.mp4` on every screen. The hero is always the **full viewport height** (`100svh`, min 520 px) at every width; narrower screens just crop the sides of the film. (A 30 px peek of the next section was tried and removed at the user's request.)
   - Bottom-left: small uppercase subtitle + big headline (Source Serif 4, upright), sitting just above the chapter rail. No CTA button (the "Our Five Flavours" pill + arrow were removed on 23 Nov at the user's request).
   - Bottom: scrolling rail of 5 chapter cards, each with a progress line; the playing card lights up and the rail follows it; tap a card to jump to that chapter. Thumbnails `a/ch-1..5.webp` shown at **98 × 62 px** (files 294×186): frames at 0.3 s, 10.5 s (crown splash), 18.5 s (milk swirl), 22.6 s, 29.3 s.
   - Phone header: dark "JB" place pill (to `#find`) left, logo centred (cup above wordmark), dark MENU pill right. Desktop header unchanged. Header turns cream when scrolled.
   - Chapters: 0 s Bold black tea / SELECTED TEA LEAVES · 7.5 s Pulled, not stirred / THE ART OF TARIK · 14 s Silky, never too sweet / MILK MEETS HOT TEA · 22 s Handmade taufufah / SILKY SOY BEANCURD · 28.7 s Five flavours, one pull / PREMIUM · CHAM · MATCHA · TARO · JASMINE SEASALT
2. **Drinks** (`#drinks`): Version 1's 3D cup stage (Three.js lathe cup wrapped in real photos, floating ingredients, milk bubbles). Titles "Five Ways" / "Pick Yours". Flavour cards and arrows removed on 23 Nov. The bottom-right title ("Pick Yours" before) now shows the current drink name in two lines (e.g. Cham / Teh Tarik) with React Bits **FoldText** (paper fold, hinge top, plain-JS port in `src/fold-text/`; set in **Inter 800**, letter-spacing -0.02em, to match the React Bits demo), folding to the next name on every switch. Auto-advances every ~2.5 s, 4.5 s safety unlock. On phones the name sits centred under the cup.
3. **Our Story**: Born in Johor (pour photo), Why taufufah, The first stall (Johor Jaya cart photo), Milestones (award + photo), Made by hand (stall photo + prep steps).
4. **Brand Highlights**: two columns. Left: React Bits **DepthCarousel** (stacked 3D deck, GSAP tween, arrows + dots, drag/swipe; `tiltDirection: left`, tint tea brown, `captureWheel: false` so the page still scrolls), ported to plain JS (`src/depth-carousel/`). Heading (eyebrow + "Up close.") sits above both columns like other sections. Right: live text panel (count, title, subtitle, 2-sentence description) that follows the active photo. Text stacks above the deck on phones. Replaced CircularCarousel on 23 Nov (FlexCarousel was tried and reverted; both kept in `src/`). 10 photos.
5. **Find Us**: Jalan Sri Pelangi + day stall photo.

## How the hero film was made
- 5 clips generated in **MuleRun with Kling / Kling Omni** (10 s each, 720p, multi-shot prompts, orange studio background, no people/hands/text). Clip 3 was regenerated so milk turns the tea milk-tea coloured with white steam.
- Edited: trimmed and joined with 0.5 s cross-fades. Downloadable master: `BestTarik-hero-video-720p.mp4` (CRF 17).
- **9:16 version (made 23 Nov, not used on the site)**: 5 new native 9:16 Kling clips (MuleRun only allows a start frame, no reference images; Omni takes its ratio from the start frame, only Kling V3 has a ratio picker). Cut to the same chapter timings as the 16:9 film (38.7 s). Files kept outside the repo: web copy 720×1280 and master 1080×1920. Not on the site because the user chose Delta's approach (one 16:9 film, sides cropped). Possible use: IG/TikTok.

## Photos
- Real photos came from IG screenshots: cropped (IG UI removed, "we're open" text inpainted), upscaled x4 with Real-ESRGAN (`tools/upscale_photos.py`), web copies are 1280 px WebP in `a/photo-*.webp`.
- "Made by hand" photo comes from a @jbcityguide collab post: confirm permission with the owner.

## Still to do / open questions
- Fill every "To add" in `index.html`: opening hours, WhatsApp number, remaining milestones and dates, story details for the first stall.
- Confirm the official award wording and which stall was actually the first.
- Optional: captioned 9:16 hero video for IG/TikTok (clips already exist); Cham/Taro/Jasmine cut-out cups for Highlights.

## Decisions made (don't undo without asking)
- Everything above Our Story is the HeroTea-style film + the 3D drink stage. V2's 3D hero, swipe cards and scroll-scrubbed pour were removed.
- Hero layout follows deltacafes.com: one 16:9 film on every screen, full viewport height, sides cropped on narrow screens. No separate 9:16 file on the site. No CTA button in the hero.
- Captions are HTML text over the video, not burned in.
- Earlier versions are kept unchanged (artifacts + `versions/v1`, `versions/v2` in the repo).
