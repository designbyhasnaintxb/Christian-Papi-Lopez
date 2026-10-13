#!/usr/bin/env node
/* ==========================================================================
   VamosPickle media pipeline
   Drop ORIGINAL VamosPickle photos / videos into media-src/ named after their
   slot (e.g. media-src/hero.jpg, media-src/clip-1.mov) and run:

     cd tools && npm install && npm run media

   It writes the exact files index.html expects into
   "Christian Papi Lopez/assets/media/" — responsive WebP (+ AVIF for the two
   hero-level slots), poster frames, and web-ready MP4 + WebM films (needs ffmpeg
   with libx264 / libvpx-vp9 on PATH).
   Slots without a source file are skipped and keep their labelled placeholder.
   See docs/media-manifest.md for what each slot should show.
   ========================================================================== */
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, parse, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'media-src');
const OUT = join(ROOT, 'Christian Papi Lopez', 'assets', 'media');

// slot → output widths and formats (must match the <img>/<source> URLs in index.html)
const IMAGES = {
  hero: { widths: [800, 1600], avif: true, ratio: [4, 5] },
  papi: { widths: [800, 1600], avif: true, ratio: [4, 5] },
  'prog-private': { widths: [800], ratio: [16, 10] },
  'prog-small': { widths: [800], ratio: [16, 10] },
  'prog-clinic': { widths: [800], ratio: [16, 10] },
  'prog-large': { widths: [800], ratio: [16, 10] },
  'prog-youth': { widths: [800], ratio: [16, 10] },
  youth: { widths: [800], ratio: [16, 10] },
  adult: { widths: [800], ratio: [16, 10] },
  'gallery-1': { widths: [800], ratio: [4, 5] },
  'gallery-2': { widths: [800], ratio: [4, 5] },
  'gallery-3': { widths: [800], ratio: [4, 5] },
  'gallery-4': { widths: [800], ratio: [4, 5] },
  'gallery-5': { widths: [800], ratio: [4, 5] },
  'gallery-6': { widths: [800], ratio: [4, 5] },
  'shop-tee': { widths: [800], ratio: [1, 1] },
  'shop-hoodie': { widths: [800], ratio: [1, 1] },
  'shop-socks': { widths: [800], ratio: [1, 1] },
};
// poster images: explicit file wins, otherwise a frame is pulled from the video
const POSTERS = { 'video-main-poster': 1600, 'clip-1-poster': 720, 'clip-2-poster': 720, 'clip-3-poster': 720 };
const VIDEOS = ['video-main', 'clip-1', 'clip-2', 'clip-3'];

const IMG_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif'];
const VID_EXT = ['.mp4', '.mov', '.m4v', '.webm'];
if (!existsSync(SRC)) { console.error(`No ${SRC} folder — create it and add originals named by slot.`); process.exit(1); }
mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC);
const find = (slot, exts) => { const f = files.find((n) => parse(n).name === slot && exts.includes(parse(n).ext.toLowerCase())); return f ? join(SRC, f) : null; };
const hasFfmpeg = (() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
const done = []; const skipped = [];

for (const [slot, o] of Object.entries(IMAGES)) {
  const src = find(slot, IMG_EXT);
  if (!src) { skipped.push(slot); continue; }
  for (const w of o.widths) {
    const h = Math.round((w * o.ratio[1]) / o.ratio[0]);
    const img = sharp(src).rotate().resize(w, h, { fit: 'cover', position: sharp.strategy.attention });
    await img.clone().webp({ quality: 78 }).toFile(join(OUT, `${slot}-${w}.webp`));
    if (o.avif) await img.clone().avif({ quality: 52 }).toFile(join(OUT, `${slot}-${w}.avif`));
  }
  done.push(slot);
}

// Open Graph share image from the hero photo
const heroSrc = find('og', IMG_EXT) || find('hero', IMG_EXT);
if (heroSrc) { await sharp(heroSrc).rotate().resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, 'og.jpg')); done.push('og'); }

for (const v of VIDEOS) {
  const src = find(v, VID_EXT);
  const posterName = `${v}-poster`;
  const posterSrc = find(posterName, IMG_EXT);
  const pw = POSTERS[posterName];
  const ph = v === 'video-main' ? Math.round(pw * 9 / 16) : Math.round(pw * 16 / 9);
  if (posterSrc) {
    await sharp(posterSrc).rotate().resize(pw, ph, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 78 }).toFile(join(OUT, `${posterName}.webp`));
    done.push(posterName);
  }
  if (!src) { skipped.push(v); continue; }
  if (!hasFfmpeg) { console.warn(`ffmpeg not found — skipping ${v}`); skipped.push(v); continue; }
  const scale = v === 'video-main' ? 'scale=-2:1080' : 'scale=720:-2';
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', scale, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', join(OUT, `${v}.mp4`)]);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, '-vf', scale, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '96k', join(OUT, `${v}.webm`)]);
  if (v === 'video-main') {
    // short silent loop for the poster tile: 8 s, 720p, no audio
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', '2', '-t', '8', '-i', src, '-vf', 'scale=-2:720', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(OUT, 'video-main-loop.mp4')]);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', '2', '-t', '8', '-i', src, '-vf', 'scale=-2:720', '-an', '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', join(OUT, 'video-main-loop.webm')]);
  }
  if (!posterSrc) {
    const tmp = join(OUT, `${posterName}.tmp.jpg`);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', '1.5', '-i', src, '-frames:v', '1', tmp]);
    await sharp(tmp).resize(pw, ph, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 78 }).toFile(join(OUT, `${posterName}.webp`));
    (await import('node:fs')).rmSync(tmp);
  }
  done.push(v);
}

console.log(`Done: ${done.join(', ') || 'nothing'}`);
if (skipped.length) console.log(`No source yet (placeholder stays): ${skipped.join(', ')}`);
