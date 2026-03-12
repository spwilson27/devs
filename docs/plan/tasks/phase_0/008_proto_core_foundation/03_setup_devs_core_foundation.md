# Task: Implement devs-core Foundation and Domain Types (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-023], [2_TAS-REQ-016]

## Dependencies
- depends_on: [02_setup_devs_proto_crate.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-core/src/persistence.rs` that verifies the path construction logic for the canonical `.devs/` layout.
- [ ] The test should assert that for a given `run-id` and `stage-name`, the generated paths match:
  - `.devs/runs/<run-id>/checkpoint.json`
  - `.devs/logs/<run-id>/<stage-name>/attempt_<N>/stdout.log`

## 2. Task Implementation
- [ ] Create the `crates/devs-core/` directory and initialize it as a Rust library crate.
- [ ] Update the workspace root `Cargo.toml` to include `crates/devs-core`.
- [ ] Implement `ValidationError` struct and associated logic for multi-error reporting as per [2_TAS-REQ-023].
- [ ] Define the canonical persistence directory structure in a module `persistence.rs` (or equivalent).
- [ ] Implement path builders that generate `PathBuf` for `checkpoint.json`, `workflow_snapshot.json`, and log files following the schema in [2_TAS-REQ-016].
- [ ] Ensure that `devs-core` does not have `tokio`, `git2`, `reqwest`, or `tonic` in its non-dev dependencies.
- [ ] Define the `StateMachine` trait (at least as a placeholder or initial definition) and the `TemplateResolver` structure.

## 3. Code Review
- [ ] Verify that `unsafe_code = "deny"` is active in `Cargo.toml`.
- [ ] Verify that doc comments are present for all public items.
- [ ] Ensure that `anyhow` is NOT used in `devs-core`. Use `thiserror` for error types.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify that the path construction tests pass.
- [ ] Ensure the crate achieves ≥ 90% unit test coverage.

## 5. Update Documentation
- [ ] Summarize the foundational types implemented in `crates/devs-core/README.md`.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure that documentation and formatting rules are met.
- [ ] Run `grep -r "checkpoint.json" crates/devs-core/` to verify path builder implementation.
