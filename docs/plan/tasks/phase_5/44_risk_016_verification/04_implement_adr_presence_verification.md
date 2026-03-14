# Task: Implement ADR Presence Verification for Workspace Crates (Sub-Epic: 44_Risk 016 Verification)

## Covered Requirements
- [AC-RISK-016-01]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write a test script `tests/verify/adr_presence_test.sh` (or Rust test `tests/traceability/adr_presence_test.rs`) that:
  1. Parses `Cargo.toml` to extract all workspace member crate names
  2. Scans `docs/adr/` for ADR files matching the pattern `NNNN-<crate-name>-design.md`
  3. For each crate without a matching ADR, records a failure
  4. Exits non-zero if any crate lacks an ADR
- [ ] Write a unit test in `crates/devs-core/src/adr/validation.rs` (create if needed) that:
  1. Tests the ADR filename pattern matching logic
  2. Tests crate name normalization (e.g., `devs-core` vs `devs_core`)
- [ ] Add `// Covers: AC-RISK-016-01` annotation to the tests.
- [ ] Tests should initially fail because the verification logic does not yet exist.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/adr/validation.rs` with:
  ```rust
  pub struct AdrValidator {
      workspace_members: Vec<String>,
      adr_directory: PathBuf,
  }
  
  impl AdrValidator {
      pub fn new(workspace_root: &Path) -> Result<Self>;
      pub fn validate_all_crates_have_adrs(&self) -> Result<(), Vec<AdrMissingError>>;
      pub fn find_adr_for_crate(&self, crate_name: &str) -> Option<PathBuf>;
  }
  ```
- [ ] Implement the validation logic:
  - Parse `Cargo.toml` using `toml` crate to extract `workspace.members`
  - Scan `docs/adr/` directory for files matching `NNNN-*.md` pattern
  - Match crate names to ADR filenames (handle `-` vs `_` normalization)
- [ ] Integrate the validator into `./do lint`:
  - Add a new lint step `check-adr-presence` that runs the validator
  - Exit non-zero with a list of missing ADRs if validation fails
- [ ] Create missing ADRs for any existing crates that lack them (use the ADR template from `docs/adr/`).

## 3. Code Review
- [ ] Verify the ADR filename pattern is robust and handles edge cases.
- [ ] Ensure the error message lists all missing ADRs in a single report.
- [ ] Confirm the `./do lint` integration follows the existing lint step pattern.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-core adr_validation` and ensure all tests pass.
- [ ] Run `./do lint` and verify the ADR presence check is executed.
- [ ] Temporarily remove an ADR and confirm `./do lint` fails with the correct error.

## 5. Update Documentation
- [ ] Create ADR files for any crates missing them (follow the pattern in `docs/adr/0001-phase-0-complete.md`).
- [ ] Document the ADR naming convention in `docs/adr/README.md` (create if needed).
- [ ] Add `AC-RISK-016-01` to the traceability mapping.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `AC-RISK-016-01` is marked as covered.
- [ ] Run `./do presubmit` and verify the ADR check is part of the presubmit gate.
