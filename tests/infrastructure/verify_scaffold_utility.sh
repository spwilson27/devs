#!/usr/bin/env bash
# tests/infrastructure/verify_scaffold_utility.sh
# Verifies the devs project scaffolding utility creates a correct project
# structure per TAS-040 and TAS-104.
#
# Requirement: [1_PRD-REQ-NEED-MAKER-01] Instant Project Scaffolding

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCAFFOLD_SCRIPT="$ROOT_DIR/scripts/scaffold_project.py"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== Scaffolding Utility Verification ==="
echo ""

# ── Scaffold script exists ─────────────────────────────────────────────────────
echo "-- Scaffolding Script"

if [[ -f "$SCAFFOLD_SCRIPT" ]]; then
  pass "scripts/scaffold_project.py exists"
else
  fail "scripts/scaffold_project.py is missing"
  echo ""
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi

# ── Create a temp project via the scaffold command ─────────────────────────────
echo ""
echo "-- Scaffold Command Execution"

TMPDIR_BASE="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_BASE"' EXIT

PROJECT_NAME="my-project"
PROJECT_PATH="$TMPDIR_BASE/$PROJECT_NAME"

if python3 "$SCAFFOLD_SCRIPT" init-project "$PROJECT_PATH" >/dev/null 2>&1; then
  pass "scaffold command (init-project) exited successfully"
else
  fail "scaffold command (init-project) failed — check scripts/scaffold_project.py"
  echo ""
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi

# ── Required top-level directories (TAS-104) ──────────────────────────────────
echo ""
echo "-- Required Top-Level Directories (TAS-104)"

REQUIRED_DIRS=(
  ".devs"
  ".agent"
  "mcp-server"
  "src"
  "tests"
  "docs"
  "scripts"
  ".github"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ -d "$PROJECT_PATH/$dir" ]]; then
    pass "$dir/ exists"
  else
    fail "$dir/ is missing"
  fi
done

# ── Required root-level files (TAS-104) ───────────────────────────────────────
echo ""
echo "-- Required Root-Level Files (TAS-104)"

REQUIRED_FILES=(
  ".gitignore"
  ".env.example"
  "README.md"
  "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$PROJECT_PATH/$file" ]]; then
    pass "$file exists"
  else
    fail "$file is missing"
  fi
done

# ── package.json devs metadata (TAS-076) ─────────────────────────────────────
echo ""
echo "-- package.json devs Metadata (TAS-076)"

PKG_JSON="$PROJECT_PATH/package.json"

if node -e "
  const p = require('$PKG_JSON');
  process.exit(p.devs !== undefined ? 0 : 1);
" 2>/dev/null; then
  pass "package.json has 'devs' metadata section"
else
  fail "package.json is missing 'devs' metadata section"
fi

if node -e "
  const p = require('$PKG_JSON');
  process.exit(p.devs && typeof p.devs.project_id === 'string' ? 0 : 1);
" 2>/dev/null; then
  pass "package.json devs.project_id is set"
else
  fail "package.json devs.project_id is missing or not a string"
fi

if node -e "
  const p = require('$PKG_JSON');
  process.exit(p.devs && typeof p.devs.version === 'string' ? 0 : 1);
" 2>/dev/null; then
  pass "package.json devs.version is set"
else
  fail "package.json devs.version is missing or not a string"
fi

if node -e "
  const p = require('$PKG_JSON');
  process.exit(p.devs && typeof p.devs.generated_by === 'string' ? 0 : 1);
" 2>/dev/null; then
  pass "package.json devs.generated_by is set"
else
  fail "package.json devs.generated_by is missing or not a string"
fi

# ── Agent-Oriented Documentation (AOD) structure (TAS-042) ───────────────────
echo ""
echo "-- Agent-Oriented Documentation (AOD) Structure (TAS-042)"

if [[ -f "$PROJECT_PATH/.agent/index.agent.md" ]]; then
  pass ".agent/index.agent.md exists (AOD entry point)"
else
  fail ".agent/index.agent.md is missing"
fi

if [[ -f "$PROJECT_PATH/.agent/catalog.json" ]]; then
  pass ".agent/catalog.json exists (machine-readable module map)"
else
  fail ".agent/catalog.json is missing"
fi

if [[ -d "$PROJECT_PATH/.agent/modules" ]]; then
  pass ".agent/modules/ directory exists"
else
  fail ".agent/modules/ directory is missing"
fi

# Verify catalog.json is valid JSON with required fields
if node -e "
  const c = require('$PROJECT_PATH/.agent/catalog.json');
  const ok = typeof c.version === 'string' &&
             typeof c.project === 'string' &&
             Array.isArray(c.modules);
  process.exit(ok ? 0 : 1);
" 2>/dev/null; then
  pass ".agent/catalog.json is valid JSON with required fields"
else
  fail ".agent/catalog.json is invalid or missing required fields (version, project, modules)"
fi

# ── Flight Recorder (.devs/) initialization (TAS-061) ────────────────────────
echo ""
echo "-- Flight Recorder Initialization (TAS-061)"

if [[ -f "$PROJECT_PATH/.devs/.gitignore" ]]; then
  pass ".devs/.gitignore exists (runtime state excluded from VCS)"
else
  fail ".devs/.gitignore is missing"
fi

if [[ -f "$PROJECT_PATH/.devs/POLICY.md" ]]; then
  pass ".devs/POLICY.md exists (Developer Agent write-access policy)"
else
  fail ".devs/POLICY.md is missing"
fi

# .devs/.gitignore should exclude sqlite files
if [[ -f "$PROJECT_PATH/.devs/.gitignore" ]]; then
  if grep -qE "state\.sqlite|\*\.sqlite" "$PROJECT_PATH/.devs/.gitignore"; then
    pass ".devs/.gitignore excludes sqlite files"
  else
    fail ".devs/.gitignore does not exclude sqlite files"
  fi
fi

# ── Idempotency: scaffold should refuse non-empty target ──────────────────────
echo ""
echo "-- Scaffolding Idempotency / Safety"

if python3 "$SCAFFOLD_SCRIPT" init-project "$PROJECT_PATH" >/dev/null 2>&1; then
  fail "scaffold did NOT reject an already-populated target directory"
else
  pass "scaffold correctly rejects non-empty target directory"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
