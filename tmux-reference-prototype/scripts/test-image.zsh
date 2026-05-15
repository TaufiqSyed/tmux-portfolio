#!/usr/bin/env zsh
set -euo pipefail

ROOT="${0:A:h:h}"
source "$ROOT/scripts/lib/ui.zsh"

ui_command "imgcat ~/Portfolio/project-alpha.png"
printf 'Rendering with iTerm2 OSC 1337%s passthrough.\n' "$([[ -n "${TMUX:-}" ]] && printf ' + tmux multipart')"
printf 'TERM=%s TERM_PROGRAM=%s TMUX=%s\n\n' "${TERM:-}" "${TERM_PROGRAM:-}" "${TMUX:+set}"
ui_iterm_image "$ROOT/assets/previews/iterm-inline-test.png" "40" "12"
printf '\nIf the image appears above, inline images are working for the portfolio rig.\n'
printf 'Expected image: four very bright color blocks with a white cross.\n'
