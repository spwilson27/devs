# Task: Workspace-Level Lint and Documentation Enforcement (Sub-Epic: 005_Verification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-048], [1_PRD-BR-006], [1_PRD-BR-007]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a temporary crate `crates/test-lint-enforcement` in the workspace.
- [ ] Add a public function to `crates/test-lint-enforcement/src/lib.rs` WITHOUT a doc comment.
- [ ] Run `./do lint` and verify it FAILS with a `missing_docs` error ([1_PRD-BR-006]).
- [ ] Add unformatted code to the same file (e.g., `fn  test() {}` with double spaces).
- [ ] Run `./do lint` and verify it FAILS with a `rustfmt` error ([1_PRD-BR-007]).
- [ ] Add a clippy violation (e.g., `let x = 1; let y = x;`) and verify `./do lint` FAILS ([1_PRD-REQ-048]).

## 2. Task Implementation
- [ ] Update the root `Cargo.toml` to include workspace-level lint configurations as per [2_TAS-REQ-013]:
    ```toml
    [workspace.lints.rust]
    missing_docs = "deny"
    unsafe_code = "forbid"

    [workspace.lints.clippy]
    all = "deny"
    pedantic = "warn"
    ```
- [ ] Ensure every crate in the workspace inherits these lints via `[lints] workspace = true`.
- [ ] Verify that `./do lint` invokes:
    1. `cargo fmt --check --all`
    2. `cargo clippy --workspace --all-targets --all-features -- -D warnings`
    3. `cargo doc --no-deps --workspace 2>&1 | grep -E "^warning|^error" && exit 1 || exit 0`
- [ ] Fix any existing lint or formatting violations in the current codebase to bring it into compliance.

## 3. Code Review
- [ ] Verify that `missing_docs = "deny"` is correctly applied to all public items.
- [ ] Verify that `unsafe_code = "forbid"` is active unless explicitly overridden for legitimate low-level operations (none expected in Phase 0).
- [ ] Ensure that the `grep` pattern for `cargo doc` correctly identifies both warnings and errors as failures.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the entire workspace and ensure it passes.
- [ ] Re-run the failure tests from Step 1 to ensure enforcement remains active.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to confirm that workspace lints are now authoritative and enforced by `./do lint`.
- [ ] Document the "Glass-Box" requirement that all public items must be documented for AI agent consumption.

## 6. Automated Verification
- [ ] Run `./do lint` and capture the output; verify it contains "Finished dev [unoptimized + debuginfo] target(s)" for all crates.
- [ ] Verify that a crate with a public struct missing a `///` comment causes a non-zero exit code from `./do lint`.
