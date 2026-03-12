# Task: Adapter Quality and Freshness Verification (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-002], [AC-ROAD-P1-007]

## Dependencies
- depends_on: [01_phase_0_dependency_verification.md]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-adapters` that invokes `detect_rate_limit(exit_code=0, stderr="rate limit exceeded")` for all 5 adapters (claude, gemini, opencode, qwen, copilot).
- [ ] The test must assert that `detect_rate_limit` returns `false` when the exit code is 0, even if the stderr string matches a rate-limit pattern.
- [ ] Create a lint-like test in `devs-adapters` (or a global script) that reads `target/adapter-versions.json`.
- [ ] The test must verify the file exists and its `captured_at` timestamp is within the last 7 days.

## 2. Task Implementation
- [ ] Implement the `detect_rate_limit` invariant in all 5 adapter implementations.
- [ ] Ensure `AgentAdapter::detect_rate_limit` has a clear guard: `if exit_code == 0 { return false; }`.
- [ ] Update `./do setup` to ensure `target/adapter-versions.json` is generated with the current timestamp.
- [ ] Add the adapter version freshness check to `./do lint`.

## 3. Code Review
- [ ] Confirm that all 5 adapters follow the `detect_rate_limit` invariant.
- [ ] Verify that `target/adapter-versions.json` contains a valid RFC 3339 timestamp.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters`.
- [ ] Run `./do lint` and ensure the freshness check passes.

## 5. Update Documentation
- [ ] Update `devs-adapters` README.md with details on rate-limit detection invariants.
- [ ] Document the requirement for `target/adapter-versions.json` in the toolchain setup guide.

## 6. Automated Verification
- [ ] Run the traceability scanner and confirm `AC-ROAD-P1-002` and `AC-ROAD-P1-007` are mapped to the new tests.
- [ ] Manually simulate a stale `target/adapter-versions.json` and ensure `./do lint` fails.
