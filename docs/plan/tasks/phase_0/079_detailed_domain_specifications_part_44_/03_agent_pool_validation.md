# Task: Agent Pool Configuration Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-474]

## Dependencies
- depends_on: ["02_retry_config_validation.md"]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create unit tests for `AgentPool::validate` that assert:
  - `max_concurrent` = 0 is rejected.
  - `max_concurrent` = 1025 is rejected.
  - `max_concurrent` = 1 is accepted.
  - `max_concurrent` = 1024 is accepted.
  - An empty `AgentConfig` list is rejected.
  - A list with at least one `AgentConfig` is accepted.

## 2. Task Implementation
- [ ] Update `AgentPool::validate` to include range checks for `max_concurrent` (1-1024).
- [ ] Ensure that `agents` list is not empty.
- [ ] Correctly use `ValidationError` to report any of these issues.

## 3. Code Review
- [ ] Verify that `max_concurrent` limits are exactly 1-1024 as per [2_TAS-REQ-474].
- [ ] Verify that empty agent lists are correctly caught.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all `AgentPool` validation tests pass.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect that `AgentPool` now has strict limits for `max_concurrent` and must contain at least one agent.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` confirms coverage for [2_TAS-REQ-474].
