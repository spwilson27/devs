# Task: Phase 1 Completion Gate Verification (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [ROAD-P2-DEP-001]: Phase 1 must be complete (all infrastructure crates at 90% unit coverage).

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — must be at 90% coverage), devs-config (consumer — must be at 90% coverage), devs-checkpoint (consumer — must be at 90% coverage), devs-adapters (consumer — must be at 90% coverage), devs-pool (consumer — must be at 90% coverage), devs-executor (consumer — must be at 90% coverage), ./do Entrypoint Script & CI Pipeline (consumer — runs coverage verification)]

## 1. Initial Test Written
- [ ] Write a shell-level verification script `scripts/verify_phase1_gate.sh` that:
  - Runs `./do coverage` and captures the output.
  - Parses `target/coverage/report.json` for per-crate coverage percentages.
  - Asserts each Phase 1 crate (`devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`) has ≥ 90% unit test line coverage.
  - Asserts Phase 1 PTC (Phase Transition Checkpoint) ADR exists at `docs/adr/NNNN-phase-1-complete.md`.
  - Exits non-zero with a clear error message identifying which crate(s) are below threshold if any fail.

## 2. Task Implementation
- [ ] Implement `scripts/verify_phase1_gate.sh` as a POSIX sh script.
- [ ] Parse `target/coverage/report.json` using `jq` to extract per-crate coverage:
  ```sh
  for crate in devs-core devs-config devs-checkpoint devs-adapters devs-pool devs-executor; do
    coverage=$(jq -r ".\"$crate\".line_coverage" target/coverage/report.json)
    # Compare coverage >= 90.0
  done
  ```
- [ ] Verify the Phase 1 PTC file exists and contains valid JSON with `"phase_id": "phase-1"` and all `gate_conditions` having `"verified": true`.
- [ ] Verify `target/traceability.json` contains a `phase_gates` entry for Phase 1 with `"passed": true`.
- [ ] Add this gate check as the FIRST step in any Phase 2 task execution — if it fails, no Phase 2 work should proceed.
- [ ] Add `// Covers: ROAD-P2-DEP-001` annotation in the script header comment.

## 3. Code Review
- [ ] Verify the script is POSIX sh compatible (no bashisms).
- [ ] Verify the 90% threshold matches `[QG-001]` from the shared components manifest.
- [ ] Verify the script fails loudly and clearly on any gate violation.

## 4. Run Automated Tests to Verify
- [ ] Run `./scripts/verify_phase1_gate.sh` and verify it exits 0 (all Phase 1 crates at 90%+).
- [ ] If any crate is below threshold, the script must print `FAIL: <crate> coverage is <X>%, required 90%` and exit 1.

## 5. Update Documentation
- [ ] Add a comment at the top of the script explaining its purpose and when it should be run.

## 6. Automated Verification
- [ ] Run `./scripts/verify_phase1_gate.sh && echo "GATE PASSED" || echo "GATE FAILED"` and confirm output is "GATE PASSED".
- [ ] Verify the script is executable (`chmod +x`).
