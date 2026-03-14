# Task: Implement OpenCode, Qwen, and Copilot Adapters (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [1_PRD-REQ-013], [2_TAS-REQ-035]

## Dependencies
- depends_on: [03_claude_gemini_adapters.md]
- shared_components: [devs-adapters (extend)]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/src/adapters/opencode.rs`, `qwen.rs`, `copilot.rs`.
- [ ] Write `test_opencode_tool_returns_opencode` asserting `OpenCodeAdapter.tool() == ToolKind::OpenCode`.
- [ ] Write `test_opencode_build_command_uses_prompt_file_flag` asserting args contain `["--prompt-file", <path>]` where `<path>` matches `.devs_prompt_<uuid>` pattern. Verify `AdapterCommand` also contains a `prompt_file` field or that `PromptArgs.prompt_file` is `Some(...)`.
- [ ] Write `test_opencode_build_command_program_is_opencode` asserting `program == "opencode"`.
- [ ] Write `test_opencode_pty_default_true` asserting `AdapterCommand.use_pty == true` (OpenCode requires PTY by default per [2_TAS-REQ-035]).
- [ ] Write `test_opencode_detect_rate_limit_429` with exit code 1 and stderr `"429"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_opencode_detect_rate_limit_rate_limit` with exit code 1 and stderr `"rate limit"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_qwen_tool_returns_qwen` asserting `QwenAdapter.tool() == ToolKind::Qwen`.
- [ ] Write `test_qwen_build_command_uses_query_flag` asserting args contain `["--query", <prompt>]`.
- [ ] Write `test_qwen_build_command_program_is_qwen` asserting `program == "qwen"`.
- [ ] Write `test_qwen_pty_default_false` asserting `use_pty == false`.
- [ ] Write `test_qwen_detect_rate_limit_429` with exit code 1 and stderr `"429"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_copilot_tool_returns_copilot` asserting `CopilotAdapter.tool() == ToolKind::Copilot`.
- [ ] Write `test_copilot_build_command_uses_stdin_file` asserting the adapter uses `PromptMode::File { flag: "--stdin".into() }` and the args contain `["--stdin", <path>]`.
- [ ] Write `test_copilot_build_command_program_is_copilot` asserting `program == "copilot"`.
- [ ] Write `test_copilot_pty_default_false` asserting `use_pty == false`.
- [ ] Write `test_copilot_detect_rate_limit_429` with exit code 1 and stderr `"429"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_all_five_adapters_registered` that creates an `AdapterRegistry`, registers all five adapters, and asserts `registry.get(ToolKind::Claude)`, `registry.get(ToolKind::Gemini)`, `registry.get(ToolKind::OpenCode)`, `registry.get(ToolKind::Qwen)`, `registry.get(ToolKind::Copilot)` all return `Some`.
- [ ] Write `test_default_registry_has_all_five` that calls a `AdapterRegistry::default_mvp()` factory and confirms all five tools are present.
- [ ] Confirm all tests fail.

## 2. Task Implementation
- [ ] Implement `OpenCodeAdapter` in `adapters/opencode.rs`:
  - `tool()` returns `ToolKind::OpenCode`.
  - `build_command()` uses `PromptMode::File { flag: "--prompt-file".into() }`, program `"opencode"`, `use_pty: true`.
  - `detect_rate_limit()`: patterns `["rate limit", "429"]`.
- [ ] Implement `QwenAdapter` in `adapters/qwen.rs`:
  - `tool()` returns `ToolKind::Qwen`.
  - `build_command()` uses `PromptMode::Flag { flag: "--query".into() }`, program `"qwen"`, `use_pty: false`.
  - `detect_rate_limit()`: patterns `["rate limit", "429", "throttl"]`.
- [ ] Implement `CopilotAdapter` in `adapters/copilot.rs`:
  - `tool()` returns `ToolKind::Copilot`.
  - `build_command()` uses `PromptMode::File { flag: "--stdin".into() }`, program `"copilot"`, `use_pty: false`.
  - `detect_rate_limit()`: patterns `["rate limit", "429", "throttl"]`.
- [ ] Implement `AdapterRegistry::default_mvp() -> Self` that pre-registers all five adapters.
- [ ] Re-export all adapters from `adapters/mod.rs`.

## 3. Code Review
- [ ] Verify all five MVP adapters are implemented and satisfy [1_PRD-REQ-013].
- [ ] Verify OpenCode defaults match [2_TAS-REQ-035]: prompt_mode=File(`--prompt-file`), pty=true.
- [ ] Verify Qwen defaults match [2_TAS-REQ-035]: prompt_mode=Flag(`--query`), pty=false.
- [ ] Verify Copilot defaults match [2_TAS-REQ-035]: prompt_mode=File(`--stdin`), pty=false.
- [ ] Verify `default_mvp()` returns exactly 5 adapters and adding a 6th requires only implementing the trait and calling `register()` (extensibility per [1_PRD-REQ-014]).
- [ ] Verify no adapter imports or depends on another adapter (each is independent).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and confirm all tests pass (expect 30+ tests total across all adapter files).
- [ ] Run `cargo clippy -p devs-adapters -- -D warnings`.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-013` to the `test_all_five_adapters_registered` and `test_default_registry_has_all_five` tests.
- [ ] Add `// Covers: 2_TAS-REQ-035` to each adapter's default configuration tests.
- [ ] Add doc comments to `OpenCodeAdapter`, `QwenAdapter`, `CopilotAdapter`, and `AdapterRegistry::default_mvp`.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm it passes.
- [ ] Run `./do test` and confirm `target/traceability.json` includes entries for `1_PRD-REQ-013` and `2_TAS-REQ-035`.
- [ ] Run `cargo tarpaulin -p devs-adapters --out json` and confirm line coverage is >= 90%.
