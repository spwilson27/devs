# Task: Implement Passive Rate-Limit Detection Per Adapter (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [1_PRD-REQ-018], [2_TAS-REQ-036]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters (owner: Phase 1 / Sub-Epic: devs-adapters — this task adds detect_rate_limit to the trait), devs-pool (consumer: receives RateLimitInfo to set cooldown)]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/src/rate_limit.rs` (new module) with unit tests.
- [ ] Write `test_claude_rate_limit_stderr_rate_limit` — provide stderr containing "rate limit" and verify `detect_rate_limit` returns `Some(RateLimitInfo)`.
- [ ] Write `test_claude_rate_limit_stderr_429` — stderr containing "429" → detected.
- [ ] Write `test_claude_rate_limit_stderr_overloaded` — stderr containing "overloaded" → detected.
- [ ] Write `test_claude_no_rate_limit` — stderr with normal output → `None`.
- [ ] Write `test_gemini_rate_limit_quota_exceeded` — stderr containing "quota exceeded" or gRPC RESOURCE_EXHAUSTED → detected.
- [ ] Write `test_gemini_no_rate_limit` — normal stderr → `None`.
- [ ] Write `test_opencode_rate_limit` — stderr containing "rate limit" or "429" → detected.
- [ ] Write `test_qwen_rate_limit` — stderr containing "rate limit" or "429" → detected.
- [ ] Write `test_copilot_rate_limit` — stderr containing "rate limit" or "429" → detected.
- [ ] Write `test_rate_limit_exit_code_detection` — verify that an exit code of 429 (where applicable) is detected as a rate limit regardless of stderr content.
- [ ] Write `test_rate_limit_case_insensitive` — verify pattern matching is case-insensitive (e.g., "Rate Limit", "RATE LIMIT").
- [ ] Write `test_rate_limit_info_contains_adapter_name` — verify `RateLimitInfo` includes which adapter triggered it.
- [ ] Write `test_empty_stderr_no_rate_limit` — empty stderr → `None`.
- [ ] All tests must include `// Covers: 2_TAS-REQ-036` or `// Covers: 1_PRD-REQ-018` annotations.

## 2. Task Implementation
- [ ] Define `RateLimitInfo` struct in `crates/devs-adapters/src/rate_limit.rs`:
  ```rust
  /// Information about a detected rate-limit condition.
  #[derive(Debug, Clone)]
  pub struct RateLimitInfo {
      /// Which adapter detected the rate limit.
      pub adapter_name: &'static str,
      /// The pattern that triggered detection.
      pub matched_pattern: String,
      /// Suggested cooldown duration (adapter-specific default, e.g., 60s).
      pub suggested_cooldown: Duration,
  }
  ```
- [ ] Define `RateLimitPatterns` struct holding compiled `Regex` patterns per adapter, constructed via `LazyLock` (or `OnceLock`) to compile once:
  ```rust
  struct RateLimitPatterns {
      stderr_patterns: Vec<Regex>,
      exit_codes: Vec<i32>,
  }
  ```
- [ ] Implement per-adapter pattern sets as `static` constants:
  - **claude**: stderr patterns `["rate.limit", "429", "overloaded"]`, exit codes `[]`
  - **gemini**: stderr patterns `["quota.exceeded", "RESOURCE_EXHAUSTED", "429"]`, exit codes `[]`
  - **opencode**: stderr patterns `["rate.limit", "429"]`, exit codes `[]`
  - **qwen**: stderr patterns `["rate.limit", "429"]`, exit codes `[]`
  - **copilot**: stderr patterns `["rate.limit", "429"]`, exit codes `[]`
- [ ] Add `fn detect_rate_limit(&self, output: &ProcessOutput) -> Option<RateLimitInfo>` to the `AgentAdapter` trait with a default implementation that delegates to a shared helper using the adapter's `RateLimitPatterns`.
- [ ] Implement the shared helper `fn check_rate_limit(patterns: &RateLimitPatterns, adapter_name: &'static str, output: &ProcessOutput) -> Option<RateLimitInfo>` that:
  1. Checks `output.exit_code` against `patterns.exit_codes`.
  2. Iterates `patterns.stderr_patterns`, checking case-insensitively against `output.stderr`.
  3. Returns `Some(RateLimitInfo)` on first match, `None` otherwise.
- [ ] Ensure `ProcessOutput` struct (already defined in devs-adapters) includes `exit_code: Option<i32>` and `stderr: String` fields.
- [ ] Integrate detection into the post-`wait()` path of `AgentProcess`: after the child exits, call `adapter.detect_rate_limit(&output)` before returning the result. If detected, return a distinguishable error variant `AdapterError::RateLimited(RateLimitInfo)` so the caller (pool/scheduler) can handle cooldown.

## 3. Code Review
- [ ] Verify all `Regex` patterns are compiled exactly once via `LazyLock`/`OnceLock` — no per-call compilation.
- [ ] Verify pattern matching is case-insensitive (use `(?i)` flag in regex or `RegexBuilder::case_insensitive(true)`).
- [ ] Verify `ProcessOutput.stderr` is fully captured before pattern matching (no truncation that could miss patterns).
- [ ] Verify `RateLimitInfo.suggested_cooldown` defaults to 60 seconds (as a named constant `DEFAULT_RATE_LIMIT_COOLDOWN`).
- [ ] Verify the `detect_rate_limit` trait method has a provided default implementation so adapters only override if they need custom logic.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- rate_limit` to verify all rate-limit detection tests pass.
- [ ] Run `cargo test -p devs-adapters` to verify no regressions.

## 5. Update Documentation
- [ ] Add doc comments to `RateLimitInfo`, `detect_rate_limit`, and the per-adapter pattern constants documenting the exact patterns matched.
- [ ] Add a module-level doc comment to `rate_limit.rs` explaining the passive detection strategy.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all tests pass with `// Covers: 2_TAS-REQ-036` and `// Covers: 1_PRD-REQ-018` annotations.
- [ ] Run `./do lint` and confirm no warnings or errors.
