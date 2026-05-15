#!/usr/bin/env zsh

run_item_pane() {
  local data_file="$1"
  local command="$2"
  local detail_label="${3:-repo}"

  local -a ids names summaries descriptions links images tags
  local id name summary description link image tag_line

  while IFS='|' read -r id name summary description link image tag_line; do
    [[ -z "$id" || "$id" == \#* ]] && continue
    ids+=("$id")
    names+=("$name")
    summaries+=("$summary")
    descriptions+=("$description")
    links+=("$link")
    images+=("$image")
    tags+=("$tag_line")
  done < "$data_file"

  local selected=1
  local row_start=6
  local count="${#ids[@]}"

  render_item_pane() {
    local cols
    cols="$(ui_cols)"
    local name_width=24
    local summary_width=$(( cols - name_width - 8 ))

    (( summary_width < 18 )) && summary_width=18

    ui_clear
    ui_command "$command"
    ui_hint "click a row, press 1-${count}, r redraw, q quit"

    local i marker display_name display_summary
    for (( i = 1; i <= count; i++ )); do
      marker="$(ui_selected_marker "$i" "$selected")"
      display_name="$(ui_trunc "$names[$i]" "$name_width")"
      display_summary="$(ui_trunc "$summaries[$i]" "$summary_width")"

      if (( i == selected )); then
        printf '%b%s %-*s%b %b%s%b\n' \
          "$BOLD" "$marker" "$name_width" "$display_name" "$RESET" "$DIM" "$display_summary" "$RESET"
      else
        printf '%s %-*s %b%s%b\n' \
          "$marker" "$name_width" "$display_name" "$DIM" "$display_summary" "$RESET"
      fi
    done

    printf '\n'
    ui_rule
    printf '%b%s%b\n' "$BOLD" "$names[$selected]" "$RESET"
    [[ -n "$tags[$selected]" ]] && printf '%b#%s%b\n' "$DIM" "${tags[$selected]//,/, #}" "$RESET"
    printf '\n'
    ui_iterm_image "$ROOT/$images[$selected]" "32" "10"
    printf '\n'
    ui_wrap "$(( cols - 2 ))" "$descriptions[$selected]"
    printf '\n'
    [[ -n "$links[$selected]" ]] && printf '%b%s:%b %s\n' "$GREEN" "$detail_label" "$RESET" "$links[$selected]"
  }

  ui_hide_cursor
  ui_enable_mouse
  trap ui_cleanup EXIT INT TERM

  while true; do
    render_item_pane
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
}
