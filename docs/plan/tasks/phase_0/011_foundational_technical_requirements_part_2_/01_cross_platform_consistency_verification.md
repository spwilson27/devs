# Task: Cross-Platform Consistency Verification (Sub-Epic: 011_Foundational Technical Requirements (Part 2))

## Covered Requirements
- [2_PRD-BR-006]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a new integration test file `tests/e2e/presubmit_consistency.rs`.
- [ ] Write a test that simulates the output of `./do test` and `./do coverage` (e.g., by reading `target/traceability.json` and `target/coverage/report.json` if they exist).
- [ ] The test should implement a normalization function that:
    - Replaces absolute workspace paths with a relative placeholder (e.g., `<WORKSPACE_ROOT>`).
    - Standardizes line endings (LF vs CRLF).
    - Normalizes path separators (to `/`).
- [ ] The test should assert that for a given set of input files, the generated reports are identical across platforms after normalization.

## 2. Task Implementation
- [ ] Update `./do setup` to perform a platform-specific check of tool versions (Rust, Cargo, LLVM tools, Protoc).
- [ ] Ensure `rust-toolchain.toml` is used to pin versions as per [2_TAS-REQ-004].
- [ ] Implement a helper script `.tools/normalize_report.py` that can process `target/traceability.json` to ensure OS-agnostic comparisons.
- [ ] Modify the GitLab CI template in `.gitlab-ci.yml` (if applicable) to ensure that `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` all use the same normalization logic for artifact comparison.
- [ ] Ensure `./do test` fails if normalization cannot be performed or if reports differ significantly between identical runs on different OSes.

## 3. Code Review
- [ ] Verify that all path manipulations in `./do` and the normalization tools use `std::path` or equivalent to ensure cross-platform correctness.
- [ ] Check that no OS-specific assumptions (like `/tmp/` vs `C:\Temp`) are hardcoded in the verification scripts.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` on the current platform.
- [ ] Verify that the CI pipeline (once pushed) passes on all three platforms and that the artifacts produced are consistent.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/1_prd.md` or a technical README to document the normalization process used to ensure cross-platform consistency.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_PRD-BR-006] is now correctly covered by `tests/e2e/presubmit_consistency.rs`.
