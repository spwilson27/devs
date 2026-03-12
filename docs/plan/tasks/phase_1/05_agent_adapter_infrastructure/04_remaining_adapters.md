# Task: Implement OpenCode, Qwen, and Copilot Adapters (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [1_PRD-REQ-013], [2_TAS-REQ-035] (Partial), [1_PRD-REQ-014] (Partial)

## Dependencies
- depends_on: [03_claude_gemini_adapters.md]
- shared_components: [devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] In `devs-adapters`, create tests for the `OpenCodeAdapter`, `QwenAdapter`, and `CopilotAdapter` structs.
- [ ] Test that `OpenCodeAdapter.build_command` correctly uses `--prompt-file` flag with the temporary file path.
- [ ] Test that `QwenAdapter.build_command` uses `--query` flag for the prompt.
- [ ] Test that `CopilotAdapter.build_command` uses `--stdin` and expects the prompt in a temporary file.
- [ ] Test that `OpenCodeAdapter.detect_rate_limit` correctly identifies "rate limit" and "429" in stderr when the exit code is 1.
- [ ] Verify that the tests fail.

## 2. Task Implementation
- [ ] Implement `OpenCodeAdapter`, `QwenAdapter`, and `CopilotAdapter` structs in `devs-adapters/src/adapters/`.
- [ ] Implement the `AgentAdapter` trait for `OpenCodeAdapter` using the default values:
    - `prompt_mode`: File (`--prompt-file`)
    - `pty`: `true`
    - Rate limit triggers: exit code 1 AND stderr matches `"rate limit"`, `"429"`.
- [ ] Implement the `AgentAdapter` trait for `QwenAdapter` using the default values:
    - `prompt_mode`: Flag (`--query`)
    - `pty`: `false`
    - Rate limit triggers (placeholders or defaults as per TAS-REQ-036).
- [ ] Implement the `AgentAdapter` trait for `CopilotAdapter` using the default values:
    - `prompt_mode`: File (`--stdin`)
    - `pty`: `false`
    - Rate limit triggers (placeholders or defaults as per TAS-REQ-036).
- [ ] Ensure `OpenCodeAdapter` returns `use_pty = true` in its `AdapterCommand`.

## 3. Code Review
- [ ] Verify that all five MVP adapters are now fully implemented and satisfy [1_PRD-REQ-013].
- [ ] Ensure that `PromptMode::File` handling is consistent across `OpenCode` and `Copilot` implementations.
- [ ] Check that `detect_rate_limit` logic is consistent for all adapters.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and ensure all tests for OpenCode, Qwen, and Copilot adapters pass.

## 5. Update Documentation
- [ ] Finalize `devs-adapters` documentation, including an overview of all five supported adapters.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure compliance and 100% traceability for [1_PRD-REQ-013] and [2_TAS-REQ-035].
