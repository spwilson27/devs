# Task: Cargo Profile Definitions for Dev, Test, and Release (Sub-Epic: 021_Foundational Technical Requirements (Part 12))

## Covered Requirements
- [2_TAS-REQ-004C]

## Dependencies
- depends_on: none
- shared_components: none (this task configures the workspace root `Cargo.toml`)

## 1. Initial Test Written
- [ ] Write a test (shell script or Rust integration test) that parses the root `Cargo.toml` and asserts the following profile sections exist with exact values:
  - `[profile.dev]`: `opt-level = 0`, `debug = true`, `incremental = true`
  - `[profile.release]`: `opt-level = 3`, `lto = "thin"`, `codegen-units = 1`, `strip = "debuginfo"`, `panic = "abort"`
  - `[profile.test]`: `inherits = "dev"`, `debug = true`
- [ ] Write a test that runs `cargo build --workspace` in dev profile and confirms exit code 0 (profiles are syntactically valid).
- [ ] Write a test that runs `cargo build --workspace --release` and confirms exit code 0.

## 2. Task Implementation
- [ ] Add the following exact profile tables to the root `Cargo.toml`:
  ```toml
  [profile.dev]
  opt-level   = 0
  debug       = true
  incremental = true

  [profile.release]
  opt-level     = 3
  lto           = "thin"
  codegen-units = 1
  strip         = "debuginfo"
  panic         = "abort"

  [profile.test]
  inherits = "dev"
  debug    = true
  ```
- [ ] Ensure no other profile overrides exist in member crate `Cargo.toml` files that would conflict with these workspace-level profiles.

## 3. Code Review
- [ ] Verify the three profiles match the specification in [2_TAS-REQ-004C] exactly — no extra keys, no missing keys.
- [ ] Confirm `panic = "abort"` is only on the release profile. Dev and test profiles must use the default unwind behavior to support `#[should_panic]` tests.
- [ ] Confirm `profile.test` inherits from `dev` and sets `debug = true` for coverage tooling compatibility.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build --workspace` (dev profile) — must exit 0.
- [ ] Run `cargo build --workspace --release` — must exit 0.
- [ ] Run `cargo test --workspace` — must exit 0 (test profile works correctly).
- [ ] Run the TOML-parsing assertions from step 1.

## 5. Update Documentation
- [ ] Add comments in `Cargo.toml` above each profile section referencing `[2_TAS-REQ-004C]`.

## 6. Automated Verification
- [ ] Run `cargo build --workspace 2>&1 && cargo build --workspace --release 2>&1 && cargo test --workspace 2>&1` — all must exit 0.
- [ ] Run a TOML parse check: `python3 -c "import tomllib; c=tomllib.load(open('Cargo.toml','rb')); assert c['profile']['release']['panic']=='abort'; assert c['profile']['test']['inherits']=='dev'; print('PASS')"` — must print PASS.
