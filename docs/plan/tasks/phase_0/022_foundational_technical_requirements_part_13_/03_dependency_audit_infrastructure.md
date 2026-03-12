# Task: Dependency Audit Infrastructure (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-007A], [2_TAS-REQ-007B]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Add an undocumented crate to the `[dependencies]` of any workspace crate in its `Cargo.toml`.
- [ ] Write a test script (or use a temporary bash command) that runs `./do lint` and asserts that it exits with a non-zero status and reports that an undocumented crate was found.

## 2. Task Implementation
- [ ] Create a Python script `scripts/audit_dependencies.py` that implements the logic required by [2_TAS-REQ-007A]:
    - Read the authoritative dependency tables from `docs/plan/requirements/2_tas.md` (or a more machine-readable representation if available).
    - Run `cargo metadata --format-version 1` to get all dependencies.
    - Compare the two sets and exit non-zero if any crate is undocumented or if version ranges don't match.
- [ ] Ensure the script correctly handles `[dev-dependencies]` by comparing them against the authoritative dev-dependency table in TAS (§2.2).
- [ ] Update `./do lint` to include a call to `python3 scripts/audit_dependencies.py`.
- [ ] Ensure that when a new dependency is needed, the process defined in [2_TAS-REQ-007B] is followed (table update first).

## 3. Code Review
- [ ] Verify that the script parses the `cargo metadata` output correctly.
- [ ] Confirm that it correctly identifies both non-dev and dev-only dependencies.
- [ ] Ensure the script handles version constraints correctly (e.g., matching the exact versions or ranges specified in the authoritative table).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes on the current clean codebase.
- [ ] Introduce a dummy undocumented dependency and verify that `./do lint` fails with a clear message.

## 5. Update Documentation
- [ ] Document the process for adding new dependencies (which now requires updating the TAS document table first) in the project's developer guide or `GEMINI.md`.

## 6. Automated Verification
- [ ] Execute `python3 scripts/audit_dependencies.py` and verify its output matches expectations for a valid and an invalid dependency tree.
- [ ] Check the output of `./do lint` to confirm the audit step is running and reporting its status.
