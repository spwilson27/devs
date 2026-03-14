# Task: Verify Agent Adapter CLI Integrity and Rate Limit Detection (Sub-Epic: 17_Risk 003 Verification)

## Covered Requirements
- [RISK-004], [RISK-004-BR-001], [RISK-004-BR-002]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create a unit test file `crates/devs-adapters/tests/rate_limit_detection_tests.rs` with the following test functions:
- [ ] **Test 1 (`test_rate_limit_zero_exit_code`)** `[RISK-004-BR-001]`:
  - For each of the 5 adapters (Claude, Gemini, OpenCode, Qwen, Copilot):
    - Create a `ProcessOutput` mock with `exit_code: 0` and `stderr` containing known rate-limit patterns:
      - "Rate limit exceeded"
      - "too many requests"
      - "rate_limited"
      - "429 Too Many Requests"
    - Call `AgentAdapter::detect_rate_limit(&output)`.
    - Assert it returns `false` (or `None<RateLimitInfo>`) regardless of stderr content.
    - Document in a comment: "Zero exit code unambiguously signals success, not a rate limit."
- [ ] **Test 2 (`test_rate_limit_nonzero_exit_with_patterns`)** `[RISK-004]`:
  - For each adapter, create `ProcessOutput` with `exit_code: 1` (or non-zero) and stderr containing rate-limit patterns.
  - Assert that `detect_rate_limit()` returns `true` (or `Some(RateLimitInfo)`) when patterns match.
  - Verify the returned `RateLimitInfo` includes the matched pattern and a `cooldown_until` timestamp.
- [ ] Create an integration test file `crates/devs-adapters/tests/adapter_flag_constants_tests.rs`:
- [ ] **Test 3 (`test_adapter_flags_are_const`)** `[RISK-004-BR-002]`:
  - This test is a compile-time check: verify that all adapter flag constants are defined as `pub const &str` in each adapter's `config.rs` module.
  - Use a script-based lint check (see Implementation section) that scans the source files.
  - The test should read each adapter's `config.rs` and verify it contains `pub const` declarations for flags like `FLAG_PROMPT`, `FLAG_MODEL`, `FLAG_SYSTEM`, etc.
  - Assert that no inline string literals (e.g., `cmd.arg("-p")` or `cmd.arg("--prompt")`) appear in `build_command()` implementations.

## 2. Task Implementation
- [ ] **Rate Limit Detection Logic** `[RISK-004-BR-001]`:
  - Update `AgentAdapter::detect_rate_limit()` in each adapter implementation (`crates/devs-adapters/src/claude/adapter.rs`, `gemini/`, `opencode/`, `qwen/`, `copilot/`):
    - Add an early return: `if output.exit_code == 0 { return None; }`.
    - This ensures zero exit code never triggers rate limit detection.
  - Implement case-insensitive substring matching for rate-limit patterns in stderr:
    - Use `stderr.to_lowercase().contains(&pattern.to_lowercase())`.
    - Do NOT add the `regex` crate dependency (per `[RISK-004-BR-004]`).
    - Patterns to match (per adapter compatibility table):
      - Claude: "Rate limit exceeded", "too many requests"
      - Gemini: "RESOURCE_EXHAUSTED", "quota exceeded"
      - OpenCode: "rate_limited", "429"
      - Qwen: (patterns as documented)
      - Copilot: "rate limited", "too many requests"
- [ ] **Adapter Flag Constants** `[RISK-004-BR-002]`:
  - For each adapter, create or update `crates/devs-adapters/src/<name>/config.rs`:
    - Define all CLI flags as `pub const &str`:
      ```rust
      pub const FLAG_PROMPT: &str = "--prompt";
      pub const FLAG_MODEL: &str = "--model";
      pub const FLAG_SYSTEM: &str = "--system";
      pub const FLAG_VERSION: &str = "--version";
      ```
    - Update `build_command()` to use these constants:
      ```rust
      cmd.arg(FLAG_PROMPT).arg(&invocation.prompt);
      ```
  - Remove all inline string literals from `build_command()` implementations.
- [ ] **Lint Script for Flag Constants** `[RISK-004-BR-002]`:
  - Create `.tools/lint_adapter_flags.py` (or update existing lint tool):
    - Scan all files in `crates/devs-adapters/src/*/adapter.rs`.
    - Use regex to detect `Command::new` followed by `.arg("...")` or `.arg('...')` with literal strings.
    - Exclude matches where the argument is a constant identifier (starts with uppercase or `FLAG_` prefix).
    - Exit with code 1 if any inline literals are found, listing the file and line number.
    - Exit with code 0 if all flags use constants.
  - Integrate this lint check into `./do lint`:
    - Add a call to `python .tools/lint_adapter_flags.py` in the lint script.
    - Ensure failure of this script causes `./do lint` to fail.

## 3. Code Review
- [ ] Verify that `detect_rate_limit()` returns early for `exit_code == 0` in all 5 adapters.
- [ ] Confirm that rate-limit pattern matching is case-insensitive and uses substring search (not regex).
- [ ] Check that all CLI flags in `build_command()` reference `pub const &str` values from `config.rs`.
- [ ] Verify the lint script has zero false positives (doesn't flag legitimate non-flag arguments like file paths).
- [ ] Ensure the lint script correctly identifies violations (test it by temporarily adding an inline literal and confirming it fails).
- [ ] Confirm that `RateLimitInfo` struct includes `cooldown_until: DateTime<Utc>` for absolute timestamp tracking (per pool cooldown requirements).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters --test rate_limit_detection_tests` and verify all 5 adapters pass.
- [ ] Run `cargo test -p devs-adapters --test adapter_flag_constants_tests`.
- [ ] Run `./do lint` and verify:
  - The adapter flag lint check passes.
  - No clippy warnings in the adapter code.
  - No formatting issues.

## 5. Update Documentation
- [ ] Update `crates/devs-adapters/README.md` to document:
  - The rate limit detection behavior and the zero-exit-code early return.
  - The flag constant convention and how to add new adapters.
- [ ] Update `docs/adapter-compatibility.md` (or create if missing) with the rate-limit patterns for each adapter.
- [ ] Record in `.agent/MEMORY.md` that RISK-004 mitigation is verified with passing tests.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows:
  - `RISK-004-BR-001` covered by `test_rate_limit_zero_exit_code`.
  - `RISK-004-BR-002` covered by `test_adapter_flags_are_const` (and lint check).
  - `RISK-004` covered by `test_rate_limit_nonzero_exit_with_patterns`.
  - All three requirements have `status: "covered"` with passing tests.
- [ ] Run `./do presubmit` to ensure the full pipeline passes including the new lint check.
- [ ] Verify that `target/coverage/report.json` shows `devs-adapters` maintaining ≥90% line coverage after adding these tests.
