#!/usr/bin/env zsh
set -euo pipefail

ROOT="${0:A:h}"
SESSION="${TMUX_PORTFOLIO_SESSION:-portfolio}"
FRESH=0
NO_ATTACH=0
CC_ATTACH=0

for arg in "$@"; do
  case "$arg" in
    --fresh)
      FRESH=1
      ;;
    --no-attach)
      NO_ATTACH=1
      ;;
    --cc|--iterm)
      CC_ATTACH=1
      ;;
    --session=*)
      SESSION="${arg#--session=}"
      ;;
    *)
      print -u2 "Unknown option: $arg"
      print -u2 "Usage: ./run.sh [--fresh] [--no-attach] [--cc] [--session=name]"
      exit 2
      ;;
  esac
done

if (( CC_ATTACH )) && [[ -n "${TMUX:-}" ]]; then
  print -u2 "iTerm tmux integration mode must be started from a normal iTerm shell, not from inside tmux."
  print -u2 "Open a fresh iTerm tab/window and run: ./run.sh --fresh --cc"
  exit 2
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  if (( FRESH )); then
    tmux kill-session -t "$SESSION"
  elif (( CC_ATTACH )); then
    exec tmux -CC attach -t "$SESSION"
  else
    print "tmux session '$SESSION' already exists."
    print "Attach with: tmux attach -t $SESSION"
    print "Or use iTerm integration mode with: ./run.sh --cc"
    print "Or recreate it with: ./run.sh --fresh"
    exit 0
  fi
fi

if [[ -n "${TMUX:-}" ]]; then
  CLIENT_COLS="$(tmux display-message -p "#{client_width}" 2>/dev/null || printf 160)"
  CLIENT_LINES="$(tmux display-message -p "#{client_height}" 2>/dev/null || printf 48)"
else
  if [[ -t 1 ]]; then
    CLIENT_COLS="$(tput cols 2>/dev/null || printf 160)"
    CLIENT_LINES="$(tput lines 2>/dev/null || printf 48)"
  else
    CLIENT_COLS=240
    CLIENT_LINES=70
  fi
fi

profile_pane="$(tmux new-session -d -x "$CLIENT_COLS" -y "$CLIENT_LINES" -s "$SESSION" -n portfolio -c "$ROOT" -P -F "#{pane_id}")"
research_pane="$(tmux split-window -v -p 50 -t "$profile_pane" -c "$ROOT" -P -F "#{pane_id}")"
projects_pane="$(tmux split-window -h -p 66 -t "$profile_pane" -c "$ROOT" -P -F "#{pane_id}")"
experience_pane="$(tmux split-window -h -p 50 -t "$projects_pane" -c "$ROOT" -P -F "#{pane_id}")"
about_pane="$(tmux split-window -h -p 50 -t "$research_pane" -c "$ROOT" -P -F "#{pane_id}")"

tmux set-option -t "$SESSION" mouse on >/dev/null
tmux set-option -t "$SESSION" allow-passthrough on >/dev/null
tmux setw -t "$SESSION:portfolio" automatic-rename off >/dev/null
tmux setw -t "$SESSION:portfolio" pane-border-status top >/dev/null
tmux setw -t "$SESSION:portfolio" pane-border-format " #{pane_title} " >/dev/null
tmux rename-window -t "$SESSION:portfolio" portfolio

tmux select-pane -t "$profile_pane" -T "Profile"
tmux select-pane -t "$projects_pane" -T "Projects"
tmux select-pane -t "$experience_pane" -T "Background"
tmux select-pane -t "$research_pane" -T "Research"
tmux select-pane -t "$about_pane" -T "About"

sleep 0.25

tmux send-keys -t "$profile_pane" "./scripts/profile.zsh" C-m
sleep 0.35
tmux send-keys -t "$projects_pane" "./scripts/projects.zsh" C-m
sleep 0.35
tmux send-keys -t "$experience_pane" "./scripts/experience.zsh" C-m
sleep 0.35
tmux send-keys -t "$research_pane" "./scripts/research.zsh" C-m
sleep 0.35
tmux send-keys -t "$about_pane" "./scripts/about.zsh" C-m

tmux select-pane -t "$profile_pane"

if (( NO_ATTACH )); then
  print "created tmux session '$SESSION'"
  print "attach with: tmux attach -t $SESSION"
  print "or with iTerm integration: tmux -CC attach -t $SESSION"
  exit 0
fi

if (( CC_ATTACH )); then
  exec tmux -CC attach -t "$SESSION"
fi

if [[ -n "${TMUX:-}" ]]; then
  tmux switch-client -t "$SESSION"
else
  tmux attach -t "$SESSION"
fi
