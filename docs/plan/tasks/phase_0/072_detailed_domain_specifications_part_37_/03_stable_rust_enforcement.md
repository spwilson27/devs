# Task: Stable Rust Enforcement (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-438]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test script `tests/test_stable_rust_lint.py` that:
    - Creates a temporary `.rs` file with `#![feature(async_closure)]`.
    - Asserts that the stable-rust lint script correctly identifies the feature gate.
    - Creates a temporary `.rs` file with `#[cfg(feature = "some-feature")]` (allowed).
    - Asserts that the lint script correctly passes on allowed attributes.

## 2. Task Implementation
- [ ] Implement `.tools/check_stable_rust.py` to scan all `.rs` files for the presence of the `feature` attribute at either the crate level (`#!`) or the module/item level (`#`).
- [ ] Use a regex like `r"#!?\[feature\(.*\)\]"` for the scan.
- [ ] The script must fail (exit non-zero) if any occurrence is found.
- [ ] Update `./do lint` in the root directory to invoke this script.

## 3. Code Review
- [ ] Ensure that the regex is robust enough to catch common variants (whitespace, multiline) while avoiding false positives like comments.
- [ ] Verify that it scans all crates in the workspace.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_stable_rust_lint.py`.
- [ ] Run `./do lint` and ensure it passes on the current clean state.

## 5. Update Documentation
- [ ] None required.

## 6. Automated Verification
- [ ] Intentionally add `#![feature(test)]` to `devs-core/src/lib.rs` and verify `./do lint` fails.
