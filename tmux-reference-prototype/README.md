# Tmux Reference Prototype

This is a real tmux/iTerm prototype for the portfolio layout. It does not try to
recreate tmux in the browser. It creates an actual tmux session, uses your tmux
theme, and runs small terminal scripts inside each pane.

It does not edit `~/.tmux.conf`, your iTerm profile, or any shell theme files.
The launcher only changes options inside the temporary session it creates.

## Run

```sh
cd tmux-reference-prototype
./run.sh --fresh
```

For the best iTerm inline-image behavior, run from a normal iTerm shell, not
from inside tmux:

```sh
./run.sh --fresh --cc
```

This uses iTerm2's native tmux integration mode (`tmux -CC`), which lets iTerm
manage panes and image rendering while tmux owns the session.

For a dry smoke test that creates the session without attaching:

```sh
./run.sh --fresh --no-attach --session=portfolio-test
tmux attach -t portfolio-test
```

If you are already inside tmux, the script switches your client into the new
session. Outside tmux, it attaches to the session.

## Controls

- Click rows inside the project, experience, and research panes to select them.
- Press `1`, `2`, `3`, etc. to select rows without the mouse.
- Press `r` to redraw a pane.
- Press `q` to leave a pane script and return to your shell.

The scripts enable terminal mouse reporting while they run. tmux mouse mode is
enabled only for this session.

## Inline Image Test

From an iTerm pane, run:

```sh
cd tmux-reference-prototype
./scripts/test-image.zsh
```

Inside tmux, this requires `allow-passthrough on`. The launcher sets it for the
temporary portfolio session, and your global tmux config can also enable it.
The helper prefers iTerm2's bundled `imgcat` utility when available and falls
back to a local OSC 1337 implementation otherwise.

## Files To Replace Later

- `assets/profile.ansi`: your ANSI portrait.
- `assets/previews/*.png`: iTerm inline preview images.
- `assets/resume/Taufiq-Syed-Resume.pdf`: final resume file.
- `data/projects.psv`, `data/experience.psv`, `data/research.psv`: portfolio
  content.

## Notes

- The panes intentionally avoid heavy fake borders, glows, or custom web styling.
  tmux and iTerm provide the real frame, font, and spacing.
- iTerm inline images use the proprietary OSC 1337 image escape. Other terminals
  will fall back to a plain text placeholder.
- Normal tmux can show inline image artifacts because images are terminal
  overlays, not tmux cells. Prefer `./run.sh --fresh --cc` when evaluating image
  placement.
- This is a reference rig for the eventual website, not the final website
  architecture.
