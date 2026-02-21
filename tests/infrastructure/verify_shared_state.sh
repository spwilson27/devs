#!/usr/bin/env bash
# tests/infrastructure/verify_shared_state.sh
# Verifies the shared state manifest: devs metadata in package.json,
# STATE_FILE_PATH constant in @devs/core, and shared access from cli/vscode.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== Shared State Manifest Verification ==="
echo ""

# ── Root package.json devs metadata ──────────────────────────────────────────
echo "-- Root package.json Metadata (TAS-076, 1_PRD-REQ-INT-013)"

ROOT_PKG="$ROOT_DIR/package.json"

if [[ ! -f "$ROOT_PKG" ]]; then
  fail "Root package.json does not exist"
else
  pass "Root package.json exists"

  # Check devs field exists
  if node -e "
    const p = require('$ROOT_PKG');
    process.exit(p.devs !== undefined ? 0 : 1);
  " 2>/dev/null; then
    pass "Root package.json has 'devs' metadata field"
  else
    fail "Root package.json is missing 'devs' metadata field"
  fi

  # Check devs.version field
  if node -e "
    const p = require('$ROOT_PKG');
    process.exit(p.devs && typeof p.devs.version === 'string' ? 0 : 1);
  " 2>/dev/null; then
    pass "Root package.json devs.version is set"
  else
    fail "Root package.json devs.version is missing or not a string"
  fi

  # Check devs.status field
  if node -e "
    const p = require('$ROOT_PKG');
    process.exit(p.devs && typeof p.devs.status === 'string' ? 0 : 1);
  " 2>/dev/null; then
    pass "Root package.json devs.status is set"
  else
    fail "Root package.json devs.status is missing or not a string"
  fi

  # Check devs.architecture field
  if node -e "
    const p = require('$ROOT_PKG');
    process.exit(p.devs && typeof p.devs.architecture === 'string' ? 0 : 1);
  " 2>/dev/null; then
    pass "Root package.json devs.architecture is set"
  else
    fail "Root package.json devs.architecture is missing or not a string"
  fi

  # Check devs.architecture value is "monorepo"
  if node -e "
    const p = require('$ROOT_PKG');
    process.exit(p.devs && p.devs.architecture === 'monorepo' ? 0 : 1);
  " 2>/dev/null; then
    pass "Root package.json devs.architecture === 'monorepo'"
  else
    fail "Root package.json devs.architecture is not 'monorepo'"
  fi
fi

# ── @devs/core constants: STATE_FILE_PATH ────────────────────────────────────
echo ""
echo "-- @devs/core Constants (STATE_FILE_PATH)"

CORE_CONSTANTS="$ROOT_DIR/packages/core/src/constants.ts"

if [[ -f "$CORE_CONSTANTS" ]]; then
  pass "packages/core/src/constants.ts exists"

  if grep -q "STATE_FILE_PATH" "$CORE_CONSTANTS"; then
    pass "constants.ts defines STATE_FILE_PATH"
  else
    fail "constants.ts is missing STATE_FILE_PATH"
  fi

  if grep -q '\.devs/state\.sqlite' "$CORE_CONSTANTS"; then
    pass "STATE_FILE_PATH references '.devs/state.sqlite'"
  else
    fail "STATE_FILE_PATH does not reference '.devs/state.sqlite'"
  fi

  if grep -q "export" "$CORE_CONSTANTS"; then
    pass "constants.ts exports its definitions"
  else
    fail "constants.ts does not export its definitions"
  fi
else
  fail "packages/core/src/constants.ts does not exist"
fi

# ── @devs/core persistence: state path resolver ──────────────────────────────
echo ""
echo "-- @devs/core Persistence Helper"

CORE_PERSISTENCE="$ROOT_DIR/packages/core/src/persistence.ts"

if [[ -f "$CORE_PERSISTENCE" ]]; then
  pass "packages/core/src/persistence.ts exists"

  if grep -q "resolveStatePath\|getStatePath\|stateFilePath" "$CORE_PERSISTENCE"; then
    pass "persistence.ts defines a state path resolver function"
  else
    fail "persistence.ts does not define a state path resolver function"
  fi

  if grep -q "export" "$CORE_PERSISTENCE"; then
    pass "persistence.ts exports its definitions"
  else
    fail "persistence.ts does not export its definitions"
  fi
else
  fail "packages/core/src/persistence.ts does not exist"
fi

# ── Shared state access: cli and vscode depend on @devs/core ─────────────────
echo ""
echo "-- Shared State Access via @devs/core Dependency"

CLI_PKG="$ROOT_DIR/packages/cli/package.json"
VSCODE_PKG="$ROOT_DIR/packages/vscode/package.json"

if [[ -f "$CLI_PKG" ]]; then
  if node -e "
    const p = require('$CLI_PKG');
    const deps = {...p.dependencies, ...p.devDependencies};
    process.exit(deps['@devs/core'] !== undefined ? 0 : 1);
  " 2>/dev/null; then
    pass "packages/cli depends on @devs/core (shared state access)"
  else
    fail "packages/cli does not depend on @devs/core"
  fi
else
  fail "packages/cli/package.json does not exist"
fi

if [[ -f "$VSCODE_PKG" ]]; then
  if node -e "
    const p = require('$VSCODE_PKG');
    const deps = {...p.dependencies, ...p.devDependencies};
    process.exit(deps['@devs/core'] !== undefined ? 0 : 1);
  " 2>/dev/null; then
    pass "packages/vscode depends on @devs/core (shared state access)"
  else
    fail "packages/vscode does not depend on @devs/core"
  fi
else
  fail "packages/vscode/package.json does not exist"
fi

# ── .devs/ directory present (shared state location) ─────────────────────────
echo ""
echo "-- .devs/ Shared State Directory"

DEVS_DIR="$ROOT_DIR/.devs"

if [[ -d "$DEVS_DIR" ]]; then
  pass ".devs/ directory exists (shared state location)"
else
  fail ".devs/ directory is missing"
fi

if [[ -f "$DEVS_DIR/.gitignore" ]]; then
  # *.sqlite wildcard covers state.sqlite; either explicit or wildcard is acceptable
  if grep -qE "state\.sqlite|\*\.sqlite" "$DEVS_DIR/.gitignore"; then
    pass ".devs/.gitignore excludes *.sqlite / state.sqlite from VCS"
  else
    fail ".devs/.gitignore does not exclude sqlite files (expected *.sqlite or state.sqlite)"
  fi
else
  fail ".devs/.gitignore does not exist"
fi

# ── State sharing documentation ───────────────────────────────────────────────
echo ""
echo "-- State Sharing Documentation"

STATE_DOC="$ROOT_DIR/docs/architecture/state_sharing.md"

if [[ -f "$STATE_DOC" ]]; then
  pass "docs/architecture/state_sharing.md exists"
else
  fail "docs/architecture/state_sharing.md is missing"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
