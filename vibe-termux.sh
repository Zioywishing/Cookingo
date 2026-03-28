#!/usr/bin/env bash

set -euo pipefail

session_name="${VIBE_TMUX_SESSION:-vibe}"
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_usage() {
  cat <<'EOF'
Usage: ./vibe-termux.sh [codex|claude]

Starts a tmux session with:
  - window 1: bun dev
  - window 2: codex or claude

Interactive codex selection also prompts for yolo mode and defaults to enabled.

If no argument is provided, the script prompts for a choice and defaults to codex.
EOF
}

require_command() {
  local cmd="$1"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

show_arrow_menu() {
  local title="$1"
  shift
  local options=("$@")
  local selected=0
  local key=""
  local menu_lines=$((${#options[@]} + 2))
  local first_render=1
  local i

  render_menu() {
    if [[ "$first_render" -eq 0 ]]; then
      printf '\033[%sF' "$menu_lines" >&2
    fi

    printf '%s\n' "$title" >&2
    for i in "${!options[@]}"; do
      if [[ "$i" -eq "$selected" ]]; then
        printf ' > %s\n' "${options[$i]}" >&2
      else
        printf '   %s\n' "${options[$i]}" >&2
      fi
    done
    printf 'Use \u2191/\u2193 then press Enter.\n' >&2
    first_render=0
  }

  printf '\033[?25l' >&2
  trap 'printf "\033[?25h" >&2' RETURN

  while true; do
    render_menu
    IFS= read -rsn1 key || true

    if [[ "$key" == $'\x1b' ]]; then
      IFS= read -rsn2 -t 0.1 key_suffix || true
      key+="${key_suffix:-}"
    fi

    case "$key" in
      "")
        printf '\033[?25h' >&2
        trap - RETURN
        printf '%s\n' "${options[$selected]}"
        return 0
        ;;
      $'\x1b[A')
        selected=$(((selected + ${#options[@]} - 1) % ${#options[@]}))
        ;;
      $'\x1b[B')
        selected=$(((selected + 1) % ${#options[@]}))
        ;;
    esac
  done
}

resolve_assistant_choice() {
  local choice="${1:-}"

  if [[ -z "$choice" ]]; then
    if [[ -t 0 ]]; then
      choice="$(show_arrow_menu "Select AI assistant" "codex" "claude")"
    fi
    choice="${choice:-codex}"
  fi

  case "$choice" in
    codex|claude)
      printf '%s\n' "$choice"
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo "Invalid assistant: $choice" >&2
      print_usage >&2
      exit 1
      ;;
  esac
}

resolve_codex_command() {
  local mode="${1:-}"

  if [[ "$mode" != "interactive" ]]; then
    printf 'codex\n'
    return 0
  fi

  local yolo_choice
  yolo_choice="$(show_arrow_menu "Enable yolo mode for codex?" "yes" "no")"

  if [[ "$yolo_choice" == "yes" ]]; then
    printf 'codex --yolo\n'
  else
    printf 'codex\n'
  fi
}

resolve_assistant_command() {
  local requested_choice="${1:-}"
  local interaction_mode="non-interactive"

  if [[ -z "$requested_choice" && -t 0 ]]; then
    interaction_mode="interactive"
  fi

  local assistant_choice
  assistant_choice="$(resolve_assistant_choice "$requested_choice")"

  case "$assistant_choice" in
    codex)
      resolve_codex_command "$interaction_mode"
      ;;
    claude)
      printf 'claude\n'
      ;;
  esac
}

require_command tmux

if tmux has-session -t "$session_name" 2>/dev/null; then
  exec tmux attach-session -t "$session_name"
fi

assistant_cmd="$(resolve_assistant_command "${1:-}")"
assistant_bin="${assistant_cmd%% *}"

require_command bun
require_command "$assistant_bin"

tmux new-session -d -s "$session_name" -c "$project_dir" -n dev "bun dev"
tmux new-window -t "$session_name:" -c "$project_dir" -n ai "$assistant_cmd"
tmux select-window -t "$session_name:ai"

exec tmux attach-session -t "$session_name"
