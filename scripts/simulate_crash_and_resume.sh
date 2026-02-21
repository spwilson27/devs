#!/usr/bin/env bash
# scripts/simulate_crash_and_resume.sh
#
# Automated crash-and-resume verification script.
#
# This script performs an end-to-end validation of the RecoveryManager crash
# recovery engine:
#
#   1. Runs a synthetic devs task via a small TypeScript driver that:
#      a. Creates a LangGraph OrchestrationGraph backed by SqliteSaver.
#      b. Invokes the graph up to the first HITL gate (approveDesign).
#      c. Records the projectId and the latest checkpoint_id to stdout.
#   2. Force-kills the Node.js process after 5 seconds using SIGKILL.
#   3. Opens a fresh DB connection and uses RecoveryManager to:
#      a. Verify the checkpoint exists.
#      b. Resume the graph from the exact checkpoint.
#      c. Compare the checkpoint_id before and after resume.
#   4. Reports PASS/FAIL for each verification step.
#
# Exit codes:
#   0 — all checks passed
#   1 — one or more checks failed
#
# Usage:
#   bash scripts/simulate_crash_and_resume.sh
#
# Requirements:
#   - Node.js >= 22 and pnpm installed
#   - `pnpm install` must have been run at the repo root
#   - `tsx` must be available (installed as a root devDependency)
#
# Note: This script creates a temporary SQLite database in /tmp and cleans it up.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="${REPO_ROOT}/scripts"
TMP_DIR="$(mktemp -d "/tmp/devs-crash-resume-XXXXXX")"
DB_PATH="${TMP_DIR}/state.sqlite"
PROJECT_ID_FILE="${TMP_DIR}/project_id.txt"
CHECKPOINT_BEFORE_FILE="${TMP_DIR}/checkpoint_before.txt"
CHECKPOINT_AFTER_FILE="${TMP_DIR}/checkpoint_after.txt"
PASS_COUNT=0
FAIL_COUNT=0

# ANSI colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

pass() { echo -e "${GREEN}✓ PASS${NC} $1"; ((PASS_COUNT++)); }
fail() { echo -e "${RED}✗ FAIL${NC} $1"; ((FAIL_COUNT++)); }
info() { echo -e "${YELLOW}→${NC} $1"; }

# ── Cleanup ───────────────────────────────────────────────────────────────────
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

echo "================================================================"
echo " devs Crash Recovery Engine — Simulation Script"
echo "================================================================"
echo " DB path:  ${DB_PATH}"
echo ""

# ── Phase 1: Run a graph task and simulate SIGKILL ─────────────────────────────

info "Phase 1: Starting graph run (will be killed after 5s)"

# The run-task driver writes two lines to stdout:
#   PROJECT_ID=<uuid>
#   CHECKPOINT_ID_BEFORE=<uuid>
# It then sleeps indefinitely so we can SIGKILL it.

RUN_DRIVER="${SCRIPT_DIR}/_crash_resume_run_driver.ts"
cat > "${RUN_DRIVER}" << 'TSEOF'
/**
 * scripts/_crash_resume_run_driver.ts
 *
 * Internal driver used by simulate_crash_and_resume.sh.
 * Runs the OrchestrationGraph until it suspends at the approveDesign HITL gate,
 * prints the projectId and latest checkpoint_id, then sleeps to simulate a
 * long-running process that can be SIGKILL'd.
 */
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { OrchestrationGraph } from "../packages/core/src/orchestration/graph.js";
import { SqliteSaver } from "../packages/core/src/orchestration/SqliteSaver.js";
import { RecoveryManager } from "../packages/core/src/recovery/RecoveryManager.js";
import { createInitialState } from "../packages/core/src/orchestration/types.js";

const dbPath = process.argv[2] ?? ".devs/state.sqlite";
const projectId = randomUUID();

// Open the DB.
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

const saver = new SqliteSaver(db);
const manager = new RecoveryManager(db);

const config = {
  projectId,
  name: "Crash-Resume Simulation",
  description: "Simulated devs project for crash recovery testing",
  status: "initializing" as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const og = new OrchestrationGraph(saver);
const runConfig = OrchestrationGraph.configForProject(projectId);

// Run to the first HITL gate (approveDesign).
await og.graph.invoke(createInitialState(config), runConfig);

// Record the checkpoint for comparison after resume.
const info = await manager.getLatestCheckpoint(projectId);
if (!info) throw new Error("No checkpoint found after run");

// Write project metadata to stdout for the shell script to parse.
console.log(`PROJECT_ID=${projectId}`);
console.log(`CHECKPOINT_ID_BEFORE=${info.checkpointId}`);
console.log(`CHECKPOINT_COUNT_BEFORE=${manager.getCheckpointCount(projectId)}`);

// Flush stdout and then sleep — the shell script will SIGKILL this process.
await new Promise(() => setTimeout(() => {}, 300_000)); // 5 minutes
TSEOF

# Run the driver in the background and capture its output via a temp file.
# The driver writes its checkpoint metadata to stdout, then sleeps indefinitely
# so we can SIGKILL it after collecting what we need.
DRIVER_OUTPUT_FILE="${TMP_DIR}/driver_output.txt"

"${REPO_ROOT}/node_modules/.bin/tsx" "${RUN_DRIVER}" "${DB_PATH}" > "${DRIVER_OUTPUT_FILE}" 2>&1 &
DRIVER_PID=$!

# Wait for the driver to write its output (up to 30 seconds).
info "Waiting for graph to commit checkpoints..."
for i in $(seq 1 30); do
  if grep -q "CHECKPOINT_ID_BEFORE=" "${DRIVER_OUTPUT_FILE}" 2>/dev/null; then
    break
  fi
  sleep 1
done

# Check the driver produced its output.
if ! grep -q "PROJECT_ID=" "${DRIVER_OUTPUT_FILE}" 2>/dev/null; then
  fail "Graph driver did not output PROJECT_ID — run may have failed"
  echo "Driver output:"
  cat "${DRIVER_OUTPUT_FILE}" 2>/dev/null || true
  exit 1
fi

pass "Graph committed checkpoints before kill"

# Extract values from driver output.
PROJECT_ID=$(grep "PROJECT_ID=" "${DRIVER_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
CHECKPOINT_BEFORE=$(grep "CHECKPOINT_ID_BEFORE=" "${DRIVER_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
COUNT_BEFORE=$(grep "CHECKPOINT_COUNT_BEFORE=" "${DRIVER_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')

info "Simulating SIGKILL on PID ${DRIVER_PID}"
kill -9 "${DRIVER_PID}" 2>/dev/null || true
wait "${DRIVER_PID}" 2>/dev/null || true

pass "Process killed with SIGKILL (simulated crash)"
info "Project ID:          ${PROJECT_ID}"
info "Checkpoint before:   ${CHECKPOINT_BEFORE}"
info "Checkpoint count:    ${COUNT_BEFORE}"

# ── Phase 2: Verify checkpoints survived the crash ────────────────────────────

echo ""
info "Phase 2: Verifying checkpoint survival after crash"

VERIFY_DRIVER="${SCRIPT_DIR}/_crash_resume_verify_driver.ts"
cat > "${VERIFY_DRIVER}" << TSEOF
/**
 * scripts/_crash_resume_verify_driver.ts
 *
 * Verifies checkpoint state after crash and resumes the graph.
 */
import Database from "better-sqlite3";
import { OrchestrationGraph } from "../packages/core/src/orchestration/graph.js";
import { SqliteSaver } from "../packages/core/src/orchestration/SqliteSaver.js";
import { RecoveryManager } from "../packages/core/src/recovery/RecoveryManager.js";
import { Command } from "@langchain/langgraph";

const dbPath = process.argv[2] ?? ".devs/state.sqlite";
const projectId = process.argv[3] ?? "";
const checkpointBefore = process.argv[4] ?? "";

// Open a FRESH connection — simulates a new process after crash.
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

const manager = new RecoveryManager(db);

// Check 1: hasCheckpoint returns true.
const hasCp = await manager.hasCheckpoint(projectId);
console.log(\`HAS_CHECKPOINT=\${hasCp}\`);

// Check 2: getLatestCheckpoint returns the same checkpoint_id.
const info = await manager.getLatestCheckpoint(projectId);
const checkpointAfter = info?.checkpointId ?? "";
console.log(\`CHECKPOINT_AFTER=\${checkpointAfter}\`);
console.log(\`CHECKPOINT_MATCH=\${checkpointAfter === checkpointBefore}\`);

// Check 3: checkpoint count is preserved.
const countAfter = manager.getCheckpointCount(projectId);
console.log(\`CHECKPOINT_COUNT_AFTER=\${countAfter}\`);

// Check 4: resume the graph.
const recoveryConfig = await manager.recoverProject(projectId);
if (!recoveryConfig) {
  console.log("RESUME_SUCCESS=false");
  console.log("RESUME_ERROR=recoverProject returned undefined");
  process.exit(1);
}

const saver = new SqliteSaver(db);
const og = new OrchestrationGraph(saver);

const approvalSignal = {
  approved: true,
  approvedBy: "crash-resume-script",
  approvedAt: new Date().toISOString(),
};

try {
  const result = await og.graph.invoke(
    new Command({ resume: approvalSignal }),
    OrchestrationGraph.configForProject(projectId),
  );
  const countFinal = manager.getCheckpointCount(projectId);
  console.log(\`RESUME_SUCCESS=true\`);
  console.log(\`CHECKPOINT_COUNT_FINAL=\${countFinal}\`);
  console.log(\`RESULT_DEFINED=\${result !== undefined && result !== null}\`);
} catch (err) {
  console.log(\`RESUME_SUCCESS=false\`);
  console.log(\`RESUME_ERROR=\${String(err)}\`);
  process.exit(1);
}

db.close();
TSEOF

VERIFY_OUTPUT_FILE="${TMP_DIR}/verify_output.txt"
"${REPO_ROOT}/node_modules/.bin/tsx" "${VERIFY_DRIVER}" "${DB_PATH}" "${PROJECT_ID}" "${CHECKPOINT_BEFORE}" > "${VERIFY_OUTPUT_FILE}" 2>&1
VERIFY_EXIT=$?

if [ "${VERIFY_EXIT}" -ne 0 ]; then
  fail "Verify driver exited with code ${VERIFY_EXIT}"
  echo "Verify output:"
  cat "${VERIFY_OUTPUT_FILE}" || true
  exit 1
fi

HAS_CHECKPOINT=$(grep "HAS_CHECKPOINT=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
CHECKPOINT_AFTER=$(grep "CHECKPOINT_AFTER=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
CHECKPOINT_MATCH=$(grep "CHECKPOINT_MATCH=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
COUNT_AFTER=$(grep "CHECKPOINT_COUNT_AFTER=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
RESUME_SUCCESS=$(grep "RESUME_SUCCESS=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]')
COUNT_FINAL=$(grep "CHECKPOINT_COUNT_FINAL=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]' || echo "0")
RESULT_DEFINED=$(grep "RESULT_DEFINED=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2 | tr -d '[:space:]' || echo "false")

# ── Check: hasCheckpoint ──────────────────────────────────────────────────────
if [ "${HAS_CHECKPOINT}" = "true" ]; then
  pass "hasCheckpoint(projectId) returns true after crash"
else
  fail "hasCheckpoint(projectId) returned '${HAS_CHECKPOINT}' — expected 'true'"
fi

# ── Check: checkpoint_id matches ─────────────────────────────────────────────
if [ "${CHECKPOINT_MATCH}" = "true" ]; then
  pass "checkpoint_id is identical before and after crash (zero data loss)"
  info "  Before: ${CHECKPOINT_BEFORE}"
  info "  After:  ${CHECKPOINT_AFTER}"
else
  fail "checkpoint_id mismatch after crash"
  info "  Before: ${CHECKPOINT_BEFORE}"
  info "  After:  ${CHECKPOINT_AFTER}"
fi

# ── Check: checkpoint count preserved ────────────────────────────────────────
if [ "${COUNT_AFTER}" = "${COUNT_BEFORE}" ]; then
  pass "Checkpoint count preserved after crash (${COUNT_BEFORE} → ${COUNT_AFTER})"
else
  fail "Checkpoint count changed after crash (before=${COUNT_BEFORE}, after=${COUNT_AFTER})"
fi

# ── Check: resume succeeded ───────────────────────────────────────────────────
if [ "${RESUME_SUCCESS}" = "true" ]; then
  pass "Graph resumed successfully from checkpoint after crash"
else
  RESUME_ERROR=$(grep "RESUME_ERROR=" "${VERIFY_OUTPUT_FILE}" | cut -d= -f2-)
  fail "Graph resume failed: ${RESUME_ERROR}"
fi

# ── Check: new checkpoints written during resume ──────────────────────────────
if [ -n "${COUNT_FINAL}" ] && [ "${COUNT_FINAL}" -gt "${COUNT_BEFORE}" ] 2>/dev/null; then
  pass "New checkpoints written during resumed run (${COUNT_BEFORE} → ${COUNT_FINAL})"
else
  fail "No new checkpoints written during resumed run (before=${COUNT_BEFORE}, final=${COUNT_FINAL})"
fi

# ── Check: result is defined ─────────────────────────────────────────────────
if [ "${RESULT_DEFINED}" = "true" ]; then
  pass "Resume returned a valid (non-null) state object"
else
  fail "Resume returned null/undefined state"
fi

# ── Cleanup temp drivers ──────────────────────────────────────────────────────
rm -f "${RUN_DRIVER}" "${VERIFY_DRIVER}"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "================================================================"
echo " Summary: ${PASS_COUNT} passed, ${FAIL_COUNT} failed"
echo "================================================================"

if [ "${FAIL_COUNT}" -gt 0 ]; then
  exit 1
fi

exit 0
