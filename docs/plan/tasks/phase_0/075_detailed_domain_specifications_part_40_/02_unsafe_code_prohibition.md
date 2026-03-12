# Task: Unsafe Code Prohibition (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-452]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_unsafe_prohibition.sh` that attempts to add a small unsafe block in a Rust source file and asserts that the verification fails.
- [ ] The test should verify that:
    - Adding `unsafe { ... }` in any source file is caught by the lint.
    - `cargo clippy` fails if `unsafe_code` is allowed.

## 2. Task Implementation
- [ ] Add `#![forbid(unsafe_code)]` to the top level of all library crates (e.g., `src/lib.rs` for each crate).
- [ ] Update workspace `Cargo.toml` or individual crate configs to deny unsafe code via Clippy:
    ```toml
    [workspace.lints.rust]
    unsafe_code = "forbid"
    ```
- [ ] Add a grep-based check in `./do lint` (or equivalent) to ensure no source file contains the string `unsafe`:
    - Command: `grep -r "unsafe" src/`
    - Ensure it returns zero matches (excluding possible allow-listed comments or external crates).
- [ ] Integrate these checks into `./do lint`.

## 3. Code Review
- [ ] Verify that `forbid(unsafe_code)` is used instead of `deny` where appropriate to prevent overrides.
- [ ] Ensure the grep-based check doesn't have false positives (e.g., in documentation or strings if necessary, though REQ-452 says "does not appear in any Rust source file").

## 4. Run Automated Tests to Verify
- [ ] Run `tests/verify_unsafe_prohibition.sh` and ensure it passes.
- [ ] Run `./do lint` and ensure it passes on the current codebase.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to document the strict "No Unsafe" policy for the project.

## 6. Automated Verification
- [ ] Run `./do lint` and verify it checks for unsafe code and passes.
