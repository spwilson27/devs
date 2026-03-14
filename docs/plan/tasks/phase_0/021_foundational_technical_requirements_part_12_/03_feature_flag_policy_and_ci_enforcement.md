# Task: Feature Flag Policy and CI --all-features Enforcement (Sub-Epic: 021_Foundational Technical Requirements (Part 12))

## Covered Requirements
- [2_TAS-REQ-004E], [2_TAS-REQ-004F]

## Dependencies
- depends_on: none
- shared_components: ["./do Entrypoint Script & CI Pipeline"] (consumer — CI pipeline must be updated to use `--all-features`)

## 1. Initial Test Written
- [ ] Write a lint check (integrated into `./do lint` or as a standalone script `scripts/check_features.sh`) that:
  1. Iterates over every workspace member `Cargo.toml`.
  2. If a `[features]` table exists, asserts that every feature key is either: (a) related to TLS backend selection (e.g., `rustls-tls`), or (b) gated for test-only utilities. No feature may gate core business logic.
  3. Fails with a descriptive error message listing the offending crate and feature name if a violation is found.
- [ ] Write a test that verifies `cargo build --workspace --all-features` succeeds (no feature combination is broken).
- [ ] Write a test that verifies `cargo test --workspace --all-features` succeeds.
- [ ] If a CI configuration file exists (e.g., `.gitlab-ci.yml`), write a test that parses it and asserts all build/test jobs include `--all-features`.

## 2. Task Implementation
- [ ] Audit all existing workspace member `Cargo.toml` files. Remove or refactor any `[features]` entries that gate core business logic. Only the following feature patterns are permitted:
  - TLS backend selection for `reqwest` (must be `rustls-tls`, never `native-tls`) per [2_TAS-REQ-004E].
  - Test-only utility features gated with `#[cfg(test)]`.
- [ ] Update the CI configuration (`.gitlab-ci.yml` or equivalent) to ensure every build and test job uses:
  ```yaml
  script:
    - cargo build --workspace --all-features
    - cargo test --workspace --all-features
  ```
- [ ] Update `./do build` to include `--all-features` flag.
- [ ] Update `./do test` to include `--all-features` flag.
- [ ] Update `./do presubmit` and `./do ci` commands to propagate `--all-features` to build and test steps.
- [ ] Add the feature-audit script from step 1 into `./do lint` so it runs on every presubmit.

## 3. Code Review
- [ ] Confirm no workspace crate declares optional features that enable or disable core business logic.
- [ ] Confirm CI jobs explicitly pass `--all-features` to both `cargo build` and `cargo test`.
- [ ] Confirm the `./do` script passes `--all-features` in its `build`, `test`, `presubmit`, and `ci` subcommands.
- [ ] Confirm the feature-audit lint script is integrated into `./do lint`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build --workspace --all-features` — must exit 0.
- [ ] Run `cargo test --workspace --all-features` — must exit 0.
- [ ] Run `./do lint` — must exit 0 (feature audit passes).
- [ ] Run `./do presubmit` — must exit 0.

## 5. Update Documentation
- [ ] Add a comment in any crate `Cargo.toml` that declares features, referencing `[2_TAS-REQ-004E]` and explaining the restriction.
- [ ] Document the `--all-features` CI policy in a comment in the CI config file referencing `[2_TAS-REQ-004F]`.

## 6. Automated Verification
- [ ] Run `cargo build --workspace --all-features 2>&1` — must exit 0.
- [ ] Run `cargo test --workspace --all-features 2>&1` — must exit 0.
- [ ] Run the feature-audit script and confirm it prints no violations and exits 0.
- [ ] If CI config exists, run `grep -c '\-\-all-features' .gitlab-ci.yml` and confirm the count is >= 2 (at least one build and one test invocation).
