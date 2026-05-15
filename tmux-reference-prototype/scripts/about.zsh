#!/usr/bin/env zsh
set -euo pipefail

ROOT="${0:A:h:h}"
source "$ROOT/scripts/lib/ui.zsh"

typeset -a labels targets
labels=("download resume" "email" "github" "linkedin")
targets=(
  "$ROOT/assets/resume/Taufiq-Syed-Resume.txt"
  "mailto:hello@example.com"
  "https://github.com/"
  "https://www.linkedin.com/"
)

row_start=10
count="${#labels[@]}"

open_target() {
  local target="$1"
  if command -v open >/dev/null 2>&1; then
    open "$target" >/dev/null 2>&1 || true
  fi
}

render_about() {
  local cols i marker
  cols="$(ui_cols)"

  ui_clear
  ui_command "cat ~/Portfolio/about.md"
  ui_hint "click an action, press 1-${count}, r redraw, q quit"

  ui_wrap "$(( cols - 2 ))" \
    "I build interfaces and systems that feel intentional, tactile, and a little cinematic. Replace this with the final bio, contact details, and resume links."
  printf '\n'

  for (( i = 1; i <= count; i++ )); do
    marker="$(ui_selected_marker "$i" "0")"
    printf '%s %b%d%b  %s\n' "$marker" "$DIM" "$i" "$RESET" "$labels[$i]"
  done

  printf '\n%bstatus:%b content placeholders ready for swap\n' "$GREEN" "$RESET"
}

ui_hide_cursor
ui_enable_mouse
trap ui_cleanup EXIT INT TERM

while true; do
  render_about
  ui_read_event || break

  case "$UI_KEY" in
    q)
      break
      ;;
    r)
      continue
      ;;
    mouse)
      if [[ "$UI_MOUSE_KIND" == "0" ]] && (( UI_MOUSE_Y >= row_start && UI_MOUSE_Y < row_start + count )); then
        open_target "$targets[$(( UI_MOUSE_Y - row_start + 1 ))]"
      fi
      ;;
    [1-9])
      if (( UI_KEY >= 1 && UI_KEY <= count )); then
        open_target "$targets[$UI_KEY]"
      fi
      ;;
  esac
done
