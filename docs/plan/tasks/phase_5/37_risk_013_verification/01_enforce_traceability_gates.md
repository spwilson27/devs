# Task: Enforce Traceability Gates and Universal File Scanning (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013-BR-001], [RISK-013-BR-002], [RISK-013-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python integration test in `.tools/tests/test_traceability_gates.py` that mocks a requirement spec file and a set of source files.
- [ ] The test MUST verify that `verify_requirements.py` (and consequently `./do test`) exits non-zero if `traceability_pct < 100.0` (even 99.9% is a failure).
- [ ] The test MUST verify that it exits non-zero if a `// Covers: <id>` annotation references an ID not found in the spec documents (`stale_annotations`).
- [ ] The test MUST verify that `.rs` files in any workspace directory (including production code, not just tests) are scanned for `// Covers:` annotations.
- [ ] Verify that unit tests (not E2E) correctly satisfy the traceability percentage check even if they don't count toward E2E interface gates.

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to calculate the total percentage of requirement IDs that have at least one `// Covers:` annotation across all scanned files.
- [ ] Implement logic to find and report "stale" annotations: IDs that exist in `// Covers:` but not in any `[REQ-ID]` or `[RISK-ID]` block in the spec markdown files.
- [ ] Ensure the scanner glob pattern covers all `.rs` files in the workspace (excluding `target/`, `.git/`, and `devs-proto/src/gen/`).
- [ ] Modify the final exit logic: if `uncovered_count > 0` or `stale_count > 0`, the script MUST `sys.exit(1)`.
- [ ] Ensure `./do test` and `./do presubmit` correctly propagate this non-zero exit code.

## 3. Code Review
- [ ] Verify that the scanner is efficient and doesn't significantly slow down `./do test`.
- [ ] Confirm that `traceability_pct` is computed as `(covered_ids / total_ids) * 100`.
- [ ] Check that the error output clearly lists which IDs are uncovered and which annotations are stale.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_gates.py` and ensure all scenarios pass.
- [ ] Run a local `./do test` and confirm it passes on the current codebase (assuming it's currently 100% compliant).

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect that the traceability gate is now strictly enforced at 100%.

## 6. Automated Verification
- [ ] Temporarily remove one `// Covers:` annotation from a test file and run `./do test`. Verify it exits non-zero with a traceability error.
- [ ] Revert the change.
- [ ] Temporarily add a `// Covers: NON-EXISTENT-ID` annotation and run `./do test`. Verify it exits non-zero with a stale annotation error.
- [ ] Revert the change.
