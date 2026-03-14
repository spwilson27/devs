# Task: Fallback Concurrency Limits and Presubmit Warnings (Sub-Epic: 01_mcp_tool_reliability_recovery)

## Covered Requirements
- [FB-BR-004], [FB-BR-005], [FB-BR-006]

## Dependencies
- depends_on: ["06_fallback_registry_data_model_and_validation.md", "07_fallback_state_machine_implementation.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-core/src/fallback/concurrency.rs`.
- [ ] Test that `./do presubmit` exits non-zero if `active_count > 3` in `fallback-registry.json`. A 4th trigger must enter `Blocked` state and require architecture review before activation (FB-BR-004).
- [ ] Test that `./do presubmit` emits exactly one `WARN:` line per `Active` fallback entry. If `active_count > 0` and no WARN lines appear, the test must fail (FB-BR-005).
- [ ] Test that an `Active` fallback past its `expected_retirement_sprint` transitions to `Extended` state. Two sprints in `Extended` triggers the `PRD_Amendment` transition requiring a formal amendment before further work (FB-BR-006).

## 2. Task Implementation
- [ ] Implement `FallbackConcurrencyEnforcer`:
    - [ ] On `./do presubmit`, load `fallback-registry.json` and validate `active_count <= 3`. Exit non-zero if exceeded (FB-BR-004).
    - [ ] Emit one `WARN: Active fallback: <fallback_id>` line to stderr per `Active` entry (FB-BR-005).
- [ ] Implement `FallbackExpirationChecker`:
    - [ ] Compare each `Active` entry's `expected_retirement_sprint` against the current sprint.
    - [ ] If past retirement sprint, transition to `Extended` (FB-BR-006).
    - [ ] If in `Extended` for two or more sprints, transition to `PRD_Amendment` (FB-BR-006).
    - [ ] Report state transitions as lint diagnostics.
- [ ] Integrate both enforcers into `./do presubmit` and `./do lint`.

## 3. Code Review
- [ ] Verify that sprint comparison logic correctly handles sprint naming conventions.
- [ ] Ensure WARN output format is stable and parseable by CI tooling.
- [ ] Verify that the `Blocked` state is correctly reported and blocks further activation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib fallback::concurrency`
- [ ] Run `./do presubmit` with test fixtures having 0, 1, 3, and 4 active fallbacks to verify correct behavior.
- [ ] Run `./do test` and verify traceability for FB-BR-004, FB-BR-005, FB-BR-006.

## 5. Update Documentation
- [ ] Document concurrency limits and WARN output format in `docs/plan/specs/8_risks_mitigation.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[FB-BR-004]`, `[FB-BR-005]`, `[FB-BR-006]` as covered.
