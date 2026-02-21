#!/usr/bin/env bash
# tests/infrastructure/verify_aod_ratio.sh
# Verifies AOD (Agent-Oriented Documentation) infrastructure and 1:1 ratio invariant.
#
# AOD Rule: Every production TypeScript module in packages/<pkg>/src/ must have
# a corresponding .agent.md file in .agent/packages/<pkg>/ at the same relative path.
#
# This script checks:
#   1. .agent/packages/ directory structure mirrors packages/ structure.
#   2. Each package has a package-level .agent.md overview file.
#   3. The 1:1 module-to-documentation ratio is maintained (via aod_lint.py).
#   4. The AOD policy document exists.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== AOD Infrastructure Verification ==="
echo ""

# ── Required AOD package directories ──────────────────────────────────────────
echo "-- AOD Package Directory Structure"

REQUIRED_PKGS=(core agents sandbox memory mcp cli vscode)
AOD_BASE="$ROOT_DIR/.agent/packages"

if [[ -d "$AOD_BASE" ]]; then
  pass ".agent/packages/ directory exists"
else
  fail ".agent/packages/ directory is missing"
fi

for pkg in "${REQUIRED_PKGS[@]}"; do
  AOD_PKG_DIR="$AOD_BASE/$pkg"
  if [[ -d "$AOD_PKG_DIR" ]]; then
    pass ".agent/packages/$pkg/ exists"
  else
    fail ".agent/packages/$pkg/ is missing"
  fi
done

# ── Package-level .agent.md files ─────────────────────────────────────────────
echo ""
echo "-- Package-Level AOD Overview Files"

for pkg in "${REQUIRED_PKGS[@]}"; do
  AOD_FILE="$AOD_BASE/$pkg/.agent.md"
  if [[ -f "$AOD_FILE" ]]; then
    # Verify YAML front-matter is present (machine-readable requirement)
    if head -1 "$AOD_FILE" | grep -q "^---"; then
      pass ".agent/packages/$pkg/.agent.md exists with YAML front-matter"
    else
      fail ".agent/packages/$pkg/.agent.md exists but missing YAML front-matter"
    fi
  else
    fail ".agent/packages/$pkg/.agent.md is missing"
  fi
done

# ── aod_lint.py exists and is runnable ────────────────────────────────────────
echo ""
echo "-- AOD Lint Script"

AOD_LINT="$ROOT_DIR/scripts/aod_lint.py"
if [[ -f "$AOD_LINT" ]]; then
  pass "scripts/aod_lint.py exists"
else
  fail "scripts/aod_lint.py is missing"
fi

if [[ -x "$AOD_LINT" ]]; then
  pass "scripts/aod_lint.py is executable"
else
  fail "scripts/aod_lint.py is not executable (run: chmod +x scripts/aod_lint.py)"
fi

# ── 1:1 ratio check via aod_lint.py ──────────────────────────────────────────
echo ""
echo "-- 1:1 Production Module to AOD File Ratio"

if [[ -f "$AOD_LINT" ]]; then
  RATIO_OUTPUT=$(python3 "$AOD_LINT" --root "$ROOT_DIR" --verbose 2>&1)
  RATIO_EXIT=$?

  if [[ "$RATIO_EXIT" -eq 0 ]]; then
    pass "AOD 1:1 ratio maintained (all production modules have documentation)"
  else
    fail "AOD 1:1 ratio violation detected"
    echo ""
    echo "$RATIO_OUTPUT" | sed 's/^/    /'
    echo ""
  fi
else
  fail "Cannot check ratio: scripts/aod_lint.py is missing"
fi

# ── AOD policy documentation ──────────────────────────────────────────────────
echo ""
echo "-- AOD Policy Documentation"

AOD_POLICY="$ROOT_DIR/docs/infrastructure/aod_policy.md"
if [[ -f "$AOD_POLICY" ]]; then
  pass "docs/infrastructure/aod_policy.md exists"
else
  fail "docs/infrastructure/aod_policy.md is missing"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
