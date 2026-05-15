#!/usr/bin/env zsh
set -euo pipefail

ROOT="${0:A:h:h}"
source "$ROOT/scripts/lib/ui.zsh"

typeset -a ids titles orgs periods summaries descriptions
typeset id title org period summary description

while IFS='|' read -r id title org period summary description; do
  [[ -z "$id" || "$id" == \#* ]] && continue
  ids+=("$id")
  titles+=("$title")
  orgs+=("$org")
  periods+=("$period")
  summaries+=("$summary")
  descriptions+=("$description")
done < "$ROOT/data/experience.psv"

selected=1
row_start=6
count="${#ids[@]}"

render_experience() {
  local cols title_width summary_width i marker display_title display_summary
  cols="$(ui_cols)"
  title_width=24
  summary_width=$(( cols - title_width - 8 ))
  (( summary_width < 18 )) && summary_width=18

  ui_clear
  ui_command "cat ~/Portfolio/experience.log"
  ui_hint "click a row, press 1-${count}, r redraw, q quit"

  for (( i = 1; i <= count; i++ )); do
    marker="$(ui_selected_marker "$i" "$selected")"
    display_title="$(ui_trunc "$titles[$i]" "$title_width")"
    display_summary="$(ui_trunc "$orgs[$i] / $summaries[$i]" "$summary_width")"

    if (( i == selected )); then
      printf '%b%s %-*s%b %b%s%b\n' \
        "$BOLD" "$marker" "$title_width" "$display_title" "$RESET" "$DIM" "$display_summary" "$RESET"
    else
      printf '%s %-*s %b%s%b\n' \
        "$marker" "$title_width" "$display_title" "$DIM" "$display_summary" "$RESET"
    fi
  done

  printf '\n'
  ui_rule
  printf '%b%s%b\n' "$GREEN" "$periods[$selected]" "$RESET"
  printf '%b%s%b %b@ %s%b\n\n' "$BOLD" "$titles[$selected]" "$RESET" "$DIM" "$orgs[$selected]" "$RESET"
  ui_wrap "$(( cols - 2 ))" "$descriptions[$selected]"
}

ui_hide_cursor
ui_enable_mouse
trap ui_cleanup EXIT INT TERM

while true; do
  render_experience
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
        selected=$(( UI_MOUSE_Y - row_start + 1 ))
      fi
      ;;
    [1-9])
      if (( UI_KEY >= 1 && UI_KEY <= count )); then
        selected="$UI_KEY"
      fi
      ;;
  esac
done
