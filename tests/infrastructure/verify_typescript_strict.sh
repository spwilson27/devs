#!/usr/bin/env bash
# tests/infrastructure/verify_typescript_strict.sh
# Verifies TypeScript strict configuration across the monorepo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== TypeScript Strict Configuration Verification ==="
echo ""

# ── TypeScript version check ─────────────────────────────────────────────────
echo "-- TypeScript Version"

TSC_RAW=$(pnpm exec tsc --version 2>&1 || echo "")
TSC_VERSION=$(echo "$TSC_RAW" | grep "^Version " | sed 's/Version //' || echo "")
if [[ -z "$TSC_VERSION" ]]; then
  fail "TypeScript (tsc) is not installed — run: pnpm add -D typescript -w"
else
  pass "tsc is available (version $TSC_VERSION)"

  # Require >= 5.4
  MIN_VERSION="5.4.0"
  LOWER=$(printf "%s\n%s\n" "$MIN_VERSION" "$TSC_VERSION" | sort -V | head -n1)
  if [[ "$LOWER" == "$MIN_VERSION" ]]; then
    pass "tsc version $TSC_VERSION >= $MIN_VERSION"
  else
    fail "tsc version $TSC_VERSION is less than required $MIN_VERSION"
  fi
fi

# ── Root tsconfig.json ───────────────────────────────────────────────────────
echo ""
echo "-- Root tsconfig.json"

ROOT_TSCONFIG="$ROOT_DIR/tsconfig.json"
if [[ ! -f "$ROOT_TSCONFIG" ]]; then
  fail "Root tsconfig.json does not exist"
else
  pass "Root tsconfig.json exists"

  # strict: true
  if node -e "
    const fs = require('fs');
    const c = JSON.parse(fs.readFileSync('$ROOT_TSCONFIG', 'utf8'));
    process.exit(c.compilerOptions && c.compilerOptions.strict === true ? 0 : 1);
  " 2>/dev/null; then
    pass "Root tsconfig.json has compilerOptions.strict: true"
  else
    fail "Root tsconfig.json is missing compilerOptions.strict: true"
  fi

  # strictNullChecks must not be explicitly disabled (enabled via strict: true)
  if node -e "
    const fs = require('fs');
    const c = JSON.parse(fs.readFileSync('$ROOT_TSCONFIG', 'utf8'));
    process.exit(c.compilerOptions && c.compilerOptions.strictNullChecks === false ? 1 : 0);
  " 2>/dev/null; then
    pass "strictNullChecks is enabled (via strict: true, not overridden)"
  else
    fail "Root tsconfig.json explicitly sets strictNullChecks: false — disables strict mode"
  fi

  # noImplicitAny must not be explicitly disabled (enabled via strict: true)
  if node -e "
    const fs = require('fs');
    const c = JSON.parse(fs.readFileSync('$ROOT_TSCONFIG', 'utf8'));
    process.exit(c.compilerOptions && c.compilerOptions.noImplicitAny === false ? 1 : 0);
  " 2>/dev/null; then
    pass "noImplicitAny is enabled (via strict: true, not overridden)"
  else
    fail "Root tsconfig.json explicitly sets noImplicitAny: false — disables strict mode"
  fi
fi

# ── Per-package tsconfig.json files ─────────────────────────────────────────
echo ""
echo "-- Package tsconfig.json files"

PACKAGES=(core agents sandbox memory mcp cli vscode)

for pkg in "${PACKAGES[@]}"; do
  PKG_TSCONFIG="$ROOT_DIR/packages/$pkg/tsconfig.json"

  if [[ ! -f "$PKG_TSCONFIG" ]]; then
    fail "packages/$pkg/tsconfig.json does not exist"
    continue
  fi

  pass "packages/$pkg/tsconfig.json exists"

  # Must extend the root config
  EXTENDS=$(node -e "
    const fs = require('fs');
    const c = JSON.parse(fs.readFileSync('$PKG_TSCONFIG', 'utf8'));
    console.log(c.extends || '');
  " 2>/dev/null || echo "")
  if [[ "$EXTENDS" == "../../tsconfig.json" ]]; then
    pass "packages/$pkg/tsconfig.json extends ../../tsconfig.json"
  else
    fail "packages/$pkg/tsconfig.json extends '$EXTENDS' — expected '../../tsconfig.json'"
  fi

  # Must not override strict: false (weakening)
  if node -e "
    const fs = require('fs');
    const c = JSON.parse(fs.readFileSync('$PKG_TSCONFIG', 'utf8'));
    process.exit(c.compilerOptions && c.compilerOptions.strict === false ? 1 : 0);
  " 2>/dev/null; then
    pass "packages/$pkg/tsconfig.json does not weaken strict mode"
  else
    fail "packages/$pkg/tsconfig.json sets strict: false — forbidden override"
  fi
done

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
