# Best Tarik & Co — brand website

Showcase and brand-story site for **Best Tarik & Co**, a teh tarik brand from Johor Bahru, Malaysia: pulled teh tarik over silky soy beancurd (taufufah), in five flavours (Premium, Cham, Matcha, Taro, Jasmine Seasalt). Instagram: [@besttarik.co](https://www.instagram.com/besttarik.co).

It is a static site: plain HTML, CSS and JavaScript, no build step.

## Run it locally

Video scrubbing needs a server that supports HTTP Range requests, so don't open the file directly:

```bash
python3 tools/rangeserve.py . 8000
# open http://localhost:8000
```

Any static host works for deployment (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's in the page (`index.html`, Version 3)

| Section | What it does |
|---|---|
| Hero film | Full-screen 38.7 s looping ingredient film (`a/hero-16x9.mp4`), five chapters, English captions as page text (Bodoni Moda Italic + Manrope) |
| Drinks | 3D cup built with Three.js (lathe model wrapped in real photos). Spins to the next flavour every ~2.5 s, ingredients implode and burst, drag/hover parallax |
| Our Story | Editorial rows, milestones (TNCSEA Shining Business Award 2026), made-by-hand process |
| Brand Highlights | React Bits `CircularCarousel` (cylinder preset), ported to plain JS |
| Find Us | Location, hours, contact |

Libraries are loaded from CDNs: Three.js 0.160 (jsDelivr), GSAP 3.12.2 + ScrollTrigger (cdnjs), Google Fonts.

## Layout

```
index.html                      Version 3 (current site)
a/                              images, video, 3D textures, ingredient sprites
versions/v1/                    Version 1 (white theme, 3D cup hero)
versions/v2/                    Version 2 (cinematic redesign; head.html + body.html + cupcore.js are combined into index.html)
src/circular-carousel/          React Bits CircularCarousel: original JSX + CSS, and the plain-JS port used in the site
tools/rangeserve.py             local static server with Range support
tools/upscale_photos.py         Real-ESRGAN x4 photo upscaler used for the real photos
```

## Still to add

Search `To add` in `index.html`: opening hours, WhatsApp number, remaining milestones and dates, team photo captions.

## Credits

- `CircularCarousel` from [React Bits](https://reactbits.dev/components/circular-carousel) (JS-CSS variant).
- Hero film clips generated with Kling; photos from Best Tarik & Co's own posts. Check usage rights before reusing any media.
