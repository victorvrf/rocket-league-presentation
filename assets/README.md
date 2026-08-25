# Assets

The four WebP visuals in `images/` were downloaded from the official Rocket League website's Season 23 news media and are used as local presentation imagery:

- `rl-arena.webp` - opening arena image
- `rl-competitive.webp` - competitive visual for the comparison slide
- `rl-aerial.webp` - aerial gameplay visual
- `ea-fc26-gameplay.jpg` - EA SPORTS FC 26 gameplay visual from EA's official FC 26 page

The `ranks/` folder contains local crops from the Rocket League Wiki's Competitive Ranks reference board (`rank-reference.jpg`), used as recognizable rank badge artwork rather than invented symbols.

The `videos/` folder holds one gameplay replay clip per skill stage for Slide 7 (see `videos/README.md` for expected filenames and guidelines). The slide degrades gracefully to a static image when clips are absent.

`lucide.min.js` is the local Lucide icon library used by the deck. The visuals are kept local so the presentation can run without a backend or external image requests.