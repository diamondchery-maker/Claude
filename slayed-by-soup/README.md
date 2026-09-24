# Slayed by Soup website

Single-page site for Slayed by Soup (licensed nail specialist, Orlando FL 32812).
Plain static files, no build step. Open `index.html` through any static server
or deploy the folder to GitHub Pages, Netlify, Vercel, etc.

## What's inside
- `index.html` has all the content: hours, reviews, policies, things to remember
- `css/styles.css` holds the neon glam theme (colors are tokens at the top of the file)
- `js/scene.js` is the Three.js stage: floating press-on nails (tap/click one to spin it), diamonds, sparkle field
- `js/main.js` covers smooth scroll, scroll animations, the live "open now" status (Orlando time), the menu and the booking checklist
- `vendor/` holds self-hosted Three.js, GSAP + ScrollTrigger and Lenis, so the site doesn't depend on a CDN

All "Book" buttons go to https://slayedbysoup.as.me/.

## Swap in real photos
`assets/img/soup.jpg` and `assets/img/set-pink-crystal.jpg` were cropped from
phone screenshots. Replace them with the original files (same names) for sharper images.

## Accessibility
Honors `prefers-reduced-motion` (no preloader, smooth scroll or 3D motion), has a skip link,
keyboard focus styles, 44px+ touch targets, and falls back gracefully without WebGL or JS.
