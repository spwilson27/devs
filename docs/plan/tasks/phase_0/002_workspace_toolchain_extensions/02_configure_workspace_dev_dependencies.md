# Task: Configure Workspace Dev-Dependencies (Sub-Epic: 002_Workspace Toolchain Extensions)

## Covered Requirements
- [2_TAS-REQ-007]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline (consumer — integrate lint check)"]

## 1. Initial Test Written
- [ ] Create a verification script `scripts/verify_dev_deps.py` (or shell script) that:
  1. Parses the root `Cargo.toml` and extracts all crate names from `[workspace.dev-dependencies]`.
  2. Parses the root `Cargo.toml` and extracts all crate names from `[workspace.dependencies]`.
  3. Asserts the authoritative dev-dependency crates (`cargo-llvm-cov`, `insta`, `mockall`, `bollard`, `wiremock`, `assert_cmd`, `predicates`, `tokio-test`, `rstest`) appear ONLY in `[workspace.dev-dependencies]`, never in `[workspace.dependencies]`.
  4. Walks every workspace member `Cargo.toml` and asserts none of the authoritative dev-dependency crates appear in `[dependencies]` (only in `[dev-dependencies]`).
  5. Exits non-zero with a clear error message naming the offending crate and file if any violation is found.
- [ ] Write a Rust test (e.g., in a `tests/verify_dev_deps.rs` file) that shells out to `cargo metadata --format-version 1`, parses the JSON, and asserts each authoritative dev-dep crate is only reachable via dev-dependency edges. Annotate with `// Covers: 2_TAS-REQ-007`.
- [ ] Verify the script fails correctly by temporarily adding `insta` to `[workspace.dependencies]` and confirming the script exits 1.

## 2. Task Implementation
- [ ] In the root `Cargo.toml`, add a `[workspace.dev-dependencies]` section with exactly these entries:
  ```toml
  [workspace.dev-dependencies]
  insta = "1.40"
  mockall = "0.13"
  bollard = "0.17"
  wiremock = "0.6"
  assert_cmd = "2.0"
  predicates = "3.1"
  tokio-test = "0.4"
  rstest = "0.22"
  ```
  Note: `cargo-llvm-cov` is a CLI tool invoked by `./do coverage`, not a library dependency — it should NOT appear in `Cargo.toml` but should be documented as a required tool in `./do setup`.
- [ ] Confirm none of these crates are listed under `[workspace.dependencies]`.
- [ ] For each workspace member crate, if it uses any of these crates, ensure it declares them under `[dev-dependencies]` with `<crate>.workspace = true`.
- [ ] Integrate the `verify_dev_deps.py` script into `./do lint` as a named step (e.g., "dev-dependency separation check").

## 3. Code Review
- [ ] Verify exact version strings match the authoritative table in [2_TAS-REQ-007].
- [ ] Confirm the `[workspace.dev-dependencies]` section is syntactically correct (run `cargo check` to validate).
- [ ] Ensure no workspace member has elevated any dev-dep to a regular `[dependencies]` entry.
- [ ] Confirm `cargo-llvm-cov` is handled as a tool dependency (installed via `cargo install` in `./do setup`) rather than a Cargo dependency.

## 4. Run Automated Tests to Verify
- [ ] Run `scripts/verify_dev_deps.py` directly and confirm exit code 0.
- [ ] Run `./do lint` and confirm the dev-dependency separation check passes.
- [ ] Run the Rust integration test: `cargo test --test verify_dev_deps` and confirm it passes.

## 5. Update Documentation
- [ ] No external documentation updates required beyond what `./do lint` enforces. If a developer guide exists, add a note that dev-only crates must be declared in `[workspace.dev-dependencies]` per [2_TAS-REQ-007].

## 6. Automated Verification
- [ ] `./do lint` exits 0 (includes dev-dependency separation check).
- [ ] `cargo metadata --format-version 1 | python3 scripts/verify_dev_deps.py` exits 0.
- [ ] Temporarily add `insta` to `[workspace.dependencies]`, run `./do lint`, confirm it fails, then revert.
