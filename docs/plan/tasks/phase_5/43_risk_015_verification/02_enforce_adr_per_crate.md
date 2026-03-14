# Task: Workspace-Wide ADR Enforcement Lint (Sub-Epic: 43_Risk 015 Verification)

## Covered Requirements
- [RISK-016], [RISK-016-BR-001]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python script `.tools/verify_adrs.py` that reads the `Cargo.toml` in the project root to extract the list of workspace members (crates).
- [ ] For each crate (e.g., `devs-core`), verify that at least one Markdown file matching `docs/adr/*-<crate_name>-design.md` or containing the crate name in its filename exists in the `docs/adr/` directory.
- [ ] Write a test case in `.tools/tests/test_verify_adrs.py` that mocks the `Cargo.toml` and `docs/adr/` directory to ensure the verification script correctly flags missing ADRs.

## 2. Task Implementation
- [ ] Implement `.tools/verify_adrs.py`. Use the `toml` Python library to parse `Cargo.toml`.
- [ ] Ensure it supports fuzzy matching of crate names to ADR filenames (e.g., `devs_core` vs `devs-core`).
- [ ] Update the `./do lint` script to include a call to `python3 .tools/verify_adrs.py`.
- [ ] Ensure that a missing ADR causes the lint command to exit non-zero.
- [ ] Create missing ADR stubs for any current workspace members that lack one to satisfy the initial lint run.

## 3. Code Review
- [ ] Confirm that the script correctly handles workspace members listed as paths (e.g., `crates/*`).
- [ ] Verify that it excludes external dependencies from the ADR check.
- [ ] Ensure that it produces a clear, actionable error message for developers.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes (after creating the required ADRs).
- [ ] Verify that deleting one ADR stub causes `./do lint` to fail with a relevant error message.

## 5. Update Documentation
- [ ] Add `// Covers: RISK-016-BR-001` to a new test in `tests/traceability/adr_lint_test.rs` that verifies the existence of ADR files for current workspace members.
- [ ] Update `target/traceability.json` to reflect coverage for `RISK-016-BR-001`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `RISK-016-BR-001` is covered and that the lint step in presubmit correctly enforces this rule.
