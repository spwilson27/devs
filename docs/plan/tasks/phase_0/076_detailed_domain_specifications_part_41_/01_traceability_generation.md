# Task: Implement Traceability JSON Generation in `./do test` (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-455]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_traceability_generation.sh` (or equivalent Rust integration test under `crates/devs-test-harness/tests/traceability_generation.rs`) that exercises the traceability report generation end-to-end.
- [ ] **Test case 1 — happy path**: Set up a temp directory with a minimal `requirements.md` containing two requirement IDs (e.g., `TEST-REQ-001`, `TEST-REQ-002`). Create a Rust source file with `// Covers: TEST-REQ-001` and `// Covers: TEST-REQ-002` annotations. Run the traceability scanner. Assert:
  - `target/traceability.json` exists and is valid JSON.
  - The `overall_passed` field is `true`.
  - `uncovered_ids` is an empty array.
  - `covered_count` equals the total `requirements_count`.
- [ ] **Test case 2 — uncovered requirement**: Same setup but remove one annotation. Assert:
  - `overall_passed` is `false`.
  - The missing ID appears in `uncovered_ids`.
- [ ] **Test case 3 — file existence**: After `./do test` completes successfully, assert `target/traceability.json` exists and can be parsed as valid JSON with `jq . target/traceability.json`.

## 2. Task Implementation
- [ ] Implement a traceability scanner (as a POSIX sh function, standalone shell script, or Rust binary in the workspace — consistent with how `./do` delegates to tooling) that:
  1. Parses `requirements.md` to extract all requirement IDs matching the pattern `[X_YYY-REQ-NNN]` (bracket-delimited, alphanumeric prefix).
  2. Recursively scans `crates/` and `tests/` directories for `// Covers:` annotations in `.rs` files, extracting the referenced requirement IDs.
  3. Computes the set difference: `uncovered_ids = all_requirement_ids - covered_ids`.
  4. Writes `target/traceability.json` with this schema:
     ```json
     {
       "overall_passed": true,
       "requirements_count": 42,
       "covered_count": 42,
       "uncovered_ids": [],
       "coverage_map": {
         "2_TAS-REQ-001": ["crates/devs-core/src/lib.rs:55"]
       }
     }
     ```
  5. `overall_passed` is `true` if and only if `uncovered_ids` is empty.
- [ ] Integrate the scanner into `./do test` so it runs after `cargo test` completes. The `./do test` exit code must be non-zero if either `cargo test` or the traceability scanner fails.
- [ ] Ensure `target/` directory is created (via `mkdir -p target`) before writing the JSON file.

## 3. Code Review
- [ ] Verify the annotation regex handles both `// Covers:` and `/// Covers:` comment styles, and supports comma-separated lists (e.g., `// Covers: REQ-001, REQ-002`).
- [ ] Verify `target/traceability.json` is deterministic (sorted keys, sorted arrays) so that diffs are meaningful.
- [ ] Confirm the scanner does not silently skip files or directories.

## 4. Run Automated Tests to Verify
- [ ] Run the traceability generation tests and confirm all pass.
- [ ] Run `./do test` on the workspace and confirm `target/traceability.json` is produced.

## 5. Update Documentation
- [ ] Add a brief comment in `./do` near the traceability invocation explaining the `target/traceability.json` output format and its role in gating.

## 6. Automated Verification
- [ ] Run `./do test` and then `jq '.overall_passed' target/traceability.json` — confirm the output is a boolean.
- [ ] Run `jq 'keys' target/traceability.json` and verify it contains `overall_passed`, `requirements_count`, `covered_count`, `uncovered_ids`, `coverage_map`.
