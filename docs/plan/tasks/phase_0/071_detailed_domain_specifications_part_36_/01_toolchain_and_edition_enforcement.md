# Task: Foundation - Toolchain and Rust Edition Enforcement (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-433], [2_TAS-REQ-434]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Add a new check to `.tools/verify_requirements.py` or a dedicated shell script in `.tools/check_edition.sh` that iterates over every `Cargo.toml` in the workspace and verifies it contains `edition = "2021"`.
- [ ] Add a test case to ensure that if a `Cargo.toml` is found with a different edition, the script exits non-zero.
- [ ] Verify that `rust-toolchain.toml` exists at the root and contains the correct channel and components as specified in `[2_TAS-REQ-004]`.

## 2. Task Implementation
- [ ] Create (if missing) `rust-toolchain.toml` at the repository root with:
  ```toml
  [toolchain]
  channel = "stable"
  components = ["rustfmt", "clippy", "llvm-tools-preview"]
  ```
- [ ] Ensure all existing crates (e.g., `devs-proto`, `devs-core`) have `edition = "2021"` in their `Cargo.toml`.
- [ ] Update `./do lint` to include the edition check script.

## 3. Code Review
- [ ] Verify that no nightly-only attributes or features are used in any crate.
- [ ] Verify that the `rust-toolchain.toml` version matches or exceeds the minimum version requirement (1.80.0).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes.
- [ ] Manually change one `Cargo.toml` to `edition = "2018"` and verify that `./do lint` fails.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to record that toolchain pinning and edition enforcement are active.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure all requirements are mapped and covered.
