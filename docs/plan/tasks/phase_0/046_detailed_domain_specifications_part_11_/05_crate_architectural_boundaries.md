# Task: Crate Architectural Boundaries Enforcement (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-101]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a Python or shell script in `.tools/verify_architecture.py` that:
    - Parses all `Cargo.toml` files in the workspace.
    - Verifies that `devs-server`, `devs-tui`, `devs-cli`, and `devs-mcp-bridge` are not in the `[dependencies]` section of any other crate.
    - Checks all library crates for the presence of a `main` function and ensures they only contain logic, not entry points.
    - Verifies that binary crates only contain their entry point and minimal wiring.

## 2. Task Implementation
- [ ] Review all `Cargo.toml` files in the workspace to ensure correct dependency direction.
- [ ] Move any logic accidentally placed in binary crates into the appropriate library crates (e.g., `devs-core`, `devs-config`, `devs-grpc`).
- [ ] Ensure `devs-server`, `devs-tui`, `devs-cli`, and `devs-mcp-bridge` are defined as `[[bin]]` in their respective crates (or have a `src/main.rs`).
- [ ] Ensure all other crates are library crates and do not contain binary targets.

## 3. Code Review
- [ ] Verify that `devs-core` and `devs-proto` have zero internal workspace dependencies as per [2_TAS-REQ-100] (referenced as context for REQ-101).
- [ ] Confirm that binary crates are thin wrappers around library functionality.
- [ ] Ensure no circular dependencies are introduced between library crates.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created verification script: `python3 .tools/verify_architecture.py`.
- [ ] Run `cargo build --workspace` to ensure the workspace builds correctly with the enforced boundaries.

## 5. Update Documentation
- [ ] Document the architectural constraints in a workspace-level `ARCHITECTURE.md` file.

## 6. Automated Verification
- [ ] Run `./do verify` to ensure requirement traceability for [2_TAS-REQ-101] is maintained.
