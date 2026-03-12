# Task: Rust Formatting and Clippy Policy Enforcement (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-012A], [2_TAS-REQ-012B], [2_TAS-REQ-012C], [2_TAS-REQ-012D]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a test script in `tests/test_lint_policy.py` that verifies:
    - `rustfmt.toml` exists and contains the authoritative settings.
    - `./do lint` fails if formatting is incorrect but passes after `./do format`.
    - `./do lint` fails if clippy warnings are present.
    - `./do lint` fails if a `#[allow(clippy::...)]` attribute is present without a `// REASON:` comment on the same or preceding line.
    - `./do lint` passes if a `#[allow(clippy::...)]` attribute is present WITH a `// REASON:` comment.

## 2. Task Implementation
- [ ] Create `rustfmt.toml` at the repository root with the authoritative content:
    ```toml
    edition          = "2021"
    max_width        = 100
    tab_spaces       = 4
    use_small_heuristics = "Default"
    imports_granularity = "Crate"
    group_imports    = "StdExternalCrate"
    ```
- [ ] Update `./do` script to implement `./do format`:
    - Command: `cargo fmt --all`.
- [ ] Update `./do` script to implement or enhance `./do lint`:
    - Run `cargo fmt --check --all`.
    - Run `cargo clippy --workspace --all-targets --all-features -- -D warnings`.
    - Implement a custom check (e.g., via `grep` or a small Python script) that scans for `#[allow(clippy::` and ensures it is followed by `// REASON:`.
    - Ensure `./do lint` collects all failures before exiting with a non-zero status if any check failed.

## 3. Code Review
- [ ] Verify that `rustfmt.toml` settings match exactly what is specified in [2_TAS-REQ-012A].
- [ ] Confirm that `format` and `lint` are distinct commands and `lint` does not mutate files [2_TAS-REQ-012B].
- [ ] Ensure clippy is invoked with all targets and features as per [2_TAS-REQ-012C].
- [ ] Verify the clippy suppression policy enforcement handles multiline attributes and edge cases.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure `tests/test_lint_policy.py` passes.
- [ ] Manually verify by adding a violation (e.g., an allowed lint without a reason) and running `./do lint`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the completion of formatting and linting policy enforcement.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_TAS-REQ-012A], [2_TAS-REQ-012B], [2_TAS-REQ-012C], and [2_TAS-REQ-012D] are correctly covered by tests.
