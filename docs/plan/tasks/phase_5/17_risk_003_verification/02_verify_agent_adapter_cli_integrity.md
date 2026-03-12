# Task: Verify Agent Adapter CLI Integrity (Sub-Epic: 17_Risk 003 Verification)

## Covered Requirements
- [RISK-004], [RISK-004-BR-001], [RISK-004-BR-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-adapters/src/rate_limit_tests.rs`.
- [ ] Test 1 (`test_rate_limit_zero_exit_code`): Create an adapter instance. Call `detect_rate_limit()` with `exit_code = 0` and stderr containing known rate-limit patterns (e.g., "Rate limit exceeded", "too many requests"). Verify it returns `false`. `[RISK-004-BR-001]`
- [ ] Create a lint test script or use `./do lint` to scan for literal string flags in adapter `build_command` implementations. `[RISK-004-BR-002]`

## 2. Task Implementation
- [ ] Update `devs_adapters::AgentAdapter::detect_rate_limit()` for each adapter (Claude, Gemini, etc.) to explicitly return `false` early if `exit_code == 0`.
- [ ] Refactor all adapter command-line flags (e.g., `-p`, `--prompt`, `--model`) into `const &str` declarations in `crates/devs-adapters/src/<adapter>/config.rs`.
- [ ] Update `build_command()` in each adapter to use these `const &str` values instead of literal strings.
- [ ] Implement a custom lint check in `.tools/lint_adapter_flags.py` (referenced by `./do lint`) that verifies no literal string flags are passed to `process::Command::arg()` or `Command::args()` within the `devs-adapters` crate.

## 3. Code Review
- [ ] Ensure that `detect_rate_limit()` is robust and its logic is consistent across all adapters.
- [ ] Verify that `const` flags are named descriptively (e.g., `FLAG_PROMPT`, `FLAG_MODEL`).
- [ ] Confirm the lint script has zero false positives and correctly identifies forbidden literals.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters --lib rate_limit_tests`.
- [ ] Run `./do lint` and ensure it checks for `[RISK-004-BR-002]` violations.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_5/17_risk_003_verification/02_verify_agent_adapter_cli_integrity.md` with "Completed" status if applicable.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `RISK-004-BR-001` and `RISK-004-BR-002` as covered.
- [ ] Verify that `RISK-004` (the overall risk) is annotated in at least one test.
