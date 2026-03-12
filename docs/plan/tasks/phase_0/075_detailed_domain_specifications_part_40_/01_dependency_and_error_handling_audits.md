# Task: Dependency and Error Handling Audits (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-450], [2_TAS-REQ-451]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test script `tests/verify_audits.sh` that mocks a Cargo workspace with violations and asserts that the audit script detects them.
- [ ] The test should verify that:
    - `devs-core` having `tokio`, `git2`, `reqwest`, or `tonic` in normal edges (non-dev-dependencies) fails the audit.
    - Any library crate having `anyhow` in its `[dependencies]` section fails the audit.

## 2. Task Implementation
- [ ] Implement the dependency isolation audit using `cargo tree`:
    - Run `cargo tree -p devs-core --edges normal` and grep for `tokio`, `git2`, `reqwest`, and `tonic`.
    - Fail if any are found.
- [ ] Implement the error handling standard audit:
    - Iterate over all library crates: `devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`, `devs-scheduler`, `devs-webhook`, `devs-grpc`, `devs-mcp`, `devs-proto`.
    - For each, check its `Cargo.toml` for `anyhow` in the `[dependencies]` section.
    - Fail if `anyhow` is present (it is only allowed in `[dev-dependencies]` or for non-library crates like CLI/TUI).
- [ ] Integrate these audits into the `./do lint` command.

## 3. Code Review
- [ ] Verify the audits are fast and don't significantly increase `./do lint` runtime.
- [ ] Ensure the error messages clearly identify which crate and which dependency violated the standard.

## 4. Run Automated Tests to Verify
- [ ] Run `tests/verify_audits.sh` and ensure it passes.
- [ ] Run `./do lint` on the current codebase and ensure it passes (assuming no current violations).

## 5. Update Documentation
- [ ] Update `GEMINI.md` or the developer guide to reflect these automated audits and the reasoning behind them (minimizing `devs-core` bloat and enforcing `thiserror` for library errors).

## 6. Automated Verification
- [ ] Run `./do lint` and verify the output contains a section or log indicating the dependency and error handling audits were executed.
