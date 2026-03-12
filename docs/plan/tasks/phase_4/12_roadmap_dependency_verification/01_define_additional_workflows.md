# Task: Define Additional Standard Workflow TOML Definitions (Sub-Epic: 12_Roadmap Dependency Verification)

## Covered Requirements
- [ROAD-P4-DEP-002] (partial)

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Add unit tests to `crates/devs-config/src/workflow/tests.rs` (or create `crates/devs-config/tests/standard_workflows.rs`) that specifically validate the schema of the three additional workflows:
    1. `build-only.toml`: Verify it defines a single stage `build` with `command = "cargo build --workspace 2>&1"` and a 180s timeout.
    2. `unit-test-crate.toml`: Verify it defines an input `crate_name` and a stage `unit-test` that interpolates `{{crate_name}}` into the command.
    3. `e2e-all.toml`: Verify it defines three parallel stages (`e2e-cli`, `e2e-tui`, `e2e-mcp`) each with a 600s timeout and the `LLVM_PROFILE_FILE` environment variable.
- [ ] Use `WorkflowDefinition::from_toml` to ensure the logic matches the roadmap specifications.

## 2. Task Implementation
- [ ] Create `.devs/workflows/build-only.toml` with the content specified in the Project Roadmap (§3.1.2).
- [ ] Create `.devs/workflows/unit-test-crate.toml` with the content specified in the Project Roadmap (§3.1.3).
- [ ] Create `.devs/workflows/e2e-all.toml` with the content specified in the Project Roadmap (§3.1.4).
- [ ] Ensure that all three workflows use `pool = "build-pool"` (or the standard pool name configured for the server).
- [ ] Verify that all commands include `2>&1` to ensure stderr is captured in the logs for diagnostic purposes.

## 3. Code Review
- [ ] Confirm that `e2e-all` stages are truly parallel (no `depends_on` between the three e2e stages).
- [ ] Verify that `unit-test-crate` marks `crate_name` as a required input.
- [ ] Check that `timeout_secs` is present for every stage to satisfy the global timeout constraints.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-config` to verify the new TOML files are valid.
- [ ] Run `./do lint` to check for any documentation or style issues in the new workflow files.

## 5. Update Documentation
- [ ] Update the Phase 4 status document or agent memory to reflect that all 6 standard workflows are now defined and ready for bootstrap.

## 6. Automated Verification
- [ ] Manually verify that `ls .devs/workflows/` shows all 6 files: `tdd-red.toml`, `tdd-green.toml`, `presubmit-check.toml`, `build-only.toml`, `unit-test-crate.toml`, and `e2e-all.toml`.
