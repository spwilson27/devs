# Task: Enforce Feature Flag Constraints (Sub-Epic: 021_Foundational Technical Requirements (Part 12))

## Covered Requirements
- [2_TAS-REQ-004E]

## Dependencies
- depends_on: [01_configure_root_manifest.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python script `check_features.py` that parses `Cargo.toml` and ensures:
    - No `[features]` are declared that do not match the allowed list (only `rustls-tls` in `reqwest` and test-only flags).
    - It should scan all `Cargo.toml` files in the workspace.
- [ ] Run this script against a dummy `Cargo.toml` with prohibited features to verify it fails.

## 2. Task Implementation
- [ ] Implement the `check_features.py` script as part of the project's linting tools in `.tools/`.
- [ ] Integrate `check_features.py` into the `./do lint` command.
- [ ] Add a section in `docs/plan/specs/2_tas.md` explicitly listing the permitted feature flags (e.g., `wasm` in `axel-platform`, etc., as per [2_TAS-REQ-004E] and related requirements).
- [ ] Ensure that any existing `Cargo.toml` (if any crates have been added) complies with these rules.

## 3. Code Review
- [ ] Verify that the script correctly distinguishes between required features in `[dependencies]` and optional features in `[features]`.
- [ ] Verify that the `rustls-tls` exception for `reqwest` is correctly handled.
- [ ] Confirm that test-only flags (e.g., `#[cfg(test)]`) are not caught by the check if they are not in the `[features]` table.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it executes `check_features.py` and passes for the current state of the workspace.
- [ ] Manually add a prohibited feature to a crate's `Cargo.toml` and confirm `./do lint` fails.

## 5. Update Documentation
- [ ] Document the feature flag policy in the developer guide or `GEMINI.md`.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure it completes without errors.
- [ ] Execute `.tools/verify_requirements.py` to confirm coverage of [2_TAS-REQ-004E].
