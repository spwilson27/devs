# Task: Fallback Retirement Protocol (Sub-Epic: 01_mcp_tool_reliability_recovery)

## Covered Requirements
- [FB-RET-001], [FB-RET-002], [FB-RET-003], [FB-BR-008], [FB-BR-009]

## Dependencies
- depends_on: ["06_fallback_registry_data_model_and_validation.md", "07_fallback_state_machine_implementation.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-core/src/fallback/retirement.rs`.
- [ ] Test that a fallback which required PRD amendment or architecture review must have the corresponding document updated to reflect retirement before the retirement commit is merged (FB-RET-001).
- [ ] Test that a fallback in `Retiring` state must complete retirement within one sprint. If not, it reverts to `Active` with `expected_retirement_sprint` updated to the next sprint (FB-RET-002).
- [ ] Test that retired FAR files are never deleted. `./do lint` must verify that every `Retired` entry in `fallback-registry.json` has a readable `adr_path` (FB-RET-003, FB-BR-009).
- [ ] Test that retiring a fallback which lowered a quality gate restores the gate to its original threshold, and that the threshold restoration and implementation revert are in the same commit (FB-BR-008).

## 2. Task Implementation
- [ ] Implement `FallbackRetirementValidator`:
    - [ ] On retirement transition, check if the fallback had a PRD amendment or architecture review. If so, verify the corresponding document has a retirement update (FB-RET-001).
    - [ ] Track `Retiring` state duration against sprint boundaries. Auto-revert to `Active` if one sprint elapses without completion (FB-RET-002).
    - [ ] Verify retired FAR files exist and are readable (FB-RET-003, FB-BR-009).
- [ ] Implement `QualityGateRestorer`:
    - [ ] When a fallback that lowered a quality gate is retired, verify the retirement commit restores the gate threshold to its original value (FB-BR-008).
    - [ ] Scan the retirement commit diff for quality gate configuration changes and implementation reverts, ensuring they are in the same commit (FB-BR-008).
- [ ] Integrate retirement validation into `./do lint` pipeline.

## 3. Code Review
- [ ] Verify that sprint boundary detection handles edge cases (sprint transitions mid-week).
- [ ] Ensure quality gate restoration detection correctly identifies gate threshold values in config files.
- [ ] Verify that the same-commit constraint for FB-BR-008 handles both `./do` script changes and Cargo config changes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib fallback::retirement`
- [ ] Run `./do lint` with test fixtures containing improperly retired fallbacks.
- [ ] Run `./do test` and verify traceability for FB-RET-001, FB-RET-002, FB-RET-003, FB-BR-008, FB-BR-009.

## 5. Update Documentation
- [ ] Document the retirement protocol and quality gate restoration rules in `docs/plan/specs/8_risks_mitigation.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[FB-RET-001]`, `[FB-RET-002]`, `[FB-RET-003]`, `[FB-BR-008]`, `[FB-BR-009]` as covered.
