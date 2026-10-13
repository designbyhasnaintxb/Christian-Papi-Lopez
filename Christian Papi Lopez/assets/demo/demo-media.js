/* ==========================================================================
   DEMO PHOTOS — NOT VAMOSPICKLE MEDIA. REMOVE BEFORE LAUNCH.
   Free Pexels stock (Pexels License), hotlinked, used only to preview the
   layout. A demo photo appears ONLY in a slot whose real file is missing from
   assets/media/, and every one is badged "Demo photo". None of them show
   Coach Papi, VamosPickle players or VamosPickle events.
   To remove: delete the <script src="assets/demo/demo-media.js"> line in
   index.html (and this folder). Credits: assets/demo/CREDITS.md
   ========================================================================== */
(() => {
  const px = (id, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  window.VP_DEMO = {
    hero: px(29439333, 1600),        // young man playing pickleball, outdoor court
    papi: px(342361),                // person playing tennis
    adult: px(32975182),             // woman playing pickleball, indoor court
    youth: px(8224452),              // girl playing tennis
    'prog-private': px(17299528),    // paddle and ball on court
    'prog-small': px(17299534),      // ball and paddle on court, net
    'prog-clinic': px(20519122),     // balls and checkered paddles
    'prog-large': px(2623679),       // aerial view of courts
    'prog-youth': px(8223954),       // boy playing tennis
    'video-main': px(9716299, 1600), // top view of a court (poster only, no film)
    'clip-1': px(5741298, 720),      // indoor court
    'clip-2': px(34015721, 720),     // rackets and balls on court
    'clip-3': px(6010286, 720),      // court with a net
    'gallery-1': px(17299531, 800),  // paddle on blue
    'gallery-2': px(19872965, 800),  // empty court
    'gallery-3': px(32975182, 800),  // repeats are demo-only: only 15 suitable photos were verifiable
    'gallery-4': px(29439333, 800),
    'gallery-5': px(8223954, 800),
    'gallery-6': px(20519122, 800),
    'shop-tee': px(12039633, 800),   // white t-shirt mockup
    'shop-hoodie': px(28701959, 800) // person wearing black hoodie
    // shop-socks: no suitable free photo found — keeps its placeholder
  };
})();
