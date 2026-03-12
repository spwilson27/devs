# Task: Implement ADR Crate Name Lint (Sub-Epic: 45_Risk 016 Verification)

## Covered Requirements
- [AC-RISK-016-05]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a unit test for the new lint script (e.g., in a Python test file or by running the script against a mock directory) that:
  - Asserts success when all crate names in ADRs exist in `Cargo.toml`.
  - Asserts failure (non-zero exit) when an ADR references a crate name that is not a member of the Cargo workspace.
- [ ] Create a mock ADR file `docs/adr/9999-invalid-crate.md` that references a crate name like `"non-existent-crate"`.
- [ ] Run the lint script and confirm it detects the invalid crate name.

## 2. Task Implementation
- [ ] Create a Python script `scripts/lint_adr_crates.py` (or similar) that:
  - Parses `Cargo.toml` to extract the list of workspace members.
  - Scans `docs/adr/*.md` for crate names. Crate names are usually identified by context (e.g., in the title `NNNN-<crate-name>-design.md` or mentioned as `"crate: <name>"`).
  - Validates that every extracted crate name is in the workspace members list.
- [ ] Update `./do lint` to execute this script.
- [ ] Ensure the script provides clear error messages identifying the file and the invalid crate name.

## 3. Code Review
- [ ] Verify the parsing logic for `Cargo.toml` handles both inline and multiline `members` lists.
- [ ] Ensure the script correctly handles ADR file name patterns like `NNNN-<crate-name>-design.md`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the current workspace and confirm it passes (all current ADRs should reference valid crates).
- [ ] Temporarily add an ADR with a bogus crate name and confirm `./do lint` fails.

## 5. Update Documentation
- [ ] Add the new lint check to the "Verification" section of `docs/plan/specs/8_risks_mitigation.md` or internal developer notes.
- [ ] Record the implementation of `AC-RISK-016-05` in the agent's memory.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `AC-RISK-016-05` is covered.
