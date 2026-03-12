# Task: Enforce Acyclic Workspace Dependencies (Sub-Epic: 045_Detailed Domain Specifications (Part 10))

## Covered Requirements
- [2_TAS-REQ-100]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_dependencies.sh` that uses `cargo metadata` to inspect the workspace.
- [ ] The script should verify that `devs-core` and `devs-proto` have NO dependencies on any other crate within the `devs` workspace (except for `devs-proto` which might depend on third-party crates).
- [ ] The script should fail if `devs-core` depends on `devs-proto` or vice versa, or if any of them depend on `devs-scheduler`, etc.
- [ ] Note: `devs-proto` should have zero internal dependencies. `devs-core` should also have zero internal dependencies.

## 2. Task Implementation
- [ ] Add a new step to the `./do lint` command that executes `tests/verify_dependencies.sh`.
- [ ] Ensure that if `tests/verify_dependencies.sh` exits with a non-zero status, `./do lint` also fails.
- [ ] Update the workspace-level `Cargo.toml` or individual crate `Cargo.toml` files to ensure all dependencies are correctly unidirectional and follow the TAS layering (Interface → Engine → Domain).
- [ ] Add the comment `// Covers: 2_TAS-REQ-100` to the script or the `./do` script's lint section.

## 3. Code Review
- [ ] Verify that the dependency check script is robust and correctly parses the JSON output of `cargo metadata`.
- [ ] Ensure that it doesn't accidentally forbid external third-party dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it fails if a circular dependency is introduced (can be tested by temporarily adding a dependency).
- [ ] Run `./do lint` and ensure it passes with the current (correct) architecture.

## 5. Update Documentation
- [ ] Document the dependency rules in a new or existing architectural document.

## 6. Automated Verification
- [ ] Run the traceability scanner to verify `2_TAS-REQ-100` is now covered.
