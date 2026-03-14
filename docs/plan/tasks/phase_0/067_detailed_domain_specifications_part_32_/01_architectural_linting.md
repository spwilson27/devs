# Task: Enforce Structured Tracing and devs-core I/O Prohibition Lints (Sub-Epic: 067_Detailed Domain Specifications (Part 32))

## Covered Requirements
- [2_TAS-REQ-413], [2_TAS-REQ-414]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, ./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] In `devs-core/tests/`, create `lint_policy_tests.rs` with the following tests:
    - `test_devs_core_has_no_io_dependencies`: Run `cargo metadata --format-version 1` and parse the JSON output. Find the `devs-core` package entry. Assert that its non-dev dependencies list does NOT contain any of: `tokio`, `git2`, `reqwest`, `tonic`. This test programmatically verifies [2_TAS-REQ-414].
    - `test_devs_core_compiles_without_io_crates`: Run `cargo check -p devs-core` and assert exit code 0, confirming the crate compiles without I/O crates.
- [ ] Create a shell-based lint test (e.g., `tests/lint/no_println_in_lib.sh`) that:
    - Greps all `src/` files in library crates (excluding `main.rs` and test files) for `println!`, `eprintln!`, and `log::` macro invocations.
    - Asserts zero matches. Any match is a [2_TAS-REQ-413] violation.
- [ ] Write a test that verifies `tracing` is listed as a dependency of all library crates in the workspace (confirming structured logging is available everywhere per [2_TAS-REQ-413]).

## 2. Task Implementation
- [ ] Add workspace-level Clippy configuration to deny `clippy::print_stdout` and `clippy::print_stderr` in all library crates. In each library crate's `lib.rs`, add:
    ```rust
    #![deny(clippy::print_stdout)]
    #![deny(clippy::print_stderr)]
    ```
- [ ] Add `tracing` as a workspace dependency in the root `Cargo.toml` `[workspace.dependencies]` section. Ensure all library crates use `tracing::{info, warn, error, debug, trace}` instead of `println!`/`eprintln!`/`log::*`.
- [ ] Update `./do lint` to include a `devs-core` dependency audit step:
    - Parse `devs-core/Cargo.toml` and verify that `[dependencies]` (not `[dev-dependencies]`) does not contain `tokio`, `git2`, `reqwest`, or `tonic`.
    - Use `cargo metadata -p devs-core --format-version 1 | jq` or a simple grep-based check on the TOML file.
    - Exit non-zero with a clear error message if any forbidden dependency is found.
- [ ] Update `./do lint` to include a grep-based check across all library crate `src/` directories for raw `println!`, `eprintln!`, and `log::` macro usage. Exclude `main.rs`, `build.rs`, and files under `tests/`.
- [ ] Ensure `devs-core/Cargo.toml` only has pure computation crates (e.g., `serde`, `thiserror`, `uuid`) in `[dependencies]`, with I/O crates only in `[dev-dependencies]` if needed for tests.

## 3. Code Review
- [ ] Verify that the Clippy deny attributes are placed in every library crate's `lib.rs`, not just `devs-core`.
- [ ] Confirm the `./do lint` dependency check distinguishes `[dependencies]` from `[dev-dependencies]` correctly — I/O crates in `[dev-dependencies]` of `devs-core` must be allowed.
- [ ] Check that the lint step produces actionable error messages identifying the exact file and line of any violation.
- [ ] Verify no existing code in `devs-core/src/` uses `println!`, `eprintln!`, or `log::` macros.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test lint_policy_tests` and confirm all tests pass.
- [ ] Run `./do lint` on the full workspace and confirm exit code 0.
- [ ] Temporarily add `tokio = "1"` to `devs-core/Cargo.toml` `[dependencies]`, run `./do lint`, and confirm it fails with a clear error. Revert the change.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-413` annotation to the println/log lint test.
- [ ] Add `// Covers: 2_TAS-REQ-414` annotation to the devs-core dependency audit test.
- [ ] Document in a code comment in `./do` the purpose of the devs-core dependency audit step.

## 6. Automated Verification
- [ ] Run `./do lint` and capture exit code — must be 0.
- [ ] Run `grep -rn 'println!\|eprintln!' devs-core/src/` and confirm zero output.
- [ ] Run `grep -c '"tokio"\|"git2"\|"reqwest"\|"tonic"' devs-core/Cargo.toml` against only the `[dependencies]` section and confirm zero matches.
