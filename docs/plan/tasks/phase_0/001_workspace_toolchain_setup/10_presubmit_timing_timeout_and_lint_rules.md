# Task: Implement Presubmit Timing, Hard Timeout, and Lint Enforcement Rules (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [ROAD-BR-LF-001], [ROAD-BR-LF-002], [ROAD-BR-LF-003], [ROAD-BR-LF-004], [ROAD-BR-LF-005], [ROAD-BR-LF-006], [ROAD-BR-LF-007], [ROAD-BR-LF-008], [ROAD-BR-LF-009], [ROAD-BR-LF-010], [ROAD-BR-LF-011], [ROAD-BR-LF-012], [ROAD-BR-LF-013], [ROAD-BR-LF-014], [ROAD-BR-LF-015], [ROAD-BR-LF-016], [ROAD-BR-LF-017], [ROAD-BR-LF-018], [ROAD-BR-LF-019], [ROAD-BR-LF-020], [AC-ROAD-LF-001], [AC-ROAD-LF-002], [AC-ROAD-LF-003], [AC-ROAD-LF-004], [AC-ROAD-LF-005], [AC-ROAD-LF-006], [AC-ROAD-LF-007], [AC-ROAD-LF-008], [AC-ROAD-LF-009], [AC-ROAD-LF-010], [ROAD-CONS-003]

## Dependencies
- depends_on: ["03_workspace_build_validation.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create shell-based tests in `tests/phase_0/test_presubmit_timing.sh` that verify:
  1. `./do presubmit` writes `target/presubmit_timings.jsonl` with one JSON entry per step. Each entry contains `step`, `start_epoch`, `end_epoch`, `duration_s`, `status` fields. Annotate `// Covers: AC-ROAD-LF-001`, `// Covers: ROAD-BR-LF-001`.
  2. Timing entries are written incrementally — partial data survives a hard-timeout kill. Annotate `// Covers: AC-ROAD-LF-002`, `// Covers: ROAD-BR-LF-003`.
  3. The 900-second hard timeout is enforced via a background process (not the `timeout` command) that kills the presubmit if it exceeds the budget. Annotate `// Covers: AC-ROAD-LF-003`, `// Covers: ROAD-BR-LF-002`, `// Covers: ROAD-CONS-003`.
  4. `./do lint` runs `cargo tree` to enforce forbidden import rules (e.g., devs-core must not depend on tokio, git2, reqwest, tonic). Annotate `// Covers: AC-ROAD-LF-004`, `// Covers: ROAD-BR-LF-004`.
  5. BOOTSTRAP-STUB annotations in source code are detected by `./do lint` — present stubs are allowed before Phase 4, flagged as errors after Phase 3 PTC. Annotate `// Covers: AC-ROAD-LF-005`, `// Covers: ROAD-BR-LF-005`.
  6. PoolExhausted events fire at most once per exhaustion episode (not per failed acquire). Annotate `// Covers: AC-ROAD-LF-006`, `// Covers: ROAD-BR-LF-006`.
  7. Rate-limit cooldown uses absolute timestamps (not relative durations) to avoid clock drift issues. Annotate `// Covers: AC-ROAD-LF-007`, `// Covers: ROAD-BR-LF-007`.
  8. `.devs_output.json` file takes priority over stdout for structured output parsing. Annotate `// Covers: AC-ROAD-LF-008`, `// Covers: ROAD-BR-LF-008`.
  9. `signal_completion` on a stage already in terminal state returns an error. Annotate `// Covers: AC-ROAD-LF-009`, `// Covers: ROAD-BR-LF-009`.
  10. Diagnostic tools must read state before writing (read-before-write rule for MCP tools). Annotate `// Covers: AC-ROAD-LF-010`, `// Covers: ROAD-BR-LF-010`.
- [ ] Create tests verifying remaining logical flow business rules:
  11. `list_runs` must be called before a second `submit_run` in automated scripts. Annotate `// Covers: ROAD-BR-LF-011`.
  12–20. One test per ROAD-BR-LF-012 through ROAD-BR-LF-020 verifying each logical flow invariant is enforced or documented.
- [ ] Create a test that runs `./do presubmit` on the stub workspace and verifies:
  - A warning is emitted to stderr if any step exceeds its per-step budget. Annotate `// Covers: ROAD-BR-LF-001`.
  - The total run completes within 900 seconds. Annotate `// Covers: ROAD-CONS-003`.

## 2. Task Implementation
- [ ] Implement the timing infrastructure in `./do`:
  - Before each step (format, lint, test, coverage, ci), record `start_epoch` via `date +%s`.
  - After each step, record `end_epoch` and compute `duration_s`.
  - Write a JSON line to `target/presubmit_timings.jsonl` immediately after each step completes (incremental writes).
  - If a step takes >120s, emit a warning to stderr.
- [ ] Implement the 900-second hard timeout in `./do presubmit`:
  - Spawn a background process that sleeps for 900 seconds then kills the presubmit process group.
  - Record the background PID and kill it on normal completion.
  - Do NOT use the `timeout` command (not POSIX-portable).
- [ ] Add `cargo tree` forbidden import checks to `./do lint`:
  - For `devs-core`: verify no `tokio`, `git2`, `reqwest`, `tonic` in `cargo tree -p devs-core` output.
  - Exit non-zero if forbidden imports are detected.
- [ ] Add BOOTSTRAP-STUB annotation scanning to `./do lint`:
  - Grep for `BOOTSTRAP-STUB` in all `.rs` files under `crates/`.
  - If a Phase 3 PTC exists in `docs/adr/`, any remaining BOOTSTRAP-STUB annotations cause a lint failure.
- [ ] Define constants/documentation for the logical flow rules (ROAD-BR-LF-006 through ROAD-BR-LF-020) that will be enforced in their respective crate implementations in later phases.

## 3. Code Review
- [ ] Verify the hard timeout uses a background process, not `timeout` command.
- [ ] Verify timing writes are truly incremental (one write per step, not buffered).
- [ ] Verify all 31 requirement IDs are annotated in test code.
- [ ] Verify `./do` script remains POSIX sh-compatible.

## 4. Run Automated Tests to Verify
- [ ] Run `./do presubmit` on stub workspace and verify it completes within 900s.
- [ ] Verify `target/presubmit_timings.jsonl` exists and contains valid JSON lines.
- [ ] Run `./do lint` and verify forbidden import checks are active.

## 5. Update Documentation
- [ ] Add comments in `./do` script explaining the timing and timeout mechanisms.

## 6. Automated Verification
- [ ] Run `cat target/presubmit_timings.jsonl | python3 -c "import sys,json; [json.loads(l) for l in sys.stdin]"` to verify valid JSONL.
- [ ] Run `./do lint` and confirm exit code 0 on the stub workspace.
- [ ] Verify the background timeout process is properly cleaned up after presubmit completes.
