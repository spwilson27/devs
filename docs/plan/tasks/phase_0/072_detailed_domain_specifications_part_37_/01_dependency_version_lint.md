# Task: Authoritative Dependency Version Lint (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-435]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a Python test script `tests/test_dependency_lint.py` that:
    - Creates a mock `docs/plan/specs/2_tas.md` with a §2.2 table containing `tokio = "1.38"`.
    - Creates a mock `Cargo.toml` using `tokio = "1.38"`.
    - Asserts that the lint script passes.
    - Creates a mock `Cargo.toml` using `serde = "1.0"` (not in the mock spec).
    - Asserts that the lint script fails with an "undocumented dependency" error.
    - Creates a mock `Cargo.toml` using `tokio = "1.37"` (mismatched version).
    - Asserts that the lint script fails with a "version mismatch" error.

## 2. Task Implementation
- [ ] Implement `.tools/check_dependency_versions.py`.
    - The script must parse `docs/plan/specs/2_tas.md` to find the markdown table under `### 2.2 Core Dependencies` and `#### 2.2.1 Dependency Audit Rule` (actually §2.2 includes multiple tables).
    - Extract Crate name and Version from the tables.
    - Use `cargo metadata --format-version 1 --no-deps` to get all direct dependencies for all workspace members.
    - Compare the metadata output against the extracted authoritative list.
    - Exclude `[dev-dependencies]` from the check as per [2_TAS-REQ-007] (or handle them separately using the dev-dependency table in §2.2).
- [ ] Update `./do lint` in the root directory to invoke this script.

## 3. Code Review
- [ ] Verify the markdown parser for the dependency table is robust (handles varying whitespace and pipe characters).
- [ ] Ensure the script correctly handles workspace-level dependencies if `[workspace.dependencies]` is used.
- [ ] Confirm that error messages are clear and point to the exact `Cargo.toml` and crate causing the failure.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_dependency_lint.py`.
- [ ] Run `./do lint` on the actual codebase and ensure it passes (after ensuring §2.2 matches the current state).

## 5. Update Documentation
- [ ] None required beyond the automated lint itself.

## 6. Automated Verification
- [ ] Add an undocumented dependency to `devs-core/Cargo.toml` and verify `./do lint` fails.
