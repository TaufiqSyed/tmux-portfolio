#!/usr/bin/env zsh
set -euo pipefail

ROOT="${0:A:h:h}"
source "$ROOT/scripts/lib/ui.zsh"

typeset -a themes videos music
themes=("Current" "Low glow" "Mono")
videos=("None" "Signal" "Noir")
music=("None" "Pulse" "Hum")

theme_selected=1
video_selected=1
music_selected=1
theme_row=0
video_row=0
music_row=0

name_art=$'
 _____  ___  _   _ _____ ___ ___    ____  _   _ _____ ____
|_   _|/ _ \\| | | |  ___|_ _/ _ \\  / ___|| | | | ____|  _ \\
  | | | |_| | | | | |_   | | | | | \\___ \\| |_| |  _| | | | |
  | | |  _  | |_| |  _|  | | |_| |  ___) |  _  | |___| |_| |
  |_| |_| |_|\\___/|_|   |___\\__\\_\\ |____/|_| |_|_____|____/
'

print_options() {
  local label="$1"
  local selected="$2"
  shift 2
  local -a options=("$@")
  local i marker

  printf '%b%-8s%b ' "$DIM" "$label" "$RESET"
  for (( i = 1; i <= ${#options[@]}; i++ )); do
    marker="$(ui_option_marker "$i" "$selected")"
    printf '%s %s  ' "$marker" "$options[$i]"
  done
  printf '\n'
}

select_from_mouse() {
  local y="$1"
  local x="$2"
  local slot

  (( x < 12 )) && return 0
  slot=$(( (x - 12) / 14 + 1 ))

  if (( y == theme_row && slot >= 1 && slot <= ${#themes[@]} )); then
    theme_selected="$slot"
  elif (( y == video_row && slot >= 1 && slot <= ${#videos[@]} )); then
    video_selected="$slot"
  elif (( y == music_row && slot >= 1 && slot <= ${#music[@]} )); then
    music_selected="$slot"
  fi
}

render_profile() {
  ui_clear
  ui_command "cat ~/Portfolio/profile.ansi"

  if [[ -f "$ROOT/assets/profile.ansi" ]]; then
    cat "$ROOT/assets/profile.ansi"
  else
    printf '[missing profile.ansi]\n'
  fi

  printf '\n%b%s%b\n' "$DIM" "$name_art" "$RESET"
  ui_rule
  printf '%bmouse: click options  keyboard: t theme, v video, m music, q quit%b\n\n' "$DIM" "$RESET"

  theme_row="$(( $(printf '%s\n' "$name_art" | wc -l | tr -d ' ') + 16 ))"
  video_row=$(( theme_row + 1 ))
  music_row=$(( theme_row + 2 ))

  print_options "theme" "$theme_selected" "${themes[@]}"
  print_options "video" "$video_selected" "${videos[@]}"
  print_options "music" "$music_selected" "${music[@]}"

  printf '\n%bselected:%b theme=%s video=%s music=%s\n' \
    "$GREEN" "$RESET" "$themes[$theme_selected]" "$videos[$video_selected]" "$music[$music_selected]"
}

ui_hide_cursor
ui_enable_mouse
trap ui_cleanup EXIT INT TERM

while true; do
  render_profile
  ui_read_event || break

  case "$UI_KEY" in
    q)
      break
      ;;
    r)
      continue
      ;;
    t)
      theme_selected=$(( theme_selected % ${#themes[@]} + 1 ))
      ;;
    v)
      video_selected=$(( video_selected % ${#videos[@]} + 1 ))
      ;;
    m)
      music_selected=$(( music_selected % ${#music[@]} + 1 ))
      ;;
    mouse)
      if [[ "$UI_MOUSE_KIND" == "0" ]]; then
        select_from_mouse "$UI_MOUSE_Y" "$UI_MOUSE_X"
      fi
      ;;
  esac
done
