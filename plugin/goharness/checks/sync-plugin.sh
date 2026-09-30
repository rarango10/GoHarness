#!/usr/bin/env bash
#
# Resyncs the plugin from the repo and checks that no drift is left.
#
# The repo is the source; ~/.claude/skills/goharness/ is a copy. If you edit the repo and don't
# resync, the test session loads the old version and any conclusion is false.
#
# The check does NOT enumerate directories. It compares the plugin's whole tree against the tree
# the repo can rebuild, and demands that not a single file is extra or missing. The previous
# version did `diff -rq` over four known directories, and that is why it never saw the two plugin
# files that had no source in the repo (L35): a check that enumerates what it knows never finds
# what isn't on its list.
#
# The plugin lives in `plugin/goharness/` and is installed from the marketplace at the repo root.
# This script is only the development loop of whoever edits the harness: it mirrors
# `plugin/goharness/` into a copy Claude Code auto-loads, without going through
# `claude plugin update` on every change.
#
# It doesn't go in `.claude/` on purpose: there the repo would load its own skills besides the
# installed plugin, and there would be two live versions of each one (L5, L44).
#
# Usage:  bash plugin/goharness/checks/sync-plugin.sh [plugin-path]

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PLUGIN="${1:-$HOME/.claude/skills/goharness}"

# Skills that live in the repo but are NOT the harness's: vendored authoring tools.
# It is an exclusion list and not an inclusion list on purpose — that way a new harness skill gets
# in on its own, instead of someone having to remember to add it to a list.
# Today it is empty: `skill-creator` lived here and was taken out of the repo, because it is
# installed from the official marketplace. The mechanism stays for the next vendored skill.
DO_NOT_PACKAGE=()

[ -d "$PLUGIN" ] || { echo "✗ the plugin doesn't exist at $PLUGIN"; exit 1; }

# ---------------------------------------------------------------- copy

is_excluded() {
  local name="$1" x
  # The ${a[@]+"${a[@]}"} form avoids bash 3.2's "unbound variable" with set -u and an empty list.
  for x in ${DO_NOT_PACKAGE[@]+"${DO_NOT_PACKAGE[@]}"}; do
    if [ "$name" = "$x" ]; then return 0; fi
  done
  return 1
}

mkdir -p "$PLUGIN/skills" "$PLUGIN/agents" "$PLUGIN/workflows" "$PLUGIN/checks" "$PLUGIN/.claude-plugin"

for d in "$REPO"/plugin/goharness/skills/*/; do
  name="$(basename "$d")"
  if is_excluded "$name"; then continue; fi
  rm -rf "${PLUGIN:?}/skills/$name"
  cp -R "$d" "$PLUGIN/skills/$name"
done

cp "$REPO"/plugin/goharness/agents/*.md          "$PLUGIN/agents/"
cp "$REPO"/plugin/goharness/workflows/*.js       "$PLUGIN/workflows/"
cp "$REPO"/plugin/goharness/checks/*             "$PLUGIN/checks/"
cp "$REPO"/plugin/goharness/SKILL.md "$PLUGIN/"
cp "$REPO"/plugin/goharness/.claude-plugin/plugin.json "$PLUGIN/.claude-plugin/"

# ------------------------------------------------------- check the tree

# What the repo can rebuild, as paths relative to the plugin.
expected="$(mktemp)"
{
  for d in "$REPO"/plugin/goharness/skills/*/; do
    name="$(basename "$d")"
    if is_excluded "$name"; then continue; fi
    (cd "$REPO/plugin/goharness/skills" && find "$name" -type f ! -name '.DS_Store') | sed 's|^|skills/|'
  done
  (cd "$REPO/plugin/goharness/agents"    && find . -type f -name '*.md' ! -name '.DS_Store') | sed 's|^\./|agents/|'
  (cd "$REPO/plugin/goharness/workflows" && find . -type f -name '*.js' ! -name '.DS_Store') | sed 's|^\./|workflows/|'
  (cd "$REPO/plugin/goharness/checks"    && find . -type f ! -name '.DS_Store')              | sed 's|^\./|checks/|'
  echo "SKILL.md"
  echo ".claude-plugin/plugin.json"
} | sort > "$expected"

# What the plugin really has.
actual="$(mktemp)"
(cd "$PLUGIN" && find . -type f ! -name '.DS_Store') | sed 's|^\./||' | sort > "$actual"

extra="$(comm -13 "$expected" "$actual")"
missing="$(comm -23 "$expected" "$actual")"

status=0
if [ -n "$extra" ]; then
  echo "✗ files in the plugin with no source in the repo:"
  echo "$extra" | sed 's|^|    |'
  echo "  → bring them to plugin/goharness/ before continuing; the repo is the source."
  status=1
fi
if [ -n "$missing" ]; then
  echo "✗ repo files that didn't reach the plugin:"
  echo "$missing" | sed 's|^|    |'
  status=1
fi

rm -f "$expected" "$actual"

if [ "$status" -eq 0 ]; then
  n="$(cd "$PLUGIN" && find . -type f ! -name '.DS_Store' | wc -l | tr -d ' ')"
  echo "no drift — $n files, identical tree"
fi
exit "$status"
