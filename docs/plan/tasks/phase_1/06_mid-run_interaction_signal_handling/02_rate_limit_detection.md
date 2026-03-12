# Task: Implement Passive Rate-Limit Detection and Recovery (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [1_PRD-REQ-018], [2_TAS-REQ-036]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters, devs-pool]

## 1. Initial Test Written
- [ ] Create unit tests for each of the 5 MVP adapters (`claude`, `gemini`, `opencode`, `qwen`, `copilot`) that provide mock `stderr` output containing known rate-limit patterns.
- [ ] Verify that the `detect_rate_limit` method correctly identifies these patterns and returns a `RateLimitDetected` error or status.
- [ ] Create a test for exit code matching (e.g., exit code 429 or specific tool-defined codes).
- [ ] Mock the `AgentPool` to verify that when a rate limit is detected by an adapter, the pool transitions the agent to a "cooldown" state for 60 seconds.

## 2. Task Implementation
- [ ] Define a standard `detect_rate_limit` method in the `AgentAdapter` trait that takes the exit code and `stderr` content as input.
- [ ] Implement the pattern matching logic for each concrete adapter:
    - [ ] **Claude**: Match "rate limit", "429", "overloaded" in `stderr`.
    - [ ] **Gemini**: Match specific gRPC error codes or "quota exceeded".
    - [ ] **OpenCode/Qwen/Copilot**: Implement patterns based on their respective CLI error outputs.
- [ ] Integrate the detection into the subprocess wait logic: after an agent exits, run the detection logic before determining if it's a "failure" or a "rate limit".
- [ ] Implement the cooldown mechanism in `devs-pool`:
    - [ ] When a rate limit is reported (passive or active), set a 60-second cooldown timer for that agent configuration in the pool.
    - [ ] Ensure the pool skip-routes around agents in cooldown.

## 3. Code Review
- [ ] Verify that regex patterns are compiled once (e.g., using `once_cell` or `LazyLock`) to avoid performance overhead.
- [ ] Ensure that `stderr` is read correctly without blocking the main event loop (use `tokio::io::AsyncReadExt`).
- [ ] Check that the 60-second cooldown duration is a constant and correctly enforced.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and `cargo test -p devs-pool`.

## 5. Update Documentation
- [ ] Document the specific rate-limit patterns matched for each agent in the `devs-adapters` README.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to verify 100% traceability for [2_TAS-REQ-036].
