# Task: Implement Risk Matrix and Presubmit Timeout Business Rule Foundations (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [AC-ROAD-P5-006], [RISK-005-BR-003]

## Dependencies
- depends_on: ["10_presubmit_timing_timeout_and_lint_rules.md", "13_acceptance_criteria_traceability_and_phase3.md"]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model, ./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/risk_matrix_foundations.rs` that verify:
  **Risk Matrix Infrastructure (AC-ROAD-P5-006):**
  1. A risk matrix is defined with all critical risks from phase_0.md including RISK-005 (presubmit timeout) and RISK-009 (bootstrapping deadlock). Annotate `// Covers: AC-ROAD-P5-006`.
  2. Each risk entry has fields: `id`, `severity` (Low/Medium/High/Critical), `likelihood` (Low/Medium/High), `mitigation_strategy: String`, `verified: bool`. Annotate `// Covers: AC-ROAD-P5-006`.
  3. `target/traceability.json` includes `risk_matrix_violations` array — empty when all risks are mitigated, populated with unmitigated risk IDs otherwise. Annotate `// Covers: AC-ROAD-P5-006`.
  4. `./do lint` validates that each risk in the matrix has a corresponding mitigation strategy documented in phase_0.md. Annotate `// Covers: AC-ROAD-P5-006`.
  5. PTC files reference risk mitigations in `risk_mitigations_confirmed` field that must match risk IDs in the matrix. Annotate `// Covers: AC-ROAD-P5-006`.

  **Presubmit Timeout Business Rules (RISK-005-BR-003):**
  6. The 900-second hard timeout is enforced by a background timer process (not the `timeout` command) that kills the presubmit process group on expiry. Annotate `// Covers: RISK-005-BR-003`.
  7. The background timer process is properly cleaned up (killed) when presubmit completes normally before timeout. Annotate `// Covers: RISK-005-BR-003`.
  8. When the hard timeout fires, partial timing data in `target/presubmit_timings.jsonl` is preserved (incremental writes survive the kill). Annotate `// Covers: RISK-005-BR-003`.

## 2. Task Implementation
- [ ] Define `RiskEntry` struct in `crates/devs-core/src/risk_matrix.rs`:
  ```rust
  pub struct RiskEntry {
      pub id: String,
      pub severity: RiskSeverity,  // Low, Medium, High, Critical
      pub likelihood: RiskLikelihood,  // Low, Medium, High
      pub description: String,
      pub mitigation_strategy: String,
      pub verified: bool,
  }
  ```
- [ ] Create static `RISK_MATRIX` constant containing all risks from phase_0.md:
  - RISK-005: Presubmit timeout (Critical severity, Medium likelihood)
  - RISK-009: Bootstrapping deadlock (Critical severity, Medium likelihood)
  - Include all other risks documented in phase_0.md
- [ ] Implement `RiskMatrixReport` struct with fields: `risks: Vec<RiskEntry>`, `violations: Vec<String>`, `all_mitigated: bool`.
- [ ] Implement `RiskMatrix::validate_mitigations(&self, ptc: &PhaseTransitionCheckpoint) -> Result<(), Vec<RiskViolation>>` that verifies all risks referenced in PTC `risk_mitigations_confirmed` exist in the matrix and have `verified: true`.
- [ ] Enhance `./do test` to generate `risk_matrix_violations` array in `target/traceability.json`:
  - Load risk matrix from `crates/devs-core/src/risk_matrix.rs`.
  - Scan PTC files in `docs/adr/` for `risk_mitigations_confirmed` entries.
  - Identify risks without corresponding mitigation confirmation.
  - Output unmitigated risk IDs to `risk_matrix_violations` array.
- [ ] Implement the 900-second hard timeout in `./do presubmit`:
  - Spawn a background shell process that sleeps for 900 seconds then sends `kill -9` to the presubmit process group.
  - Store the background PID in a variable for cleanup.
  - On normal presubmit completion, kill the background timer process.
  - Do NOT use the `timeout` command (not POSIX-portable per ROAD-CONS-003).
- [ ] Ensure `./do presubmit` writes timing data incrementally:
  - After each step (format, lint, test, coverage, ci), immediately append a JSON line to `target/presubmit_timings.jsonl`.
  - Use `echo "$JSON_LINE" >> target/presubmit_timings.jsonl` for atomic appends.
  - Do NOT buffer timing writes — each step must survive a kill mid-presubmit.

## 3. Code Review
- [ ] Verify all 2 requirement IDs have `// Covers:` annotations in test code.
- [ ] Verify the risk matrix includes all critical risks from phase_0.md with correct severity and likelihood values.
- [ ] Verify the hard timeout implementation uses a background process, not the `timeout` command.
- [ ] Verify timing writes are truly incremental (one write per step, not buffered until the end).
- [ ] Verify `./do` script remains POSIX sh-compatible (no bash-specific features).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- risk_matrix_foundations` and confirm all tests pass.
- [ ] Run `./do presubmit` on the stub workspace and verify it completes within 900 seconds.
- [ ] Verify `target/presubmit_timings.jsonl` exists and contains valid JSONL with one entry per step.
- [ ] Run `./do test` and verify `target/traceability.json` contains `risk_matrix_violations` array.
- [ ] Run `./do lint` and confirm risk mitigation validation passes.

## 5. Update Documentation
- [ ] Add doc comments to `RiskEntry`, `RiskSeverity`, `RiskLikelihood`, and `RiskMatrixReport` structs.
- [ ] Add a `RISK_MATRIX.md` file in `docs/plan/` documenting all identified risks, their severity/likelihood, and mitigation strategies.
- [ ] Add comments in `./do` script explaining the hard timeout mechanism and cleanup process.

## 6. Automated Verification
- [ ] Run `python3 -c "import json; d=json.load(open('target/traceability.json')); assert 'risk_matrix_violations' in d"` to verify risk matrix violations array is present.
- [ ] Run `cat target/presubmit_timings.jsonl | python3 -c "import sys,json; lines=[json.loads(l) for l in sys.stdin]; assert all('step' in l and 'duration_s' in l for l in lines)"` to verify JSONL format.
- [ ] Run `grep -c 'Covers: AC-ROAD-P5-006\|Covers: RISK-005-BR-003' crates/devs-core/tests/risk_matrix_foundations.rs` and confirm it returns at least 8.
- [ ] Run `grep 'timeout' ./do | grep -v '# ' | head -5` and confirm the `timeout` command is NOT used (only references should be in comments or variable names).
