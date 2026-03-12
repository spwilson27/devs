# Task: Workspace Integrity Verification (Sub-Epic: 44_Risk 016 Verification)

## Covered Requirements
- [AC-RISK-016-01], [AC-RISK-016-02]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write a new integration test in `tests/test_workspace_integrity.rs` that reads the top-level `Cargo.toml` to identify all workspace members.
- [ ] For each crate (member), verify that a matching design ADR exists in `docs/adr/`. The ADR filename should follow the pattern `docs/adr/NNNN-<crate-name>-design.md`. (Covers: [AC-RISK-016-01])
- [ ] Add an E2E test to the `presubmit` script (via `./do presubmit`) that asserts `cargo clippy --workspace --all-targets -- -D warnings` exits 0. (Covers: [AC-RISK-016-02])

## 2. Task Implementation
- [ ] Implement the ADR presence check logic. It should be able to match crate names with their ADRs even if the ADR filename has a numeric prefix.
- [ ] Ensure the `./do lint` and `./do presubmit` commands include a workspace-wide `clippy` check that treats warnings as errors.
- [ ] Create missing ADRs for any crate that lacks one (if any).
- [ ] Fix any outstanding Clippy warnings in the workspace.

## 3. Code Review
- [ ] Verify that the ADR presence check is robust and does not produce false positives (e.g., matching a partial name).
- [ ] Ensure clippy is run with `--all-targets` and `--workspace` to cover all code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_workspace_integrity` and ensure it passes.
- [ ] Run `./do lint` and verify it correctly performs the clippy check.

## 5. Update Documentation
- [ ] Add `AC-RISK-016-01` and `AC-RISK-016-02` to the traceability summary in `target/traceability.json`.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and ensure `AC-RISK-016-01` and `AC-RISK-016-02` are marked as covered.
