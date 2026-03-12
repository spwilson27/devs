# Task: Core Crate Dependency Audit and Workspace Validation (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001D], [2_TAS-REQ-001E]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` (or a workspace-level test) that inspects the `Cargo.toml` of `devs-core` and asserts that `tokio`, `git2`, `reqwest`, and `tonic` are NOT present in the `[dependencies]` section.
- [ ] Create a workspace-level integration test that verifies all crates listed in the TAS are present in the root `Cargo.toml` `[workspace.members]` list.
- [ ] Add a test case to the traceability infrastructure that flags any non-dev dependency in `devs-core` that matches the restricted list.

## 2. Task Implementation
- [ ] Verify the root `Cargo.toml` contains all 15 crates as defined in [2_TAS-REQ-001D].
- [ ] Ensure `devs-core/Cargo.toml` does not include `tokio`, `git2`, `reqwest`, or `tonic` in the non-dev dependencies.
- [ ] Implement a custom lint or a simple script (e.g., `check_core_deps.sh`) that is invoked by `./do lint` to enforce this constraint.
- [ ] Ensure any shared logic needed by `devs-core` that typically requires `tokio` (like async traits) is handled via `futures` or other lightweight, non-runtime-bound libraries.

## 3. Code Review
- [ ] Verify that `devs-core` remains a pure domain logic crate with zero network or filesystem I/O in its non-dev dependencies.
- [ ] Confirm that the workspace manifest correctly organizes all 15 crates without any circular dependencies or external workspace leaks.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure internal tests pass.
- [ ] Run `./do lint` and verify the dependency audit step succeeds.
- [ ] Manually add `tokio` to `devs-core/Cargo.toml` and verify that `./do lint` fails as expected.

## 5. Update Documentation
- [ ] Update `devs-core/README.md` to explicitly state the dependency restrictions and the rationale (pure domain logic).
- [ ] Record the dependency audit mechanism in the project's developer guide.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_TAS-REQ-001E] and [2_TAS-REQ-001D] are correctly mapped to these tests.
