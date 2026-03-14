# Task: Implement Claude and Gemini Adapters (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [1_PRD-REQ-013], [2_TAS-REQ-035]

## Dependencies
- depends_on: [02_pty_and_prompt_modes.md]
- shared_components: [devs-adapters (extend)]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/src/adapters/mod.rs` and `crates/devs-adapters/src/adapters/claude.rs`, `crates/devs-adapters/src/adapters/gemini.rs`.
- [ ] Write `test_claude_tool_returns_claude` asserting `ClaudeAdapter.tool() == ToolKind::Claude`.
- [ ] Write `test_claude_build_command_uses_print_flag` asserting the first two args from `build_command` are `["--print", <prompt>]` when given a prompt string.
- [ ] Write `test_claude_build_command_program_is_claude` asserting `AdapterCommand.program == "claude"`.
- [ ] Write `test_claude_pty_default_false` asserting `AdapterCommand.use_pty == false` when `AgentInvocation.use_pty` is not overridden.
- [ ] Write `test_claude_detect_rate_limit_exit_1_rate_limit` with exit code 1 and stderr `"Error: rate limit exceeded"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_claude_detect_rate_limit_exit_1_429` with exit code 1 and stderr `"HTTP 429 Too Many Requests"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_claude_detect_rate_limit_exit_1_overloaded` with exit code 1 and stderr `"API overloaded"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_claude_detect_rate_limit_exit_0_ignored` with exit code 0 and stderr `"rate limit"` asserting `None` (success exit overrides stderr pattern).
- [ ] Write `test_claude_detect_rate_limit_exit_1_unrelated_stderr` with exit code 1 and stderr `"file not found"` asserting `None`.
- [ ] Write `test_gemini_tool_returns_gemini` asserting `GeminiAdapter.tool() == ToolKind::Gemini`.
- [ ] Write `test_gemini_build_command_uses_prompt_flag` asserting args contain `["--prompt", <prompt>]`.
- [ ] Write `test_gemini_build_command_program_is_gemini` asserting `AdapterCommand.program == "gemini"`.
- [ ] Write `test_gemini_pty_default_false` asserting `use_pty == false`.
- [ ] Write `test_gemini_detect_rate_limit_quota` with exit code 1 and stderr `"Quota exceeded"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_gemini_detect_rate_limit_429` with exit code 1 and stderr `"429"` asserting `Some(RateLimitInfo)`.
- [ ] Write `test_gemini_detect_rate_limit_resource_exhausted` with exit code 1 and stderr `"RESOURCE_EXHAUSTED"` asserting `Some(RateLimitInfo)`.
- [ ] Confirm all tests fail.

## 2. Task Implementation
- [ ] Implement `ClaudeAdapter` struct (unit struct or with config) in `adapters/claude.rs`:
  - `tool()` returns `ToolKind::Claude`.
  - `build_command()` uses `PromptMode::Flag { flag: "--print".into() }`, program `"claude"`, `use_pty: false` (default).
  - `detect_rate_limit()`: return `Some(RateLimitInfo)` if `exit_code != 0` AND stderr contains (case-insensitive) any of: `"rate limit"`, `"429"`, `"overloaded"`.
- [ ] Implement `GeminiAdapter` struct in `adapters/gemini.rs`:
  - `tool()` returns `ToolKind::Gemini`.
  - `build_command()` uses `PromptMode::Flag { flag: "--prompt".into() }`, program `"gemini"`, `use_pty: false`.
  - `detect_rate_limit()`: return `Some(RateLimitInfo)` if `exit_code != 0` AND stderr contains (case-insensitive) any of: `"quota"`, `"429"`, `"resource_exhausted"`.
- [ ] Extract a shared `match_rate_limit_patterns(exit_code: i32, stderr: &str, patterns: &[&str], tool: ToolKind) -> Option<RateLimitInfo>` helper to avoid duplication.
- [ ] Register both adapters in `adapters/mod.rs` with public re-exports.
- [ ] Implement `AdapterRegistry` in `crates/devs-adapters/src/registry.rs`: a `HashMap<ToolKind, Box<dyn AgentAdapter>>` with `fn get(&self, tool: ToolKind) -> Option<&dyn AgentAdapter>` and `fn register(&mut self, adapter: Box<dyn AgentAdapter>)`. This satisfies the extensibility requirement [1_PRD-REQ-014].

## 3. Code Review
- [ ] Verify Claude adapter defaults match [2_TAS-REQ-035] table: prompt_mode=Flag(`--print`), pty=false.
- [ ] Verify Gemini adapter defaults match [2_TAS-REQ-035] table: prompt_mode=Flag(`--prompt`), pty=false.
- [ ] Verify rate-limit pattern matching is case-insensitive (use `stderr.to_lowercase().contains()`).
- [ ] Verify `AdapterRegistry` allows adding new adapters without modifying existing code (open/closed principle).
- [ ] Verify no hardcoded paths or platform-specific assumptions in adapter implementations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and confirm all Claude and Gemini tests pass.
- [ ] Run `cargo clippy -p devs-adapters -- -D warnings`.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-013` to adapter instantiation tests.
- [ ] Add `// Covers: 2_TAS-REQ-035` to tests that verify default flag/pty/rate-limit values.
- [ ] Add doc comments to `ClaudeAdapter`, `GeminiAdapter`, `AdapterRegistry`.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm it passes.
- [ ] Run `./do test` and confirm `target/traceability.json` includes entries for `1_PRD-REQ-013` and `2_TAS-REQ-035`.
