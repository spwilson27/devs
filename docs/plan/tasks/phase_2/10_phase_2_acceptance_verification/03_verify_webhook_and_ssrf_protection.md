# Task: Verify Webhook and SSRF Protection (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-005], [AC-ROAD-P2-006]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook, devs-pool]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-webhook/tests/webhook_verification.rs` that simulates a pool with all agents becoming rate-limited simultaneously.
- [ ] The test must assert that the `pool.exhausted` webhook fires exactly once for the episode, even if multiple `report_rate_limit` calls occur.
- [ ] Create a second test in `crates/devs-webhook/src/ssrf_verification.rs` that calls `check_ssrf(url, allow_local=false)`.
- [ ] The test must assert that the function returns `Err` for private IP ranges (192.168.x.x, 10.x.x.x, 127.0.x.x, ::1).
- [ ] The test must assert that the function returns `Ok(())` for a known public IP that resolves to a non-blocked range.

## 2. Task Implementation
- [ ] Implement the `PoolExhausted` episode state machine in `devs-webhook` or `devs-pool` to track when an episode starts and ends.
- [ ] Implement a strict SSRF IP filter in `devs-webhook` using the `ipnet` or similar crate to check for private/local address blocks.
- [ ] Integrate the SSRF check into the `WebhookDispatcher` before any HTTP request is initiated.

## 3. Code Review
- [ ] Verify that the `PoolExhausted` episode logic is thread-safe and correctly transitions back when agents become available.
- [ ] Ensure that the SSRF check covers both IPv4 and IPv6 private address ranges.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-webhook --test webhook_verification`
- [ ] Execute `cargo test -p devs-webhook --lib ssrf_verification`
- [ ] Ensure both tests pass and meet the security requirements.

## 5. Update Documentation
- [ ] Update `docs/plan/phases/phase_2.md` with verification results for webhook deduplication and SSRF protection.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P2-005] and [AC-ROAD-P2-006] as passing.
