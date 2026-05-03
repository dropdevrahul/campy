#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseGIF, decompressFrames } = require('gifuct-js');

const ROOT = path.resolve(__dirname, '..');
const GIFS_DIR = path.join(ROOT, 'assets', 'gifs');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'ascii-frames');

const RAMP = ' .:!*#@';

function parseArgs(argv) {
  const args = { width: null, height: null, invert: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--width' && argv[i + 1]) args.width = parseInt(argv[++i], 10);
    if (argv[i] === '--height' && argv[i + 1]) args.height = parseInt(argv[++i], 10);
    if (argv[i] === '--invert') args.invert = true;
  }
  return args;
}

function framesAreIdentical(f1, f2) {
  if (!f1 || !f2 || f1.length !== f2.length) return false;
  for (let i = 0; i < f1.length; i++) if (f1[i] !== f2[i]) return false;
  return true;
}

function detectBackground(frame) {
  // Sample edge pixels; the most common is the background
  const freq = new Map();
  const sample = (x, y) => {
    const i = (y * frame.dims.width + x) * 4;
    const key = frame.patch[i] + ',' + frame.patch[i+1] + ',' + frame.patch[i+2];
    freq.set(key, (freq.get(key) || 0) + 1);
  };

  const w = frame.dims.width, h = frame.dims.height;
  // Sample top row, bottom row, left col, right col
  for (let x = 0; x < w; x++) { sample(x, 0); sample(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { sample(0, y); sample(w - 1, y); }

  let best = null, bestCount = 0;
  for (const [k, count] of freq) {
    if (count > bestCount) { best = k; bestCount = count; }
  }
  const [r, g, b] = best.split(',').map(Number);
  return { r, g, b };
}

function compositeAndSample(frames, gifW, gifH, targetW, targetH, forceInvert) {
  const f0 = frames[0];
  const bg = detectBackground(f0);
  const tolerance = 30;

  // First pass: composite and find foreground bounding box
  const canvas = new Uint8ClampedArray(gifW * gifH * 4);
  let bbL = gifW, bbT = gifH, bbR = 0, bbB = 0;

  // Pass frames, compositing and tracking FG
  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    const left = frame.dims.left || 0;
    const top = frame.dims.top || 0;
    const fw = frame.dims.width;
    const fh = frame.dims.height;
    const patch = frame.patch;

    // Apply disposal from previous
    if (fi > 0) {
      const prevFrame = frames[fi - 1];
      if (prevFrame.dims.disposalType === 2) {
        const pl = prevFrame.dims.left || 0;
        const pt = prevFrame.dims.top || 0;
        const pw = prevFrame.dims.width;
        const ph = prevFrame.dims.height;
        for (let py = 0; py < ph; py++)
          for (let px = 0; px < pw; px++)
            canvas[((pt + py) * gifW + (pl + px)) * 4 + 3] = 0;
      }
    }

    for (let py = 0; py < fh; py++) {
      for (let px = 0; px < fw; px++) {
        const si = (py * fw + px) * 4;
        const di = ((top + py) * gifW + (left + px)) * 4;
        canvas[di] = patch[si];
        canvas[di + 1] = patch[si + 1];
        canvas[di + 2] = patch[si + 2];
        canvas[di + 3] = 255;

        // Is this foreground? (not background color)
        const dr = Math.abs(patch[si] - bg.r);
        const dg = Math.abs(patch[si + 1] - bg.g);
        const db = Math.abs(patch[si + 2] - bg.b);
        if ((dr + dg + db) > tolerance) {
          const ax = left + px, ay = top + py;
          if (ax < bbL) bbL = ax; if (ax > bbR) bbR = ax;
          if (ay < bbT) bbT = ay; if (ay > bbB) bbB = ay;
        }
      }
    }
  }

  const cw = bbR - bbL + 1;
  const ch = bbB - bbT + 1;

  // Auto-detect invert from foreground pixels
  let sampleDark = 0, sampleTotal = 0;
  for (let y = bbT; y <= bbB && sampleTotal < 5000; y++) {
    for (let x = bbL; x <= bbR; x++) {
      const i = (y * gifW + x) * 4;
      const dr = Math.abs(canvas[i] - bg.r);
      const dg = Math.abs(canvas[i+1] - bg.g);
      const db = Math.abs(canvas[i+2] - bg.b);
      if ((dr + dg + db) <= tolerance) continue;
      const lum = 0.299 * canvas[i] + 0.587 * canvas[i+1] + 0.114 * canvas[i+2];
      if (lum < 128) sampleDark++;
      sampleTotal++;
    }
  }
  const invert = forceInvert || (sampleTotal > 0 && sampleDark / sampleTotal <= 0.5);

  // Second pass: sample ASCII from composited canvas using crop region
  const allFrames = [];
  const allDurations = [];
  let prev = null;

  // Reset canvas for second pass
  canvas.fill(0);
  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    const left = frame.dims.left || 0;
    const top = frame.dims.top || 0;
    const fw = frame.dims.width;
    const fh = frame.dims.height;
    const patch = frame.patch;

    if (fi > 0) {
      const prevFrame = frames[fi - 1];
      if (prevFrame.dims.disposalType === 2) {
        const pl = prevFrame.dims.left || 0;
        const pt = prevFrame.dims.top || 0;
        const pw = prevFrame.dims.width;
        const ph = prevFrame.dims.height;
        for (let py = 0; py < ph; py++)
          for (let px = 0; px < pw; px++)
            canvas[((pt + py) * gifW + (pl + px)) * 4 + 3] = 0;
      }
    }

    for (let py = 0; py < fh; py++) {
      for (let px = 0; px < fw; px++) {
        const si = (py * fw + px) * 4;
        const di = ((top + py) * gifW + (left + px)) * 4;
        canvas[di] = patch[si];
        canvas[di + 1] = patch[si + 1];
        canvas[di + 2] = patch[si + 2];
        canvas[di + 3] = 255;
      }
    }

    // Per-frame contrast from FG pixels only
    let minLum = 255, maxLum = 0;
    for (let y = bbT; y <= bbB; y++) {
      for (let x = bbL; x <= bbR; x++) {
        const i = (y * gifW + x) * 4;
        const dr = Math.abs(canvas[i] - bg.r);
        const dg = Math.abs(canvas[i+1] - bg.g);
        const db = Math.abs(canvas[i+2] - bg.b);
        if ((dr + dg + db) <= tolerance) continue;
        const lum = 0.299 * canvas[i] + 0.587 * canvas[i+1] + 0.114 * canvas[i+2];
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }
    }
    const range = maxLum - minLum || 1;

    const pxCol = cw / targetW;
    const pxRow = ch / targetH;
    const lines = [];
    for (let ty = 0; ty < targetH; ty++) {
      let line = '';
      for (let tx = 0; tx < targetW; tx++) {
        const sx = Math.floor(tx * pxCol);
        const ex = Math.floor((tx + 1) * pxCol);
        const sy = Math.floor(ty * pxRow);
        const ey = Math.floor((ty + 1) * pxRow);
        let tr = 0, tg = 0, tb = 0, count = 0;
        for (let py = sy; py < ey; py++) {
          const ay = bbT + py;
          if (ay >= gifH) continue;
          for (let px = sx; px < ex; px++) {
            const ax = bbL + px;
            if (ax >= gifW) continue;
            const i = (ay * gifW + ax) * 4;
            const dr = Math.abs(canvas[i] - bg.r);
            const dg = Math.abs(canvas[i+1] - bg.g);
            const db = Math.abs(canvas[i+2] - bg.b);
            if ((dr + dg + db) <= tolerance) continue;
            tr += canvas[i];
            tg += canvas[i + 1];
            tb += canvas[i + 2];
            count++;
          }
        }
        if (count === 0) { line += ' '; continue; }
        const lum = 0.299 * (tr / count) + 0.587 * (tg / count) + 0.114 * (tb / count);
        let n = invert ? 1 - (lum - minLum) / range : (lum - minLum) / range;
        n = Math.max(0, Math.min(1, n));
        line += RAMP[Math.floor(n * (RAMP.length - 1))];
      }
      lines.push(line);
    }

    const delay = Math.max(100, frame.delay * 2);

    if (framesAreIdentical(prev, lines)) {
      allDurations[allDurations.length - 1] += delay;
    } else {
      allFrames.push(lines);
      allDurations.push(delay);
      prev = lines;
    }
  }

  return { frames: allFrames, durations: allDurations };
}

function convert(gifPath, targetW, targetH, forceInvert) {
  const buf = fs.readFileSync(gifPath);
  const parsed = parseGIF(buf.buffer);
  const frames = decompressFrames(parsed, true);
  return compositeAndSample(frames, parsed.lsd.width, parsed.lsd.height, targetW, targetH, forceInvert);
}

async function main() {
  const args = parseArgs(process.argv);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(GIFS_DIR)) { console.error('No assets/gifs/'); process.exit(1); }
  const gifFiles = fs.readdirSync(GIFS_DIR).filter(f => f.endsWith('.gif'));
  if (gifFiles.length === 0) { console.log('No GIFs found'); process.exit(0); }
  for (const file of gifFiles) {
    const petName = path.basename(file, '.gif').split('-')[0];
    const w = args.width || 28;
    const h = args.height || 16;
    console.log(`Converting ${file}...`);
    const result = convert(path.join(GIFS_DIR, file), w, h, args.invert);
    const outPath = path.join(OUTPUT_DIR, `${petName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result));
    console.log(`  → ${outPath} (${result.frames.length} frames)`);
  }
  console.log('\nDone!');
}

main();
