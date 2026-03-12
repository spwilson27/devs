# Task: Workspace-Level Lint Configuration (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-436], [2_TAS-REQ-437]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test `tests/test_workspace_lints.sh` that:
    - Verifies `cargo clippy` fails if `clippy::all` is violated (e.g., using `Option::unwrap()` in library code).
    - Verifies `cargo clippy` warns but does not fail if `clippy::pedantic` is violated (e.g., `missing_errors_doc`).
    - Verifies `cargo doc` or `cargo clippy` fails if a public item lacks documentation.

## 2. Task Implementation
- [ ] Update the repository root `Cargo.toml`.
- [ ] Add the following lint configuration:
    ```toml
    [workspace.lints.rust]
    missing_docs = "deny"

    [workspace.lints.clippy]
    all = "deny"
    pedantic = "warn"
    ```
- [ ] Ensure all library and binary crates in the workspace have `lints.workspace = true` in their `[package]` section.
    - Crates to update: `devs-proto`, `devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`, `devs-scheduler`, `devs-webhook`, `devs-grpc`, `devs-mcp`, `devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`.

## 3. Code Review
- [ ] Verify that `clippy::pedantic` are indeed warnings (non-blocking) while `clippy::all` are errors (blocking).
- [ ] Ensure `missing_docs = "deny"` is enforced on all library public members.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it uses the workspace-level configuration.
- [ ] Verify output for intentional violations.

## 5. Update Documentation
- [ ] None required.

## 6. Automated Verification
- [ ] Run `cargo clippy --workspace --all-targets` and check for the correct enforcement of "deny" vs "warn" levels.
