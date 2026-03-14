# Task: Agent Adapter E2E Completeness Gate (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-010]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write a test `test_adapter_registry_lists_all_five_adapters` that imports the adapter registry and asserts exactly five adapters are registered: `claude`, `gemini`, `opencode`, `qwen`, `copilot`.
- [ ] Write a test `test_adapter_completeness_requires_e2e_test` that verifies the completeness gate logic: given a list of adapter names and a list of E2E test results, an adapter is counted as "complete" only if it has at least one passing E2E test. An adapter with only unit tests (no E2E) must NOT count. Assert that 4 out of 5 adapters with E2E tests yields `completeness = 4/5`, not `5/5`.
- [ ] Write a test `test_adapter_without_e2e_test_is_flagged` that mocks a scenario where one adapter (e.g., `copilot`) has unit tests passing but no E2E test, and asserts the completeness report marks it as incomplete with a descriptive message.
- [ ] Write a test `test_adapter_e2e_test_must_spawn_mock_cli` that validates the E2E test contract: an E2E test for an adapter must invoke the adapter's spawn path against a mock CLI stub and verify correct stage completion signal processing (exit code or structured output).

## 2. Task Implementation
- [ ] Define an `AdapterCompletenessReport` struct with fields: `adapter_name: String`, `unit_tests_pass: bool`, `e2e_tests_pass: bool`, `complete: bool`. The `complete` field is `true` only when both `unit_tests_pass` AND `e2e_tests_pass` are `true`.
- [ ] Implement a completeness gate function `check_adapter_completeness(registry: &AdapterRegistry, e2e_results: &[E2ETestResult]) -> Vec<AdapterCompletenessReport>` that cross-references registered adapters against E2E test results.
- [ ] Integrate this gate into `./do test` so that after the test suite runs, it checks adapter completeness. If any of the five MVP adapters lacks a passing E2E test, emit a warning listing the incomplete adapters. This does NOT cause `./do test` to fail in Phase 0 (adapters are implemented in Phase 1), but the infrastructure must be in place.
- [ ] Define the E2E test contract for adapters: each adapter E2E test must (1) create a mock CLI stub script that echoes a known output and exits with a known code, (2) configure the adapter to use the stub path, (3) invoke `AgentAdapter::spawn()`, (4) assert the `ProcessOutput` matches expected exit code and stdout.
- [ ] Add a `// Covers: 1_PRD-KPI-BR-010` annotation to the completeness gate logic and its tests.

## 3. Code Review
- [ ] Verify the completeness gate cannot be satisfied by unit tests alone — the E2E requirement is structurally enforced, not just documented.
- [ ] Verify the mock CLI stub approach is cross-platform (uses a shell script on Unix, a `.bat`/`.ps1` on Windows).
- [ ] Verify the `AdapterCompletenessReport` is included in `target/traceability.json` or a separate `target/adapter_completeness.json` artifact.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` and confirm all adapter completeness gate tests pass.
- [ ] Run `./do test` and confirm the completeness report is generated (even if incomplete adapters are expected at Phase 0).

## 5. Update Documentation
- [ ] Document the E2E test contract for adapters so that Phase 1 implementers know exactly what constitutes a valid adapter E2E test.

## 6. Automated Verification
- [ ] Run `./do test` and parse the completeness report output. Assert the report lists all five adapter names.
- [ ] Assert that the gate logic correctly marks adapters without E2E tests as incomplete.
