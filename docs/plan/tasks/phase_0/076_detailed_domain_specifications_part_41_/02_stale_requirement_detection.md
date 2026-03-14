# Task: Implement Stale Requirement ID Detection (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-456]

## Dependencies
- depends_on: [01_traceability_generation.md]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] **Test case 1 — stale ID causes failure**: Create a temp workspace with a `requirements.md` containing only `TEST-REQ-001`. Create a Rust source file with `// Covers: TEST-REQ-001` (valid) and `// Covers: TEST-REQ-FAKE` (stale — not in requirements). Run the traceability scanner. Assert:
  - The scanner exits with a non-zero exit code.
  - `target/traceability.json` is still generated.
  - `target/traceability.json` contains `TEST-REQ-FAKE` in a `stale_annotations` or `invalid_ids` array.
- [ ] **Test case 2 — stale ID propagates through `./do test`**: Run `./do test` in a workspace where a test file contains a stale `// Covers: NONEXISTENT-REQ-999` annotation. Assert that `./do test` exits non-zero even if all `cargo test` tests pass.
- [ ] **Test case 3 — no stale IDs, no failure**: Verify that when all annotations reference valid requirement IDs, the scanner exits 0 and no stale IDs are reported.

## 2. Task Implementation
- [ ] Extend the traceability scanner (built in task 01) to:
  1. Collect all requirement IDs referenced in `// Covers:` annotations across the source tree.
  2. Compute `stale_ids = annotation_ids - known_requirement_ids` (IDs in code but not in `requirements.md`).
  3. Add a `stale_annotations` (or `invalid_ids`) array to `target/traceability.json`.
  4. Set `overall_passed` to `false` if `stale_annotations` is non-empty.
  5. Exit non-zero if any stale annotations are found.
- [ ] Print a human-readable error message to stderr listing each stale annotation with its file path and line number, e.g.:
  ```
  ERROR: Stale requirement annotation at crates/devs-core/src/lib.rs:42 — TEST-REQ-FAKE not found in requirements.md
  ```
- [ ] Ensure `./do test` propagates this non-zero exit code.

## 3. Code Review
- [ ] Verify that the stale detection compares against the canonical requirement ID set extracted from `requirements.md`, not a hardcoded list.
- [ ] Confirm that both the JSON report and stderr output include the source location (file:line) of each stale annotation.

## 4. Run Automated Tests to Verify
- [ ] Run the stale detection tests and confirm all pass.
- [ ] Inject a fake `// Covers: DOES-NOT-EXIST-999` into a test file, run `./do test`, and confirm it fails.

## 5. Update Documentation
- [ ] No additional documentation beyond the inline comments added in task 01.

## 6. Automated Verification
- [ ] Inject a stale annotation into a scratch `.rs` file, run the traceability scanner, and verify the JSON output contains the stale ID and `overall_passed` is `false`.
- [ ] Remove the stale annotation, re-run, and verify `overall_passed` returns to `true`.
