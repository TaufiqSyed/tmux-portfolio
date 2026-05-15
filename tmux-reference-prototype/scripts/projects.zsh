#!/usr/bin/env zsh
set -euo pipefail

ROOT="${0:A:h:h}"
source "$ROOT/scripts/lib/ui.zsh"
source "$ROOT/scripts/lib/item-pane.zsh"

run_item_pane "$ROOT/data/projects.psv" "ls ~/Portfolio/project-list" "repo"
