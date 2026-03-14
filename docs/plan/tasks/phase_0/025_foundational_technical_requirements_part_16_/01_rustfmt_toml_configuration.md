# Task: Create rustfmt.toml Configuration File (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-012A]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a shell-level test (e.g., in a test script or as a `#[test]` in a build-verification crate) that asserts the file `rustfmt.toml` exists at the repository root.
- [ ] Write a test that reads `rustfmt.toml` and asserts it contains exactly these key-value pairs:
  - `edition = "2021"`
  - `max_width = 100`
  - `tab_spaces = 4`
  - `use_small_heuristics = "Default"`
  - `imports_granularity = "Crate"`
  - `group_imports = "StdExternalCrate"`
- [ ] Write a test that runs `cargo fmt --check --all` and asserts it exits 0 (i.e., existing code already conforms or there is no code yet), confirming the config is syntactically valid and accepted by rustfmt.

## 2. Task Implementation
- [ ] Create `rustfmt.toml` at the repository root with the exact authoritative content specified in [2_TAS-REQ-012A]:
```toml
# rustfmt.toml (authoritative)
edition          = "2021"
max_width        = 100
tab_spaces       = 4
use_small_heuristics = "Default"
imports_granularity = "Crate"
group_imports    = "StdExternalCrate"
```
- [ ] Run `cargo fmt --all` to ensure all existing source files conform to the new configuration.

## 3. Code Review
- [ ] Verify the file contains no extra keys beyond the six specified in the requirement.
- [ ] Verify the comment header matches the requirement text.
- [ ] Verify no `.rustfmt.toml` (dot-prefixed) variant exists that could shadow the config.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo fmt --check --all` and confirm exit code 0.
- [ ] Run the verification test(s) written in step 1.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_TAS-REQ-012A` annotation to each test that validates this requirement.

## 6. Automated Verification
- [ ] Run `./do lint` (or the `cargo fmt --check --all` subset) in CI and confirm the formatting check passes with exit code 0.
- [ ] Verify the test output includes a passing test for `rustfmt.toml` content validation.
