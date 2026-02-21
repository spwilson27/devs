# Task: Presence-check PRD and TAS and implement blueprint locator (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create a unit test at `tests/phase_6/test_blueprint_presence.py` using pytest with the following checks:
  - Test `test_prd_exists()` searches for a PRD file in the canonical locations: `docs/prd.md`, `docs/1_prd.md`, `specs/1_prd.md`, `specs/prd.md` and asserts at least one exists.
  - Test `test_tas_exists()` searches for a TAS file in canonical locations: `docs/tas.md`, `docs/2_tas.md`, `specs/2_tas.md`, `specs/tas.md` and asserts at least one exists.
  - Test `test_locator_api()` imports `blueprint.locator` and asserts `find_prd()` and `find_tas()` return an absolute `pathlib.Path` pointing to an existing file.
  - Tests MUST be purely observational (no network, no modifying repo files) and must run under the repo test runner.

## 2. Task Implementation
- [ ] Implement `src/blueprint/locator.py` with the following API and behavior:
  - `def find_prd() -> pathlib.Path` and `def find_tas() -> pathlib.Path`.
  - Each function scans the canonical path list above in order and returns the first existing `pathlib.Path`.
  - If no file is found, raise a custom `BlueprintNotFoundError(Exception)` with a clear error message listing all locations checked.
  - Include type hints, docstrings, and a small internal unit test helper `list_candidate_paths()`.

## 3. Code Review
- [ ] During self-review ensure:
  - Functions are pure (no side-effects) and only read from disk.
  - Use of `pathlib.Path` for cross-platform correctness.
  - Clear, testable error handling (raise `BlueprintNotFoundError`).
  - Add unit tests to cover negative cases (no file present) and edge cases (file is a symlink, file permissions errors simulated).

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_blueprint_presence.py` (or `py.test` if project uses that) and confirm tests pass.

## 5. Update Documentation
- [ ] Add a section to `docs/architecture_add.md` (create the file if missing) titled "Blueprint Locator" describing canonical file locations, the `blueprint.locator` API, and example usage snippet.

## 6. Automated Verification
- [ ] CI/agent verification command: `pytest -q tests/phase_6/test_blueprint_presence.py && echo "OK" || (echo "FAIL" && exit 1)`
