# Task: Technical Risk Covering Tests — SSRF, MCP Exposure, Fan-Out, Bridge, Coverage, Snapshot (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [8_RISKS-REQ-174], [8_RISKS-REQ-175], [8_RISKS-REQ-176], [8_RISKS-REQ-177], [8_RISKS-REQ-178], [8_RISKS-REQ-179], [8_RISKS-REQ-180], [8_RISKS-REQ-181], [8_RISKS-REQ-182], [8_RISKS-REQ-183], [8_RISKS-REQ-184], [8_RISKS-REQ-185], [8_RISKS-REQ-186], [8_RISKS-REQ-187], [8_RISKS-REQ-188], [8_RISKS-REQ-189], [8_RISKS-REQ-190], [8_RISKS-REQ-191], [8_RISKS-REQ-192], [8_RISKS-REQ-193], [8_RISKS-REQ-194], [8_RISKS-REQ-195], [8_RISKS-REQ-196], [8_RISKS-REQ-197], [8_RISKS-REQ-198], [8_RISKS-REQ-199], [8_RISKS-REQ-200], [8_RISKS-REQ-201], [8_RISKS-REQ-202], [8_RISKS-REQ-203], [8_RISKS-REQ-204], [8_RISKS-REQ-205], [8_RISKS-REQ-206], [8_RISKS-REQ-207], [8_RISKS-REQ-208], [8_RISKS-REQ-209], [8_RISKS-REQ-210], [8_RISKS-REQ-211], [8_RISKS-REQ-212], [8_RISKS-REQ-213], [8_RISKS-REQ-214], [8_RISKS-REQ-215], [8_RISKS-REQ-216], [8_RISKS-REQ-217], [8_RISKS-REQ-218], [8_RISKS-REQ-219], [8_RISKS-REQ-220], [8_RISKS-REQ-221], [8_RISKS-REQ-222], [8_RISKS-REQ-223], [8_RISKS-REQ-224], [8_RISKS-REQ-225], [8_RISKS-REQ-226], [8_RISKS-REQ-227], [8_RISKS-REQ-228], [8_RISKS-REQ-229], [8_RISKS-REQ-230], [8_RISKS-REQ-231], [8_RISKS-REQ-232], [8_RISKS-REQ-233], [8_RISKS-REQ-234], [8_RISKS-REQ-235], [8_RISKS-REQ-236]

## Dependencies
- depends_on: ["01_risk_matrix_schema_and_validation_infrastructure.md"]
- shared_components: [devs-webhook (consumer), devs-mcp (consumer), devs-pool (consumer), devs-scheduler (consumer), devs-checkpoint (consumer), devs-mcp-bridge (consumer — if exists)]

## 1. Initial Test Written

### RISK-014: Webhook SSRF DNS-Rebinding
- [ ] Write `test_webhook_loopback_blocked` (`// Covers: RISK-014, 8_RISKS-REQ-180`): Webhook target resolving to `127.0.0.1` returns `TargetBlocked` error.
- [ ] Write `test_webhook_private_ip_blocked` (`// Covers: RISK-014, 8_RISKS-REQ-181`): Webhook target resolving to `192.168.1.0` returns `TargetBlocked`.
- [ ] Write `test_webhook_public_ip_allowed` (`// Covers: RISK-014, 8_RISKS-REQ-182`): Webhook target resolving to public IP executes normally.
- [ ] Write `test_webhook_sec_violation_reason` (`// Covers: RISK-014, 8_RISKS-REQ-183`): Failed webhook marked with SEC violation reason in delivery record.
- [ ] Write tests for: DNS resolved once, same IP for connect [8_RISKS-REQ-176], loopback blocked [8_RISKS-REQ-177], RFC1918 blocked [8_RISKS-REQ-178], no retry on TargetBlocked [8_RISKS-REQ-179].

### RISK-015: Glass-Box MCP Exposure
- [ ] Write `test_mcp_binds_loopback` (`// Covers: RISK-015, 8_RISKS-REQ-190`): MCP server binds to `127.0.0.1` in CI/test.
- [ ] Write `test_mcp_responses_no_internal_types` (`// Covers: RISK-015, 8_RISKS-REQ-191`): MCP responses conform to schema with no internal types leaked (`WorkflowRun`, `StageRun` not in raw response).
- [ ] Write `test_mcp_non_loopback_adr` (`// Covers: RISK-015, 8_RISKS-REQ-192`): Intentional non-loopback binding must be documented in ADR.
- [ ] Write `test_mcp_integration_valid_response` (`// Covers: RISK-015, 8_RISKS-REQ-193`): MCP integration test connects to `127.0.0.1` and receives valid responses.
- [ ] Write tests for: loopback binding enforced [8_RISKS-REQ-186], StructuredValue responses [8_RISKS-REQ-187], no raw internal types [8_RISKS-REQ-188], SEC-BIND-ADDR log on non-loopback [8_RISKS-REQ-189].

### RISK-021: Fan-Out Pool Starvation
- [ ] Write `test_fanout_32_acquires_permits` (`// Covers: RISK-021, 8_RISKS-REQ-200`): Fan-out with count=32 acquires 32 concurrent semaphore permits.
- [ ] Write `test_pool_exhaustion_detection` (`// Covers: RISK-021, 8_RISKS-REQ-201`): Pool exhaustion causes `queued_count > max_concurrent × 4`.
- [ ] Write `test_pool_exhausted_webhook_fires` (`// Covers: RISK-021, 8_RISKS-REQ-202`): `pool.exhausted` webhook fires when exhaustion detected.
- [ ] Write `test_fanout_51_rejected` (`// Covers: RISK-021, 8_RISKS-REQ-203`): Fan-out count=51 rejected at workflow validation.
- [ ] Write `test_semaphore_permits_released` (`// Covers: RISK-021, 8_RISKS-REQ-204`): Semaphore permits released after sub-agent completion.
- [ ] Write `test_concurrent_fanout_no_starvation` (`// Covers: RISK-021, 8_RISKS-REQ-205`): Concurrent fan-out workflows do not starve each other.
- [ ] Write tests for: semaphore-based dispatch [8_RISKS-REQ-196], parent waits for all N [8_RISKS-REQ-197], exhaustion episode tracking [8_RISKS-REQ-198], cap at 50 [8_RISKS-REQ-199].

### RISK-022: MCP stdio Bridge Connection Loss
- [ ] Write `test_bridge_detects_eof_reconnects` (`// Covers: RISK-022, 8_RISKS-REQ-212`): Bridge detects stdio close and reconnects within 5 attempts.
- [ ] Write `test_pending_calls_timeout` (`// Covers: RISK-022, 8_RISKS-REQ-213`): Pending MCP calls timeout with `TimeoutError` after 30s.
- [ ] Write `test_bridge_reconnects_after_restart` (`// Covers: RISK-022, 8_RISKS-REQ-214`): Bridge reconnects after process restart.
- [ ] Write `test_no_fd_leaks` (`// Covers: RISK-022, 8_RISKS-REQ-215`): No file descriptor leaks after N reconnect attempts.
- [ ] Write tests for: EOF detection [8_RISKS-REQ-208], backoff 100ms→30s [8_RISKS-REQ-209], 30s call timeout [8_RISKS-REQ-210], no FD leaks [8_RISKS-REQ-211].

### RISK-023: Coverage Measurement Accuracy
- [ ] Write `test_separate_unit_e2e_coverage` (`// Covers: RISK-023, 8_RISKS-REQ-222`): `cargo test --lib` records different coverage than `--test`.
- [ ] Write `test_coverage_scope_distinction` (`// Covers: RISK-023, 8_RISKS-REQ-223`): Coverage report distinguishes unit vs E2E scopes.
- [ ] Write `test_interface_coverage_independent` (`// Covers: RISK-023, 8_RISKS-REQ-224`): Interface binary coverage measured independently per interface.
- [ ] Write `test_coverage_docs` (`// Covers: RISK-023, 8_RISKS-REQ-225`): Documentation explains coverage measurement limitations.
- [ ] Write tests for: QG-001 uses only --lib [8_RISKS-REQ-218], QG-002 uses only E2E [8_RISKS-REQ-219], QG-003/4/5 per-interface [8_RISKS-REQ-220], internal calls not attributed [8_RISKS-REQ-221].

### RISK-025: Workflow Snapshot Immutability
- [ ] Write `test_snapshot_hash_matches_content` (`// Covers: RISK-025, 8_RISKS-REQ-232`): Snapshot hash matches SHA256 of canonical JSON content.
- [ ] Write `test_concurrent_checkpoint_writes_serialized` (`// Covers: RISK-025, 8_RISKS-REQ-233`): Concurrent checkpoint writes blocked by per-run Mutex.
- [ ] Write `test_snapshot_version_increments` (`// Covers: RISK-025, 8_RISKS-REQ-234`): Snapshot version increments on each state transition.
- [ ] Write `test_snapshot_immutable_after_write` (`// Covers: RISK-025, 8_RISKS-REQ-235`): Unit test reads snapshot after write and confirms immutability.
- [ ] Write `test_hash_mismatch_unrecoverable` (`// Covers: RISK-025, 8_RISKS-REQ-236`): Hash mismatch on load marks run `Unrecoverable`.
- [ ] Write tests for: snapshot immutable after Eligible eval [8_RISKS-REQ-228], metadata computed before write [8_RISKS-REQ-229], SHA256 over canonical JSON [8_RISKS-REQ-230], version increments on transition only [8_RISKS-REQ-231].

## 2. Task Implementation
- [ ] In `devs-webhook`, implement DNS resolution caching: resolve hostname once, use same IP for connect. Block loopback (127.0.0.0/8, ::1) and RFC1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, link-local) addresses with `TargetBlocked` error. No retry on `TargetBlocked`. Mark failed webhook with SEC violation reason.
- [ ] In `devs-mcp`, enforce loopback binding by default. Implement `StructuredValue` responses with documented schema. Log `SERVER SEC-BIND-ADDR` when binding to non-loopback.
- [ ] In `devs-pool`, implement semaphore-based fan-out dispatch. Cap fan-out at 50 (validation error for 51+). Track pool exhaustion episodes. Fire `PoolExhausted` webhook event.
- [ ] In `devs-mcp-bridge`, implement reconnect loop with exponential backoff (100ms → 30s). Detect stdio EOF. Timeout pending calls at 30s. Ensure no FD leaks on reconnect.
- [ ] In `./do coverage`, ensure separate measurement scopes: `--lib` for unit (QG-001), `--test '*_e2e*'` for E2E (QG-002), per-interface measurement for QG-003/4/5.
- [ ] In `devs-checkpoint`, implement SHA256 hash over canonical JSON for snapshots. Validate hash on load; mismatch → `Unrecoverable`. Ensure per-run Mutex serializes writes.

## 3. Code Review
- [ ] Verify webhook SSRF protection: DNS resolved once, loopback/RFC1918 blocked, no retry on TargetBlocked.
- [ ] Verify MCP server binds to loopback by default with SEC-BIND-ADDR log for non-loopback.
- [ ] Verify fan-out cap at 50 is enforced at validation time, not dispatch time.
- [ ] Verify snapshot SHA256 uses canonical (sorted-keys, no whitespace variance) JSON serialization.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- risk_014 risk_015 risk_021 risk_022 risk_023 risk_025`.
- [ ] Run `./do coverage` and verify separate unit/E2E scopes in report.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify `target/traceability.json` shows zero `missing_covering_test` for RISK-014, RISK-015, RISK-021, RISK-022, RISK-023, RISK-025.
