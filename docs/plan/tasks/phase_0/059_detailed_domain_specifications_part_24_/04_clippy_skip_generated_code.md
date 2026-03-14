# Task: Clippy Skip for Generated Proto Code (Sub-Epic: 059_Detailed Domain Specifications (Part 24))

## Covered Requirements
- [2_TAS-REQ-246]

## Dependencies
- depends_on: [01_proto_timestamp_and_build_logic.md]
- shared_components: [./do Entrypoint Script, devs-proto]

## 1. Initial Test Written
- [ ] In `tests/e2e/lint_clippy_gen_skip.rs` (or shell script `tests/verify_clippy_gen_skip.sh`), write a test `test_clippy_skips_generated_code` that:
  - Injects a deliberate clippy violation into `devs-proto/src/gen/` — e.g., append `#[allow(unused)] fn _clippy_test_violation() { let x = 1; }` to a generated file.
  - Runs `./do lint` and asserts it exits 0 (the violation in `src/gen/` is ignored).
  - Removes the injected violation afterward (cleanup).
  - Add `// Covers: 2_TAS-REQ-246` annotation.
- [ ] Write a test `test_clippy_still_checks_non_generated_code` that:
  - Injects a deliberate clippy violation into a non-generated source file (e.g., `devs-proto/src/lib.rs` — add an unused variable).
  - Runs `./do lint` and asserts it exits non-zero due to the clippy warning.
  - Removes the injected violation afterward (cleanup).
  - Add `// Covers: 2_TAS-REQ-246` annotation.

## 2. Task Implementation
- [ ] Modify the `./do` script's `lint` subcommand to exclude `src/gen/` from clippy checks. Two approaches (choose one):
  - **Approach A (recommended)**: In `devs-proto/src/gen/mod.rs` (or the top-level re-export file), add `#![allow(clippy::all)]` module-level attribute so clippy ignores all generated code when run normally.
  - **Approach B**: In the `./do lint` script, run clippy with a filter that excludes generated files. Since cargo clippy does not natively support `--skip`, this would require either running clippy per-crate with `--exclude` or using the module-level allow attribute (Approach A).
- [ ] If using Approach A, ensure the `#![allow(clippy::all)]` attribute is either:
  - Added by `build.rs` automatically during code generation (preferred — survives regeneration), OR
  - Added to `src/gen/mod.rs` which is hand-maintained and not overwritten by `build.rs`.
- [ ] Verify that `#[allow(clippy::...)]` suppressions that `tonic-build` itself adds to generated files do not cause lint failures.

## 3. Code Review
- [ ] Verify that clippy is still enforced with `-D warnings` for all non-generated workspace code.
- [ ] Verify the solution survives proto regeneration — if `build.rs` overwrites `src/gen/`, the clippy suppression must still be present.
- [ ] Verify no workspace-wide clippy suppression was accidentally introduced.

## 4. Run Automated Tests to Verify
- [ ] Run the clippy skip test and confirm the generated code violation is ignored.
- [ ] Run the non-generated code test and confirm violations are still caught.
- [ ] Run `./do lint` on a clean workspace and confirm exit code 0.

## 5. Update Documentation
- [ ] Add a comment in `build.rs` or `src/gen/mod.rs` explaining why clippy is suppressed for generated code, referencing [2_TAS-REQ-246].

## 6. Automated Verification
- [ ] Run `./do lint` and verify exit code 0.
- [ ] Run `./do test` and verify `target/traceability.json` contains an entry for `2_TAS-REQ-246`.
