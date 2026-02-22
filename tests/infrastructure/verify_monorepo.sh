#!/usr/bin/env bash
# tests/infrastructure/verify_monorepo.sh
# Verifies the pnpm monorepo structure and environment requirements.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== Monorepo Infrastructure Verification ==="
echo ""

# ── Node.js version check ────────────────────────────────────────────────────
echo "-- Node.js Environment"

NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' || echo "")
if [[ -z "$NODE_VERSION" ]]; then
  fail "Node.js is not installed"
else
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [[ "$NODE_MAJOR" -ge 22 ]]; then
    pass "Node.js version is $NODE_VERSION (>= 22.x required)"
  else
    fail "Node.js version is $NODE_VERSION — expected >= 22.x (LTS)"
  fi
fi

NVMRC="$ROOT_DIR/.nvmrc"
if [[ -f "$NVMRC" ]]; then
  NVMRC_CONTENT=$(tr -d '[:space:]' < "$NVMRC")
  if [[ "$NVMRC_CONTENT" == "22" ]]; then
    pass ".nvmrc specifies Node.js 22"
  else
    fail ".nvmrc specifies '$NVMRC_CONTENT' — expected '22'"
  fi
else
  fail ".nvmrc does not exist"
fi

# ── pnpm version check ───────────────────────────────────────────────────────
echo ""
echo "-- pnpm Package Manager"

PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "")
if [[ -z "$PNPM_VERSION" ]]; then
  fail "pnpm is not installed"
else
  PNPM_MAJOR=$(echo "$PNPM_VERSION" | cut -d. -f1)
  if [[ "$PNPM_MAJOR" -ge 9 ]]; then
    pass "pnpm version is $PNPM_VERSION (>= 9.x required)"
  else
    fail "pnpm version is $PNPM_VERSION — expected >= 9.x"
  fi
fi

# ── .npmrc check ─────────────────────────────────────────────────────────────
NPMRC="$ROOT_DIR/.npmrc"
if [[ -f "$NPMRC" ]]; then
  if grep -q "shamefully-hoist=false" "$NPMRC"; then
    pass ".npmrc exists with shamefully-hoist=false"
  else
    fail ".npmrc exists but is missing shamefully-hoist=false"
  fi
else
  fail ".npmrc does not exist"
fi

# ── Root package.json check ──────────────────────────────────────────────────
echo ""
echo "-- Root package.json"

ROOT_PKG="$ROOT_DIR/package.json"
if [[ -f "$ROOT_PKG" ]]; then
  pass "Root package.json exists"

  if node -e "const p=require('$ROOT_PKG'); process.exit(p.private === true ? 0 : 1)" 2>/dev/null; then
    pass "Root package.json has private: true"
  else
    fail "Root package.json is missing private: true"
  fi

  if node -e "const p=require('$ROOT_PKG'); process.exit(p.engines && p.engines.node ? 0 : 1)" 2>/dev/null; then
    pass "Root package.json has engines.node set"
  else
    fail "Root package.json is missing engines.node"
  fi
else
  fail "Root package.json does not exist"
fi

# ── pnpm-workspace.yaml check ────────────────────────────────────────────────
echo ""
echo "-- pnpm-workspace.yaml"

WORKSPACE="$ROOT_DIR/pnpm-workspace.yaml"
REQUIRED_PKGS=(core agents sandbox memory mcp cli vscode secret-masker)

if [[ -f "$WORKSPACE" ]]; then
  pass "pnpm-workspace.yaml exists"

  for pkg in "${REQUIRED_PKGS[@]}"; do
    if grep -q "packages/$pkg" "$WORKSPACE"; then
      pass "pnpm-workspace.yaml defines packages/$pkg"
    else
      fail "pnpm-workspace.yaml is missing packages/$pkg"
    fi
  done
else
  fail "pnpm-workspace.yaml does not exist"
fi

# ── Package directories check ────────────────────────────────────────────────
echo ""
echo "-- Package Directories"

for pkg in "${REQUIRED_PKGS[@]}"; do
  PKG_DIR="$ROOT_DIR/packages/$pkg"
  PKG_JSON="$PKG_DIR/package.json"

  if [[ -d "$PKG_DIR" ]]; then
    pass "packages/$pkg directory exists"
  else
    fail "packages/$pkg directory is missing"
    continue
  fi

  if [[ -f "$PKG_JSON" ]]; then
    EXPECTED_NAME="@devs/$pkg"
    ACTUAL_NAME=$(node -e "console.log(require('$PKG_JSON').name)" 2>/dev/null || echo "")
    if [[ "$ACTUAL_NAME" == "$EXPECTED_NAME" ]]; then
      pass "packages/$pkg/package.json has name '$EXPECTED_NAME'"
    else
      fail "packages/$pkg/package.json name is '$ACTUAL_NAME' — expected '$EXPECTED_NAME'"
    fi
  else
    fail "packages/$pkg/package.json is missing"
  fi
done

# ── Module separation check ──────────────────────────────────────────────────
echo ""
echo "-- Module Separation (TAS-096)"

CORE_PKG="$ROOT_DIR/packages/core/package.json"
SANDBOX_PKG="$ROOT_DIR/packages/sandbox/package.json"

if [[ -f "$CORE_PKG" && -f "$SANDBOX_PKG" ]]; then
  # Ensure core does not list sandbox as a dependency
  if node -e "
    const core = require('$CORE_PKG');
    const deps = Object.keys({...core.dependencies, ...core.devDependencies, ...core.peerDependencies});
    process.exit(deps.includes('@devs/sandbox') ? 1 : 0);
  " 2>/dev/null; then
    pass "core does not depend on sandbox (no logic leakage)"
  else
    fail "core depends on sandbox — violates TAS-096 module separation"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
