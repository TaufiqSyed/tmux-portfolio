#!/usr/bin/env zsh

RESET=$'\033[0m'
BOLD=$'\033[1m'
DIM=$'\033[2m'
ITALIC=$'\033[3m'
GREEN=$'\033[32m'
BRIGHT_GREEN=$'\033[92m'
CYAN=$'\033[36m'
YELLOW=$'\033[33m'
MAGENTA=$'\033[35m'
RED=$'\033[31m'
REVERSE=$'\033[7m'

ROOT="${ROOT:-${0:A:h:h}}"

ui_clear() {
  printf '\033[H\033[2J'
}

ui_hide_cursor() {
  printf '\033[?25l'
}

ui_show_cursor() {
  printf '\033[?25h'
}

ui_enable_mouse() {
  printf '\033[?1000h\033[?1002h\033[?1006h'
}

ui_disable_mouse() {
  printf '\033[?1000l\033[?1002l\033[?1006l'
}

ui_cleanup() {
  ui_disable_mouse
  ui_show_cursor
  printf '%b' "$RESET"
}

ui_command() {
  local command="$1"
  printf '%b/%b via %bnode%b %bv24.15.0%b on %bcloud%b %b(us-east-2)%b\n' \
    "$CYAN" "$RESET" "$GREEN" "$RESET" "$BOLD" "$RESET" "$DIM" "$RESET" "$YELLOW" "$RESET"
  printf '%b›%b %s\n\n' "$BRIGHT_GREEN" "$RESET" "$command"
}

ui_hint() {
  printf '%b%s%b\n\n' "$DIM" "$1" "$RESET"
}

ui_selected_marker() {
  if [[ "$1" == "$2" ]]; then
    printf '%b›%b' "$BRIGHT_GREEN" "$RESET"
  else
    printf ' '
  fi
}

ui_option_marker() {
  if [[ "$1" == "$2" ]]; then
    printf '%b●%b' "$BRIGHT_GREEN" "$RESET"
  else
    printf '○'
  fi
}

ui_rule() {
  local cols line i
  cols="$(ui_cols)"
  line=""
  for (( i = 1; i <= cols; i++ )); do
    line+="-"
  done
  printf '%b%s%b\n' "$DIM" "$line" "$RESET"
}

ui_cols() {
  local cols="${COLUMNS:-}"
  if [[ -z "$cols" ]]; then
    cols="$(tput cols 2>/dev/null || printf 80)"
  fi
  printf '%s' "$cols"
}

ui_trunc() {
  local text="$1"
  local width="$2"

  if (( width <= 0 )); then
    printf ''
  elif (( ${#text} <= width )); then
    printf '%s' "$text"
  elif (( width <= 3 )); then
    printf '%s' "${text[1,$width]}"
  else
    printf '%s...' "${text[1,$(( width - 3 ))]}"
  fi
}

ui_wrap() {
  local width="$1"
  local text="$2"
  printf '%s\n' "$text" | fold -s -w "$width"
}

ui_imgcat_command() {
  local candidate
  for candidate in \
    "/Applications/iTerm.app/Contents/Resources/utilities/imgcat" \
    "/Applications/iTerm.app/Contents/Resources/imgcat" \
    "imgcat"; do
    if command -v "$candidate" >/dev/null 2>&1; then
      printf '%s' "$candidate"
      return 0
    fi
  done

  return 1
}

ui_iterm_image() {
  local file="$1"
  local width="${2:-36}"
  local height="${3:-10}"

  if [[ "${TMUX_PORTFOLIO_IMAGE_MODE:-inline}" != "inline" ]]; then
    ui_terminal_image_placeholder "$file" "$width" "$height"
    return 0
  fi

  if [[ ! -f "$file" ]]; then
    printf '%b[preview missing: %s]%b\n' "$DIM" "$file" "$RESET"
    return 0
  fi

  local imgcat_bin
  if imgcat_bin="$(ui_imgcat_command)"; then
    "$imgcat_bin" -W "$width" -H "$height" -r "$file"
    return 0
  fi

  local encoded encoded_name image_size args sequence chunk chunk_size start total
  encoded="$(base64 < "$file" | tr -d '\n')"
  encoded_name="$(printf '%s' "${file:t}" | base64 | tr -d '\n')"
  image_size="$(stat -f '%z' "$file" 2>/dev/null || wc -c < "$file" | tr -d ' ')"
  args="inline=1;width=${width};height=${height};preserveAspectRatio=1;size=${image_size};name=${encoded_name}"

  if [[ -n "${TMUX:-}" ]]; then
    # iTerm2 3.5+ supports multipart image transfer, which is more reliable
    # through tmux because each OSC payload remains small.
    printf '\033Ptmux;\033\033]1337;MultipartFile=%s\a\033\\' "$args"

    chunk_size=180
    total="${#encoded}"
    for (( start = 1; start <= total; start += chunk_size )); do
      chunk="${encoded[start,chunk_size]}"
      printf '\033Ptmux;\033\033]1337;FilePart=%s\a\033\\' "$chunk"
    done

    printf '\033Ptmux;\033\033]1337;FileEnd\a\033\\\n'
  else
    sequence=$'\033'"]1337;File=${args}:${encoded}"$'\a'
    printf '%s\n' "$sequence"
  fi
}

ui_terminal_image_placeholder() {
  local file="$1"
  local width="${2:-36}"
  local height="${3:-10}"
  local i bar_width

  (( width < 12 )) && width=12
  (( height < 5 )) && height=5
  bar_width=$(( width - 6 ))

  printf '%b+%s+%b\n' "$DIM" "${(l:$(( width - 2 ))::=:)}" "$RESET"
  for (( i = 1; i <= height - 2; i++ )); do
    case "$i" in
      2)
        printf '%b|%b  %b%*s%b  %b|%b\n' "$DIM" "$RESET" "$GREEN" "$bar_width" "" "$RESET" "$DIM" "$RESET"
        ;;
      4)
        printf '%b|%b  %b%*s%b  %b|%b\n' "$DIM" "$RESET" "$CYAN" "$(( bar_width * 3 / 4 ))" "" "$RESET" "$DIM" "$RESET"
        ;;
      6)
        printf '%b|%b  %b%*s%b  %b|%b\n' "$DIM" "$RESET" "$MAGENTA" "$(( bar_width / 2 ))" "" "$RESET" "$DIM" "$RESET"
        ;;
      *)
        printf '%b|%b%*s%b|%b\n' "$DIM" "$RESET" "$(( width - 2 ))" "" "$DIM" "$RESET"
        ;;
    esac
  done
  printf '%b+%s+%b\n' "$DIM" "${(l:$(( width - 2 ))::=:)}" "$RESET"
  printf '%b[%s]%b\n' "$DIM" "${file:t}" "$RESET"
}

ui_read_event() {
  UI_KEY=""
  UI_MOUSE_X=""
  UI_MOUSE_Y=""
  UI_MOUSE_KIND=""

  local char next seq ch
  IFS= read -rsk1 char || return 1

  if [[ "$char" == $'\033' ]]; then
    IFS= read -rsk1 -t 0.03 next || {
      UI_KEY="escape"
      return 0
    }

    if [[ "$next" == "[" ]]; then
      seq=""
      while IFS= read -rsk1 -t 0.03 ch; do
        seq+="$ch"
        [[ "$ch" == "M" || "$ch" == "m" || "$ch" == "~" ]] && break
      done

      if [[ "$seq" =~ '^<([0-9]+);([0-9]+);([0-9]+)([Mm])$' ]]; then
        UI_KEY="mouse"
        UI_MOUSE_KIND="$match[1]"
        UI_MOUSE_X="$match[2]"
        UI_MOUSE_Y="$match[3]"
        return 0
      fi
    fi

    UI_KEY="escape"
    return 0
  fi

  UI_KEY="$char"
}
