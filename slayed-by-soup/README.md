# Slayed by Soup website

Single-page site for Slayed by Soup (licensed nail specialist, Orlando FL 32812).
Plain static files, no build step. Open `index.html` through any static server
or deploy the folder to GitHub Pages, Netlify, Vercel, etc.

## What's inside
- `index.html` has all the content: hours, reviews, policies, things to remember
- `css/styles.css` holds the neon glam theme (colors are tokens at the top of the file)
- `js/scene.src.js` is the Three.js stage: floating press-on nails (tap one to spin it), the
  scroll-built hero nail (sculpt, polish flood, chrome shine, crystals land, SLAYED), diamonds,
  sparkle field and neon bloom. It's bundled into `js/scene.js`, a plain script with no modules.
  After editing it, run `npm install && npm run build`.
- `js/main.js` covers smooth scroll, scroll animations, the live "open now" status (Orlando time), the pinned build story, glitter finger trail, the menu and the booking checklist
- `vendor/` holds self-hosted GSAP + ScrollTrigger and Lenis (Three.js is inside the bundle), so the site doesn't depend on a CDN

All "Book" buttons go to https://slayedbysoup.as.me/.

## Swap in real photos
`assets/img/soup.jpg` and `assets/img/set-pink-crystal.jpg` were cropped from
phone screenshots. Replace them with the original files (same names) for sharper images.

## Accessibility
Honors `prefers-reduced-motion` (no preloader, smooth scroll or 3D motion), has a skip link,
keyboard focus styles, 44px+ touch targets, and falls back gracefully without WebGL or JS.
