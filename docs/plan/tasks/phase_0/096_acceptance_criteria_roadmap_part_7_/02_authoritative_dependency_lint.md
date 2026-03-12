# Task: Authoritative Dependency Lint (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-ROAD-P0-007]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/verify_dependency_lint.sh` that:
    - Temporarily adds a "rogue" dependency (e.g., `left-pad = "0.0.1"`) to `crates/devs-core/Cargo.toml`.
    - Runs `./do lint`.
    - Asserts that `./do lint` exits with a non-zero code and prints an error message about the unauthorized dependency.
    - Cleans up the `Cargo.toml` change.

## 2. Task Implementation
- [ ] Create a Python script `.tools/check_dependencies.py` that:
    - Parses `Cargo.lock` to extract all production dependencies (excluding `[dev-dependencies]`).
    - Compares the extracted list against the authoritative table in `docs/plan/specs/2_tas.md` (§2.2).
    - Exits non-zero if any dependency is found that is not in the approved list or has a version mismatch.
- [ ] Update the `./do` script's `lint` subcommand to invoke `python3 .tools/check_dependencies.py`.
- [ ] Ensure all currently used dependencies are added to the authoritative list in `docs/plan/specs/2_tas.md`.

## 3. Code Review
- [ ] Verify that the script correctly distinguishes between production and dev-only dependencies.
- [ ] Ensure the error output clearly identifies the offending dependency and its version.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the clean repository (should pass).
- [ ] Run `bash tests/verify_dependency_lint.sh` (should pass/fail correctly).

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that adding new production dependencies requires updating the authoritative table in TAS §2.2.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P0-007] as covered.
