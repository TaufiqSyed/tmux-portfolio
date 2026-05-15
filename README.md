# Taufiq Syed Tmux Portfolio

A Next.js portfolio UI that simulates a translucent tmux session over a video
background. The browser version is the real portfolio surface; the tmux folder
is a local reference prototype for matching authentic terminal spacing, color,
and pane behavior.

## Run

```sh
pnpm dev
```

Open `http://localhost:3000`.

## Useful Scripts

```sh
pnpm lint
pnpm build
pnpm ascii:profile
```

`pnpm ascii:profile` regenerates `public/ascii/profile.ansi` from
`public/images/taufiqpixelart.png`. It uses `ffmpeg`/`ffprobe` to decode the
source image and writes truecolor ANSI that the profile pane renders directly.

## Project Structure

- `app/`: Next app, terminal shell UI, theme/media controls, ANSI renderer.
- `public/ascii/`: generated ANSI assets used by the site.
- `public/images/`: source image assets, including the pixel-art portrait.
- `public/videos/`: local background videos.
- `public/audio/`: local ambient audio loops.
- `public/resume/`: downloadable resume placeholder.
- `scripts/`: local asset-generation scripts.
- `tmux-reference-prototype/`: real tmux/iTerm prototype used as a visual
  reference while designing the web UI.

## Notes

- The UI stores theme, video, audio, pane opacity, and blur settings in
  `localStorage`.
- The terminal font stack prefers `JetBrainsMono Nerd Font Mono` locally and
  falls back to regular JetBrains Mono.
- Generated build/cache folders such as `.next/` and `.next.stale-*` are
  intentionally ignored.
