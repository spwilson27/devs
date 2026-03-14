# Task: Fallback Activation Protocol and Lint Rules (Sub-Epic: 01_mcp_tool_reliability_recovery)

## Covered Requirements
- [FB-PROTO-001], [FB-PROTO-002], [FB-PROTO-003], [FB-BR-001], [FB-BR-002], [FB-BR-003], [FB-BR-010], [FB-BR-011], [FB-BR-012]

## Dependencies
- depends_on: [06_fallback_registry_data_model_and_validation.md, 07_fallback_state_machine_implementation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-core/src/fallback/activation.rs`.
- [ ] Test that a git diff containing both a FAR file (`docs/adr/NNNN-fallback-*.md`) and implementation files in the same commit is rejected by lint (FB-PROTO-001, FB-BR-001).
- [ ] Test that if the trigger condition self-resolves before the FAR commit, any partially-drafted FAR file must be deleted and `fallback-registry.json` must not be updated (FB-PROTO-002).
- [ ] Test that `commit_sha` in FAR frontmatter must be updated within 24 hours of the implementation commit. After 24 hours, a stale empty `commit_sha` produces a lint warning (FB-PROTO-003).
- [ ] Test that pre-approved fallbacks (marked "Yes") still require a FAR in `docs/adr/` before implementation code (FB-BR-002).
- [ ] Test that fallbacks requiring PRD amendment or architecture review cannot be activated without the amendment/review committed first (FB-BR-003).
- [ ] Test that fallback implementations are confined to minimum scope: no new external crate dependencies or new public API surface without PRD amendment (FB-BR-010).
- [ ] Test that the `## Trigger` section in every FAR contains at least one numeric metric value. Qualitative-only descriptions are rejected (FB-BR-011).
- [ ] Test that platform-conditional fallbacks use `#[cfg(windows)]` compile-time guards. Runtime `if cfg!(target_os = ...)` is permitted only when compile-time guards are insufficient. Catch-all implementations altering Linux/macOS behavior are prohibited (FB-BR-012).

## 2. Task Implementation
- [ ] Implement `FallbackActivationLinter` in the `./do lint` pipeline:
    - [ ] Scan git diff for commits containing both `docs/adr/NNNN-fallback-*.md` and implementation files; reject combined commits (FB-PROTO-001, FB-BR-001).
    - [ ] Validate FAR frontmatter `commit_sha` staleness against 24-hour window (FB-PROTO-003).
    - [ ] Parse FAR `## Trigger` section body and assert presence of at least one digit character (FB-BR-011).
- [ ] Implement `FallbackActivationValidator`:
    - [ ] Enforce FAR-before-implementation ordering for all fallbacks including pre-approved ones (FB-BR-002).
    - [ ] For fallbacks requiring amendment/review, verify amendment/review doc exists and is committed before activation (FB-BR-003).
    - [ ] Check that fallback implementation diffs do not add new `[dependencies]` entries in `Cargo.toml` or new `pub fn`/`pub struct` declarations beyond minimum scope (FB-BR-010).
- [ ] Implement `PlatformGuardChecker` for FB-BR-012:
    - [ ] Scan platform-conditional fallback code for `#[cfg(windows)]` vs runtime guards.
    - [ ] Flag catch-all implementations that modify Linux/macOS behavior.
- [ ] Implement cancelled activation cleanup: delete partial FAR files, skip registry update (FB-PROTO-002).

## 3. Code Review
- [ ] Verify that the git diff scanning correctly handles merge commits and rebases.
- [ ] Ensure the `## Trigger` numeric check handles edge cases (e.g., numbers in code blocks, version strings).
- [ ] Verify platform guard checking handles `cfg` attribute variants (`cfg_attr`, `cfg!`, `#[cfg(...)]`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib fallback::activation`
- [ ] Run `./do lint` on test fixtures with intentionally invalid fallback commits.
- [ ] Run `./do test` and verify traceability for FB-PROTO-001, FB-PROTO-002, FB-PROTO-003, FB-BR-001, FB-BR-002, FB-BR-003, FB-BR-010, FB-BR-011, FB-BR-012.

## 5. Update Documentation
- [ ] Document the fallback activation protocol and lint rules in `docs/plan/specs/8_risks_mitigation.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[FB-PROTO-001]`, `[FB-PROTO-002]`, `[FB-PROTO-003]`, `[FB-BR-001]`, `[FB-BR-002]`, `[FB-BR-003]`, `[FB-BR-010]`, `[FB-BR-011]`, `[FB-BR-012]` as covered.
