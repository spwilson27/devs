# Task: Adapter Rate-Limit False Positive and Version Freshness Tests (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-002], [AC-ROAD-P1-007]

## Dependencies
- depends_on: ["01_phase_0_dependency_verification.md"]
- shared_components: ["devs-adapters", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/tests/rate_limit_false_positive.rs`, write parameterized test `test_detect_rate_limit_exit_zero_returns_false_all_adapters` that iterates over all 5 adapter instances (`ClaudeAdapter`, `GeminiAdapter`, `OpenCodeAdapter`, `QwenAdapter`, `CopilotAdapter`), calls `adapter.detect_rate_limit(&ProcessOutput { exit_code: 0, stderr: "rate limit exceeded".into(), stdout: "".into() })` on each, and asserts the return is `None` / `false`. Annotate with `// Covers: AC-ROAD-P1-002`.
- [ ] In `tests/lint/adapter_versions_freshness.rs`, write test `test_stale_adapter_versions_json_fails_lint`: (1) write a `target/adapter-versions.json` with `captured_at` set to 8 days in the past (RFC 3339), (2) run `./do lint` via `Command`, (3) assert exit code != 0, (4) assert output contains `"stale"` or `"adapter-versions.json"`. Annotate with `// Covers: AC-ROAD-P1-007`.
- [ ] Write companion `test_fresh_adapter_versions_json_passes_freshness_check` with `captured_at` set to today, confirming lint passes (or at least the freshness check does not contribute to failure).

## 2. Task Implementation
- [ ] Ensure each adapter's `detect_rate_limit` implementation has an early return: `if output.exit_code == 0 { return None; }` — rate limits are only detected on non-zero exit codes. Fix any adapter that does not have this guard.
- [ ] Add a freshness check to `./do lint`: read `target/adapter-versions.json`, parse `captured_at`, compute days since now, fail if > 7. Emit message: `"adapter-versions.json is stale (captured N days ago, max 7)"`.
- [ ] Ensure `./do setup` generates/updates `target/adapter-versions.json` with current `captured_at` timestamp.

## 3. Code Review
- [ ] Verify the test covers exactly 5 adapters by name — not a subset.
- [ ] Verify freshness lint is integrated into `./do lint`, not a standalone script.
- [ ] Verify `// Covers:` annotations on all test functions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters --test rate_limit_false_positive` and confirm pass.
- [ ] Run the freshness lint test and confirm pass.

## 5. Update Documentation
- [ ] Document the 7-day freshness policy for `adapter-versions.json` in adapter crate doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` maps `AC-ROAD-P1-002` and `AC-ROAD-P1-007`.
- [ ] Run `grep -r "AC-ROAD-P1-002\|AC-ROAD-P1-007" crates/ tests/` and confirm matches.
