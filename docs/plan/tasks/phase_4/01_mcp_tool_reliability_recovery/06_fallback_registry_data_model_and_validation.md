# Task: Fallback Registry Data Model and Validation (Sub-Epic: 01_mcp_tool_reliability_recovery)

## Covered Requirements
- [FB-DATA-001], [FB-DATA-002], [FB-DATA-003], [FB-DATA-004], [FB-BR-007]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-core/src/fallback/registry.rs`.
- [ ] Test that `FallbackRegistry` deserialized from `fallback-registry.json` correctly computes `active_count` and that it must equal the count of entries where `status == "Active"`. Any mismatch must return a validation error (FB-DATA-001).
- [ ] Test that every `adr_path` for a non-`Retired` entry references an existing file. A missing ADR file must return a fatal validation error (FB-DATA-002).
- [ ] Test that duplicate `fallback_id` values with non-`Retired` status produce a fatal validation error (FB-DATA-003).
- [ ] Test that an `Active` entry with `activated_at` more than 24 hours in the past and an empty `commit_sha` produces a lint warning (FB-DATA-004).
- [ ] Test that inconsistencies between `fallback-registry.json` `active_count` and individual FAR frontmatter metadata produce a fatal lint error (FB-BR-007).

## 2. Task Implementation
- [ ] Define the `FallbackRegistry` struct with fields: `active_count: u32`, `entries: Vec<FallbackEntry>`.
- [ ] Define `FallbackEntry` with fields: `fallback_id: String`, `status: FallbackStatus`, `adr_path: PathBuf`, `commit_sha: String`, `activated_at: Option<DateTime<Utc>>`, `expected_retirement_sprint: Option<String>`.
- [ ] Implement `FallbackRegistry::validate(&self, repo_root: &Path) -> Result<Vec<LintDiagnostic>>`:
    - [ ] Count entries with `status == Active` and compare to `active_count` (FB-DATA-001, fatal error on mismatch).
    - [ ] For each non-`Retired` entry, check `adr_path` exists relative to `repo_root` (FB-DATA-002, fatal error if missing).
    - [ ] Check for duplicate `fallback_id` among non-`Retired` entries (FB-DATA-003, fatal error).
    - [ ] For `Active` entries with `activated_at` > 24h ago and empty `commit_sha`, emit warning (FB-DATA-004).
- [ ] Implement FAR frontmatter parser to cross-validate against registry entries (FB-BR-007).
- [ ] Integrate validation into `./do lint` pipeline.

## 3. Code Review
- [ ] Verify that all validation errors are classified correctly (fatal vs. warning).
- [ ] Ensure `fallback-registry.json` schema is clearly defined and documented.
- [ ] Verify that FAR frontmatter cross-validation covers `status`, `fallback_id`, and `commit_sha` fields.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib fallback::registry`
- [ ] Run `./do lint` on a repo with intentionally invalid `fallback-registry.json` and verify errors are caught.
- [ ] Run `./do test` and verify traceability for FB-DATA-001, FB-DATA-002, FB-DATA-003, FB-DATA-004, FB-BR-007.

## 5. Update Documentation
- [ ] Document the `fallback-registry.json` schema in `docs/plan/specs/8_risks_mitigation.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[FB-DATA-001]`, `[FB-DATA-002]`, `[FB-DATA-003]`, `[FB-DATA-004]`, `[FB-BR-007]` as covered.
