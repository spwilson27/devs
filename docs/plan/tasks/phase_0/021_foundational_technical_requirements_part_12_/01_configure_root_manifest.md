# Task: Configure Root Cargo Manifest (Sub-Epic: 021_Foundational Technical Requirements (Part 12))

## Covered Requirements
- [2_TAS-REQ-004B], [2_TAS-REQ-004C], [2_TAS-REQ-004D]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `verify_root_manifest.sh` that checks `Cargo.toml` for the following:
    - `resolver = "2"` in `[workspace]`.
    - `unsafe_code = "deny"` in `[workspace.lints.rust]`.
    - The presence of `[profile.dev]`, `[profile.release]`, and `[profile.test]` with the exact settings specified in §2.7.3.
- [ ] Run this script and verify it fails if `Cargo.toml` is missing or missing these settings.

## 2. Task Implementation
- [ ] Create a `Cargo.toml` file at the repository root.
- [ ] Add the following content:
```toml
[workspace]
resolver = "2"
members = [] # Crates will be added as they are created

[workspace.lints.rust]
unsafe_code = "deny"

[profile.dev]
opt-level = 0
debug     = true
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
- [ ] Update `./do lint` to ensure it checks workspace lints.

## 3. Code Review
- [ ] Verify that `resolver = "2"` is correctly placed within the `[workspace]` table.
- [ ] Verify that the release profile uses `panic = "abort"` for consistent error handling.
- [ ] Verify that the `unsafe_code` lint is applied at the workspace level for all member crates.

## 4. Run Automated Tests to Verify
- [ ] Run `verify_root_manifest.sh` and ensure it passes.
- [ ] Run `cargo check` to verify the manifest is valid.

## 5. Update Documentation
- [ ] Update the `README.md` to mention the use of the v2 feature resolver and the prohibition of unsafe code.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure it completes without errors related to the manifest.
- [ ] Execute `.tools/verify_requirements.py` to confirm coverage of [2_TAS-REQ-004B], [2_TAS-REQ-004C], and [2_TAS-REQ-004D].
