#!/usr/bin/env bash
# tests/infrastructure/verify_folder_structure.sh
# Verifies the root project directory structure.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== Project Directory Structure Verification ==="
echo ""

# ── Required top-level directories ───────────────────────────────────────────
echo "-- Required Root Directories"

REQUIRED_DIRS=(
  ".devs"
  ".agent"
  "mcp-server"
  "src"
  "tests"
  "docs"
  "scripts"
  "packages"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ -d "$ROOT_DIR/$dir" ]]; then
    pass "$dir/ exists"
  else
    fail "$dir/ is missing"
  fi
done

# ── .devs/ internals ──────────────────────────────────────────────────────────
echo ""
echo "-- .devs/ Directory Initialization"

DEVS_DIR="$ROOT_DIR/.devs"

if [[ -f "$DEVS_DIR/.gitignore" ]]; then
  pass ".devs/.gitignore exists (flight records excluded from VCS)"
else
  fail ".devs/.gitignore is missing"
fi

if [[ -f "$DEVS_DIR/POLICY.md" ]]; then
  pass ".devs/POLICY.md exists (Developer Agent write-access policy)"
else
  fail ".devs/POLICY.md is missing"
fi

# ── Documentation ─────────────────────────────────────────────────────────────
echo ""
echo "-- Architecture Documentation"

ARCH_DOC="$ROOT_DIR/docs/architecture/directory_structure.md"
if [[ -f "$ARCH_DOC" ]]; then
  pass "docs/architecture/directory_structure.md exists"
else
  fail "docs/architecture/directory_structure.md is missing"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
