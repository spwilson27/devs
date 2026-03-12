# Task: Tech Stack Acceptance - Infrastructure & Tooling (Sub-Epic: 088_Detailed Domain Specifications (Part 53))

## Covered Requirements
- [2_TAS-REQ-601]

## Dependencies
- depends_on: [04_architecture_acceptance_logic.md]
- shared_components: [./do Entrypoint Script, Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create an acceptance test suite `tests/acceptance/stack_infrastructure.rs` that verifies:
    - **[2_TAS-REQ-445]**: Presence of `rust-toolchain.toml` with the correct pinned stable version and components.
    - **[2_TAS-REQ-446]**: Successful `cargo build` on all workspace crates with all features.
    - **[2_TAS-REQ-453]**: `./do setup` correctly installs required tools (`rustc`, `cargo`, etc.) and sets `$PATH`.
    - **[2_TAS-REQ-454]**: `./do setup` is idempotent (second run exits 0).
    - **[2_TAS-REQ-460]**: `./do <unknown>` command handling and exit 0.
    - **[2_TAS-REQ-461]**: Presence of generated proto code in `devs-proto/src/gen/`.
    - **[2_TAS-REQ-462]**: Verification of 6 gRPC services in the generated code.
    - **[2_TAS-REQ-463]**: Successful execution of TUI tests using `TestBackend`.

## 2. Task Implementation
- [ ] Implement the `rust-toolchain.toml` configuration if not already finalized.
- [ ] Ensure the `./do build` and `./do setup` commands are fully functional and idempotent.
- [ ] Set up the proto code generation logic in `devs-proto` and commit the results.
- [ ] Implement the TUI headless testing framework using `ratatui::backend::TestBackend` and `insta` snapshots.
- [ ] Configure the unknown subcommand behavior for the `./do` script.

## 3. Code Review
- [ ] Confirm that `rust-toolchain.toml` correctly pins the version and components required for all platforms.
- [ ] Verify that `devs-proto` generated code is clean and reproducible.
- [ ] Ensure that TUI tests are truly headless and don't depend on an actual terminal environment.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test stack_infrastructure` to verify the tooling and infra.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note the verification of infrastructure and tooling acceptance criteria.

## 6. Automated Verification
- [ ] Verify that `./do test` passes and `target/traceability.json` shows [2_TAS-REQ-601] as covered.
