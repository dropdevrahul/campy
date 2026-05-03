#!/usr/bin/env node
/**
 * Extract existing ASCII animation frames from pets.tsx to JSON files.
 * 
 * This bridges the gap until GIF-derived frames are available.
 * Run: node scripts/extract-frames-to-json.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PETS_TSX = path.join(ROOT, '.opencode', 'plugins', 'pets.tsx');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'ascii-frames');

// Read the pets.tsx file
const source = fs.readFileSync(PETS_TSX, 'utf8');

// Extract frame arrays using regex
function extractFrames(stateName, block) {
  const frames = [];
  const padRegex = /pad\(\[([\s\S]*?)\],\s*\d+\)/g;
  let match;
  
  while ((match = padRegex.exec(block)) !== null) {
    const linesStr = match[1];
    const lines = linesStr
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('"') || l.startsWith("'"))
      .map(l => {
        // Extract string content
        const strMatch = l.match(/^["'](.*)["'],?\s*$/);
        return strMatch ? strMatch[1] : '';
      });
    frames.push(lines);
  }
  
  return frames;
}

// Parse cat animations
function parseCatAnim() {
  const match = source.match(/const catAnim: PetAnimations = \{([\s\S]*?)\n\}/);
  if (!match) return null;
  
  const block = match[1];
  const states = {};
  const stateRegex = /(idle|happy|sleeping|eating|playing|excited|sad):\s*\[([\s\S]*?)\],?\s*\n\s*(?:\}|[a-z])/g;
  
  let stateMatch;
  while ((stateMatch = stateRegex.exec(block)) !== null) {
    const stateName = stateMatch[1];
    const stateBlock = stateMatch[2];
    const frames = extractFrames(stateName, stateBlock);
    
    if (frames.length > 0) {
      states[stateName] = {
        frames,
        durations: frames.map(() => 500),
      };
    }
  }
  
  return states;
}

// Parse hamster animations
function parseHamAnim() {
  const match = source.match(/const hamAnim: PetAnimations = \{([\s\S]*?)\n\}/);
  if (!match) return null;
  
  const block = match[1];
  const states = {};
  const stateRegex = /(idle|happy|sleeping|eating|playing|excited|sad):\s*\[([\s\S]*?)\],?\s*\n\s*(?:\}|[a-z])/g;
  
  let stateMatch;
  while ((stateMatch = stateRegex.exec(block)) !== null) {
    const stateName = stateMatch[1];
    const stateBlock = stateMatch[2];
    const frames = extractFrames(stateName, stateBlock);
    
    if (frames.length > 0) {
      states[stateName] = {
        frames,
        durations: frames.map(() => 500),
      };
    }
  }
  
  return states;
}

// Parse ghost animations
function parseGhostAnim() {
  const match = source.match(/const ghostAnim: PetAnimations = \{([\s\S]*?)\n\}/);
  if (!match) return null;
  
  const block = match[1];
  const states = {};
  const stateRegex = /(idle|happy|sleeping|eating|playing|excited|sad):\s*\[([\s\S]*?)\],?\s*\n\s*(?:\}|[a-z])/g;
  
  let stateMatch;
  while ((stateMatch = stateRegex.exec(block)) !== null) {
    const stateName = stateMatch[1];
    const stateBlock = stateMatch[2];
    const frames = extractFrames(stateName, stateBlock);
    
    if (frames.length > 0) {
      states[stateName] = {
        frames,
        durations: frames.map(() => 500),
      };
    }
  }
  
  return states;
}

// Parse robot animations
function parseRobotAnim() {
  const match = source.match(/const robotAnim: PetAnimations = \{([\s\S]*?)\n\}/);
  if (!match) return null;
  
  const block = match[1];
  const states = {};
  const stateRegex = /(idle|happy|sleeping|eating|playing|excited|sad):\s*\[([\s\S]*?)\],?\s*\n\s*(?:\}|[a-z])/g;
  
  let stateMatch;
  while ((stateMatch = stateRegex.exec(block)) !== null) {
    const stateName = stateMatch[1];
    const stateBlock = stateMatch[2];
    const frames = extractFrames(stateName, stateBlock);
    
    if (frames.length > 0) {
      states[stateName] = {
        frames,
        durations: frames.map(() => 500),
      };
    }
  }
  
  return states;
}

// Manual extraction since regex parsing is fragile
// Based on reading pets.tsx directly

const catData = {
  idle: {
    frames: [
      ["  /\\_____/\\  ", " /          \\ ", "(    ^ ==  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  o   o  \\ ", "(    ^ ==  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  -   -  \\ ", "(    ^ ==  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  ·   ·  \\ ", "(    ^ ==  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  -   -  \\ ", "(    ^ ==  )", " \\  '-'  /  ", " (__)  (__) "],
    ],
    durations: [5000, 2000, 150, 80, 150],
  },
  happy: {
    frames: [
      ["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", "  | ♥ |    ", " (__) (__)  "],
    ],
    durations: [1500, 800],
  },
  sleeping: {
    frames: [
      ["  /\\_____/\\  ", " /  -   -  \\ ", "(  == z z  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  -   -  \\ ", "(  == Z z  )", " \\  '-'  /  ", " (__)  (__) "],
    ],
    durations: [2000, 1500],
  },
  eating: {
    frames: [
      ["  /\\_____/\\  ", " /  o   o  \\ ", "(  == ω ==  )", " \\  nom /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  nom /  ", " (__)  (__) "],
    ],
    durations: [400, 300],
  },
  playing: {
    frames: [
      ["    /\\_____/\\ ", "   /  ^   ^  \\", " ( == ω ==  ) ", "  \\  '-'  /  ", "  (__)  (__) "],
      ["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", " (__)  (__) "],
    ],
    durations: [500, 500],
  },
  excited: {
    frames: [
      ["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", "  | ♥ |    ", " (__) (__)  "],
      ["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω==  )", " \\  '-'  /  ", " (__)  (__) "],
    ],
    durations: [300, 300],
  },
  sad: {
    frames: [
      ["  /\\_____/\\  ", " /  -   -  \\ ", "(  == T T  )", " \\  '-'  /  ", " (__)  (__) "],
      ["  /\\_____/\\  ", " /  -   -  \\ ", "(  == T T  )", " \\  '-'  /  ", " (__)  (__) ", "   ;_;     "],
    ],
    durations: [4000, 2000],
  },
};

const hamsterData = {
  idle: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( ..)  ( ..) ", "   `--'`--'    ", "    (   )    ", "     ( )     "],
      [" (\\\\/)  (\\\\/) ", "  ( -.)  ( -.) ", "   `--'`--'    ", "    (   )    ", "     ( )     "],
    ],
    durations: [2000, 150],
  },
  happy: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "    ( ♥ )    ", "   run run! "],
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "    ( ♥ )    "],
    ],
    durations: [1500, 800],
  },
  sleeping: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( -.)  ( -.) ", "   `--'`--'    ", "    zzz     ", "     ( )     "],
      [" (\\\\/)  (\\\\/) ", "  ( -.)  ( -.) ", "   `--'`--'    ", "    ZZZ     ", "     ( )     "],
    ],
    durations: [2000, 1500],
  },
  eating: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( o.)  ( o.) ", "   `--'`--'    ", "    nom     ", "     ( )     "],
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "    nom!    ", "     ( )     "],
    ],
    durations: [400, 300],
  },
  playing: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "    ( ♥ )    ", "   run run! "],
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "   wheel!   ", "   run run! "],
    ],
    durations: [500, 500],
  },
  excited: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "    ( ♥ )    ", "   SQUEAK!  "],
      [" (\\\\/)  (\\\\/) ", "  ( ^.)  ( ^.) ", "   `--'`--'    ", "    ( ♥ )    "],
    ],
    durations: [300, 300],
  },
  sad: {
    frames: [
      [" (\\\\/)  (\\\\/) ", "  ( T.)  ( T.) ", "   `--'`--'    ", "    ;_;     ", "     ( )     "],
      [" (\\\\/)  (\\\\/) ", "  ( T.)  ( T.) ", "   `--'`--'    ", "   ;_;      ", "     ( )     "],
    ],
    durations: [4000, 2000],
  },
};

const ghostData = {
  idle: {
    frames: [
      ["   .-.     ", "           ", "  | O |    ", "  '~~~'    "],
      ["           ", "  (o o)    ", "           ", "           "],
      ["           ", "  (- -)    ", "           ", "           "],
      ["           ", "  (· ·)    ", "           ", "           "],
      ["           ", "  (- -)    ", "           ", "           "],
    ],
    durations: [5000, 2000, 150, 80, 150],
  },
  happy: {
    frames: [
      ["   .-.     ", "  (^ ^)    ", "  | ω |    ", "  '~~~'    ", "   boo!    "],
      ["   .-.     ", "  (^ ^)    ", "  | ♥ |    ", "  '~~~'    ", "   boo!    "],
    ],
    durations: [1500, 800],
  },
  sleeping: {
    frames: [
      ["   .-.     ", "  (- -)    ", "  | z |    ", "  '~~~'    "],
      ["   .-.     ", "  (- -)    ", "  | Z |    ", "  '~~~'    "],
    ],
    durations: [2000, 1500],
  },
  eating: {
    frames: [
      ["   .-.     ", "  (o o)    ", "  | ω |    ", "  '~~~'    ", "   nom~    "],
      ["   .-.     ", "  (o o)    ", "  | ω |    ", "  '~~~'    ", "   nom!    "],
    ],
    durations: [400, 300],
  },
  playing: {
    frames: [
      ["   .-.     ", "  (^ ^)    ", "  | ω |    ", "  '~~~'    ", "   ~~~     "],
      ["    .-.    ", "   (^ ^)   ", "   | ω |   ", "   '~~~'   ", "    ~~~    "],
    ],
    durations: [500, 500],
  },
  excited: {
    frames: [
      ["   .-.     ", "  (^ ^)    ", "  | ♥ |    ", "  '~~~'    ", "   BOO!    "],
      ["   .-.     ", "  (^ ^)    ", "  | ♥ |    ", "  '~~~'    "],
    ],
    durations: [300, 300],
  },
  sad: {
    frames: [
      ["   .-.     ", "  (T T)    ", "  |   |    ", "  '~~~'    "],
      ["   .-.     ", "  (T T)    ", "  | ; |    ", "  '~~~'    "],
    ],
    durations: [4000, 2000],
  },
};

const robotData = {
  idle: {
    frames: [
      ["    ___     ___  ", "                ", "   |___/   \\___| ", "      \\_|_/      "],
      ["                ", "   | O |---| O | ", "                ", "                "],
      ["                ", "   | - |---| - | ", "                ", "                "],
      ["                ", "   | · |---| · | ", "                ", "                "],
      ["                ", "   | - |---| - | ", "                ", "                "],
    ],
    durations: [5000, 2000, 150, 80, 150],
  },
  happy: {
    frames: [
      ["    ___     ___  ", "   | ^ |---| ^ | ", "   |___/   \\___| ", "      \\_|_/  ♥   "],
      ["    ___     ___  ", "   | ^ |---| ^ | ", "   |___/   \\___| ", "      \\_|_/      "],
    ],
    durations: [1500, 800],
  },
  sleeping: {
    frames: [
      ["    ___     ___  ", "   | - |---| - | ", "   |___/   \\___| ", "      \\_|_/ zzz  "],
      ["    ___     ___  ", "   | - |---| - | ", "   |___/   \\___| ", "      \\_|_/ ZZZ  "],
    ],
    durations: [2000, 1500],
  },
  eating: {
    frames: [
      ["    ___     ___  ", "   | ◉ |---| ◉ | ", "   |___/   \\___| ", "    nom nom !    "],
      ["    ___     ___  ", "   | ◉ |---| ◉ | ", "   |___/   \\___| ", "     nom !       "],
    ],
    durations: [400, 300],
  },
  playing: {
    frames: [
      ["    ___     ___  ", "   | ω |---| ω | ", "   |___/   \\___| ", "   > boop <      "],
      ["    ___     ___  ", "   | ω |---| ω | ", "   |___/   \\___| ", "   > beep <      "],
    ],
    durations: [500, 500],
  },
  excited: {
    frames: [
      ["    ___     ___  ", "   | ◉ |---| ◉ | ", "   |___/   \\___| ", "   !! ♥ !!       "],
      ["    ___     ___  ", "   | ◉ |---| ◉ | ", "   |___/   \\___| ", "   BEEP BOOP!    "],
    ],
    durations: [300, 300],
  },
  sad: {
    frames: [
      ["    ___     ___  ", "   | T |---| T | ", "   |___/   \\___| ", "      ;_;        "],
      ["    ___     ___  ", "   | T |---| T | ", "   |___/   \\___| ", "     404 :(       "],
    ],
    durations: [4000, 2000],
  },
};

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Write JSON files
const pets = {
  cat: catData,
  hamster: hamsterData,
  ghost: ghostData,
  robot: robotData,
};

for (const [name, data] of Object.entries(pets)) {
  const outputPath = path.join(OUTPUT_DIR, `${name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Written ${outputPath} (${Object.keys(data).length} states)`);
}

console.log('\nDone!');
