# Task: Tech Stack Acceptance - Audits & Reporting (Sub-Epic: 088_Detailed Domain Specifications (Part 53))

## Covered Requirements
- [2_TAS-REQ-601]

## Dependencies
- depends_on: [05_tech_stack_acceptance_infrastructure.md]
- shared_components: [./do Entrypoint Script, Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create an acceptance test suite `tests/acceptance/stack_audits.rs` that verifies:
    - **[2_TAS-REQ-447]**: `cargo fmt --check --all` exits 0 on the current codebase.
    - **[2_TAS-REQ-448]**: `cargo clippy --workspace --all-targets --all-features -- -D warnings` exits 0.
    - **[2_TAS-REQ-449]**: `cargo doc --no-deps --workspace` produces zero warnings or errors.
    - **[2_TAS-REQ-450]**: `devs-core` does not contain any entries for `tokio`, `git2`, `reqwest`, or `tonic`.
    - **[2_TAS-REQ-451]**: `anyhow` is not present in the `[dependencies]` of any library crate.
    - **[2_TAS-REQ-452]**: No `unsafe` code is present in any Rust source file in the workspace.
    - **[2_TAS-REQ-455]**: Presence and correctness of `target/traceability.json`.
    - **[2_TAS-REQ-456]**: Failure of traceability report when a non-existent requirement is referenced.
    - **[2_TAS-REQ-457]**: Presence and correctness of `target/coverage/report.json` with gates QG-001 through QG-005.
    - **[2_TAS-REQ-458]**: Failure of `./do coverage` when a gate threshold is not met.
    - **[2_TAS-REQ-459]**: Correct behavior of the 15-minute timeout for `./do presubmit`.

## 2. Task Implementation
- [ ] Implement the `DependencyAudit` script which checks crate dependencies for banned libraries (`anyhow`, `tokio` in core, etc.).
- [ ] Implement the `UnsafeAudit` script which uses `grep` or similar to search for `unsafe` blocks.
- [ ] Finalize the `./do lint` and `./do coverage` commands and their quality gates.
- [ ] Ensure the traceability reporting tool is fully functional and produces the correct schema.
- [ ] Implement the timeout logic in the `./do presubmit` command.

## 3. Code Review
- [ ] Confirm that all audits are automated and run as part of the `./do lint` or `./do presubmit` process.
- [ ] Verify that the traceability report is accurate and reflects the actual test coverage of requirements.
- [ ] Check that the coverage gates are appropriately tuned for the Phase 0 codebase.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test stack_audits` to verify the audits and reports.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note the verification of audits and reporting acceptance criteria.

## 6. Automated Verification
- [ ] Verify that `./do test` passes and `target/traceability.json` shows [2_TAS-REQ-601] as covered.
