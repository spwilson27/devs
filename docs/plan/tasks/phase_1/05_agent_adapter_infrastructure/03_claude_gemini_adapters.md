# Task: Implement Claude and Gemini Adapters (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [1_PRD-REQ-013], [2_TAS-REQ-035] (Partial), [1_PRD-REQ-014] (Partial)

## Dependencies
- depends_on: [02_pty_and_prompt_modes.md]
- shared_components: [devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] In `devs-adapters`, create tests for the `ClaudeAdapter` and `GeminiAdapter` structs.
- [ ] Test that `ClaudeAdapter.build_command` uses `--print` flag for the prompt.
- [ ] Test that `GeminiAdapter.build_command` uses `--prompt` flag for the prompt.
- [ ] Test that `ClaudeAdapter.detect_rate_limit` correctly identifies "rate limit", "429", and "overloaded" in stderr when the exit code is 1.
- [ ] Test that `GeminiAdapter.detect_rate_limit` correctly identifies "quota", "429", and "resource_exhausted" in stderr when the exit code is 1.
- [ ] Verify that the tests fail.

## 2. Task Implementation
- [ ] Implement `ClaudeAdapter` and `GeminiAdapter` structs in `devs-adapters/src/adapters/`.
- [ ] Register these adapters in a central registry or factory in the crate.
- [ ] Implement the `AgentAdapter` trait for `ClaudeAdapter` using the default values:
    - `prompt_mode`: Flag (`--print`)
    - `pty`: `false`
    - Rate limit triggers: exit code 1 AND stderr matches `"rate limit"`, `"429"`, `"overloaded"` (case-insensitive).
- [ ] Implement the `AgentAdapter` trait for `GeminiAdapter` using the default values:
    - `prompt_mode`: Flag (`--prompt`)
    - `pty`: `false`
    - Rate limit triggers: exit code 1 AND stderr matches `"quota"`, `"429"`, `"resource_exhausted"`.
- [ ] Ensure `detect_rate_limit` uses case-insensitive regex matching as required.

## 3. Code Review
- [ ] Verify that the adapter defaults match the table in [2_TAS-REQ-035].
- [ ] Check for proper error handling in `build_command`.
- [ ] Ensure that the implementation remains extensible as required by [1_PRD-REQ-014].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and ensure all tests for Claude and Gemini adapters pass.

## 5. Update Documentation
- [ ] Update `devs-adapters` documentation to include the new adapters.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure compliance and traceability for [1_PRD-REQ-013] and [2_TAS-REQ-035].
