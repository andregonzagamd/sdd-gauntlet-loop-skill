#!/usr/bin/env bash
# install.sh — install the SDD + Gauntlet Loop skill into a project or globally.
#
#   ./install.sh                        # into the current directory, for Cursor
#   ./install.sh ~/code/meu-projeto     # into another project
#   ./install.sh --global               # into ~/.cursor (available in every project)
#   ./install.sh --agent all            # Cursor + Claude Code + Codex at once
#   ./install.sh --no-templates         # skill and subagents only, no root files
#
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$PWD"
AGENTS_ARG="cursor"
GLOBAL=0
TEMPLATES=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global)       GLOBAL=1; shift ;;
    --agent)        AGENTS_ARG="${2:-}"; shift 2 ;;
    --agent=*)      AGENTS_ARG="${1#*=}"; shift ;;
    --no-templates) TEMPLATES=0; shift ;;
    -h|--help)      sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)             echo "unknown option: $1" >&2; exit 1 ;;
    *)              TARGET="$1"; shift ;;
  esac
done

case "$AGENTS_ARG" in
  cursor) DIRS=(".cursor") ;;
  claude) DIRS=(".claude") ;;
  codex)  DIRS=(".codex") ;;
  all)    DIRS=(".cursor" ".claude" ".codex") ;;
  *)      echo "--agent must be one of: cursor, claude, codex, all" >&2; exit 1 ;;
esac

if [[ $GLOBAL -eq 1 ]]; then
  TARGET="$HOME"
  TEMPLATES=0
else
  TARGET="$(cd "$TARGET" && pwd)"
fi

say() { printf '  %s\n' "$1"; }

echo
echo "SDD + Gauntlet Loop → $TARGET"
echo

for d in "${DIRS[@]}"; do
  # global installs use ~/.cursor, project installs use <project>/.cursor
  base="$TARGET/$d"
  mkdir -p "$base/skills" "$base/agents" "$base/commands"
  rm -rf "$base/skills/sdd-gauntlet-loop"
  cp -R "$SRC/skills/sdd-gauntlet-loop" "$base/skills/"
  cp "$SRC/agents/"*.md "$base/agents/"
  cp "$SRC/commands/"*.md "$base/commands/"
  say "$d/skills/sdd-gauntlet-loop"
  say "$d/agents/{spec-writer,builder,harsh-critic,integrator}.md"
  say "$d/commands/sdd-{spec,contract,gauntlet,integrate,archive}.md"
done

if [[ $TEMPLATES -eq 1 ]]; then
  echo
  for f in AGENTS.md contract.md progress.md; do
    if [[ -e "$TARGET/$f" ]]; then
      say "kept existing $f"
    else
      cp "$SRC/skills/sdd-gauntlet-loop/assets/$f" "$TARGET/$f"
      say "created $f"
    fi
  done

  # Tool-specific constitution files point at the one AGENTS.md.
  for link in CLAUDE.md GEMINI.md; do
    if [[ -e "$TARGET/$link" || -L "$TARGET/$link" ]]; then
      say "kept existing $link"
    elif ln -s AGENTS.md "$TARGET/$link" 2>/dev/null; then
      say "linked $link -> AGENTS.md"
    else
      # Windows without Developer Mode can't create symlinks — leave a pointer.
      printf '# %s\n\nThis project keeps one constitution for every agent.\nRead **[AGENTS.md](AGENTS.md)** — it is the authoritative file.\n' \
        "${link%.md}" > "$TARGET/$link"
      say "created $link (pointer to AGENTS.md — symlinks unavailable here)"
    fi
  done

  mkdir -p "$TARGET/specs"
fi

echo
echo "Done. Next:"
if [[ $TEMPLATES -eq 1 ]]; then
  echo "  1. fill in the [brackets] in AGENTS.md — commands, stack, conventions"
  echo "  2. open the project in your agent and run:  /sdd-gauntlet-loop <what to build>"
else
  echo "  the skill is available in every project. In a project without AGENTS.md,"
  echo "  the skill creates it (plus contract.md and progress.md) on first run."
fi
echo
echo "  Or drive one phase at a time, approving between them:"
echo "    /sdd-spec <what to build>  ->  /sdd-contract <change-id>"
echo "    /sdd-gauntlet <change-id>  ->  /sdd-integrate <change-id>  ->  /sdd-archive <change-id>"
echo
