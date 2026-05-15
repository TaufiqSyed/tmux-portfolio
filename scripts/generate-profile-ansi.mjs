#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [inputArg, outputArg, widthArg, modeArg] = process.argv.slice(2);

if (!inputArg || !outputArg) {
  console.error(
    "Usage: node scripts/generate-profile-ansi.mjs <input.png> <output.ansi> [pixel-width]",
  );
  process.exit(1);
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
const outputWidth = Number.parseInt(widthArg ?? "32", 10);
const outputMode = modeArg ?? "ascii";

if (!Number.isInteger(outputWidth) || outputWidth < 8) {
  console.error("pixel-width must be an integer >= 8");
  process.exit(1);
}

if (outputMode !== "ascii" && outputMode !== "blocks") {
  console.error("mode must be either ascii or blocks");
  process.exit(1);
}

function executable(candidates) {
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["-version"], {
      encoding: "utf8",
      stdio: ["ignore", "ignore", "ignore"],
    });

    if (result.status === 0) {
      return candidate;
    }
  }

  return undefined;
}

const ffmpeg = executable(["ffmpeg", "/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"]);
const ffprobe = executable([
  "ffprobe",
  "/opt/homebrew/bin/ffprobe",
  "/usr/local/bin/ffprobe",
]);

if (!ffmpeg || !ffprobe) {
  console.error("ffmpeg and ffprobe are required to generate ANSI art.");
  process.exit(1);
}

const probe = spawnSync(
  ffprobe,
  [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=s=x:p=0",
    inputPath,
  ],
  { encoding: "utf8" },
);

if (probe.status !== 0) {
  console.error(probe.stderr || `Unable to inspect ${inputPath}`);
  process.exit(1);
}

const [sourceWidth, sourceHeight] = probe.stdout
  .trim()
  .split("x")
  .map((value) => Number.parseInt(value, 10));

if (!sourceWidth || !sourceHeight) {
  console.error(`Unable to read image dimensions for ${inputPath}`);
  process.exit(1);
}

const raw = spawnSync(
  ffmpeg,
  ["-v", "error", "-i", inputPath, "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
  { encoding: "buffer", maxBuffer: sourceWidth * sourceHeight * 8 },
);

if (raw.status !== 0) {
  console.error(raw.stderr?.toString("utf8") || `Unable to decode ${inputPath}`);
  process.exit(1);
}

const pixels = raw.stdout;
const outputHeight = Math.max(2, Math.round((sourceHeight / sourceWidth) * outputWidth));
const transparentAlpha = 32;

function pixelAt(x, y) {
  const sourceX = Math.min(
    sourceWidth - 1,
    Math.floor((x / outputWidth) * sourceWidth),
  );
  const sourceY = Math.min(
    sourceHeight - 1,
    Math.floor((y / outputHeight) * sourceHeight),
  );
  const offset = (sourceY * sourceWidth + sourceX) * 4;

  return {
    alpha: pixels[offset + 3],
    blue: pixels[offset + 2],
    green: pixels[offset + 1],
    red: pixels[offset],
  };
}

function colorCode(kind, pixel) {
  const prefix = kind === "foreground" ? "38" : "48";
  return `\x1b[${prefix};2;${pixel.red};${pixel.green};${pixel.blue}m`;
}

function sameColor(left, right) {
  return (
    left &&
    right &&
    left.red === right.red &&
    left.green === right.green &&
    left.blue === right.blue
  );
}

function appendRun(state, nextForeground, nextBackground, character) {
  let chunk = "";

  if (!sameColor(state.foreground, nextForeground)) {
    chunk += nextForeground ? colorCode("foreground", nextForeground) : "\x1b[39m";
    state.foreground = nextForeground;
  }

  if (!sameColor(state.background, nextBackground)) {
    chunk += nextBackground ? colorCode("background", nextBackground) : "\x1b[49m";
    state.background = nextBackground;
  }

  return `${chunk}${character}`;
}

function luminance(pixel) {
  return pixel.red * 0.2126 + pixel.green * 0.7152 + pixel.blue * 0.0722;
}

function isSkinTone(pixel) {
  return (
    pixel.red > 110 &&
    pixel.green > 55 &&
    pixel.blue > 28 &&
    pixel.red > pixel.green &&
    pixel.green > pixel.blue &&
    pixel.red - pixel.blue > 45
  );
}

function asciiCharacter(pixel) {
  if (isSkinTone(pixel)) {
    const ramp = "O8@";
    const normalized = 1 - luminance(pixel) / 255;
    const index = Math.max(
      0,
      Math.min(ramp.length - 1, Math.round(normalized * (ramp.length - 1))),
    );

    return ramp[index];
  }

  const ramp = " .:-=+*#%@";
  const normalized = 1 - luminance(pixel) / 255;
  const index = Math.max(
    1,
    Math.min(ramp.length - 1, Math.round(normalized * (ramp.length - 1))),
  );

  return ramp[index];
}

if (outputMode === "ascii") {
  const lines = [];

  for (let y = 0; y < outputHeight; y += 1) {
    const state = { background: undefined, foreground: undefined };
    let line = "";

    for (let x = 0; x < outputWidth; x += 1) {
      const pixel = pixelAt(x, y);

      if (pixel.alpha < transparentAlpha) {
        line += appendRun(state, undefined, undefined, " ");
      } else {
        line += appendRun(state, pixel, undefined, asciiCharacter(pixel));
      }
    }

    lines.push(`${line}\x1b[0m`);
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

  console.log(
    `Generated ${outputPath} from ${sourceWidth}x${sourceHeight} ${inputPath} as ${outputWidth}x${outputHeight} colored ASCII cells.`,
  );
  process.exit(0);
}

const lines = [];

for (let y = 0; y < outputHeight; y += 2) {
  const state = { background: undefined, foreground: undefined };
  let line = "";

  for (let x = 0; x < outputWidth; x += 1) {
    const top = pixelAt(x, y);
    const bottom = y + 1 < outputHeight ? pixelAt(x, y + 1) : undefined;
    const hasTop = top.alpha >= transparentAlpha;
    const hasBottom = Boolean(bottom && bottom.alpha >= transparentAlpha);

    if (hasTop && hasBottom) {
      line += appendRun(state, top, bottom, "▀");
    } else if (hasTop) {
      line += appendRun(state, top, undefined, "▀");
    } else if (hasBottom) {
      line += appendRun(state, bottom, undefined, "▄");
    } else {
      line += appendRun(state, undefined, undefined, " ");
    }
  }

  lines.push(`${line}\x1b[0m`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

console.log(
  `Generated ${outputPath} from ${sourceWidth}x${sourceHeight} ${inputPath} as ${outputWidth}x${Math.ceil(
    outputHeight / 2,
  )} terminal cells.`,
);
