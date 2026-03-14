# Task: Self-Development, Parallel Workflow, and TDD Edge Cases (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-NEW-010], [3_MCP_DESIGN-REQ-NEW-011], [3_MCP_DESIGN-REQ-NEW-012], [3_MCP_DESIGN-REQ-NEW-013], [3_MCP_DESIGN-REQ-NEW-014], [3_MCP_DESIGN-REQ-NEW-015], [3_MCP_DESIGN-REQ-NEW-016], [3_MCP_DESIGN-REQ-NEW-017], [3_MCP_DESIGN-REQ-NEW-018], [3_MCP_DESIGN-REQ-NEW-019], [3_MCP_DESIGN-REQ-NEW-020], [3_MCP_DESIGN-REQ-NEW-021], [3_MCP_DESIGN-REQ-NEW-022], [3_MCP_DESIGN-REQ-NEW-023], [3_MCP_DESIGN-REQ-NEW-029], [3_MCP_DESIGN-REQ-NEW-032], [3_MCP_DESIGN-REQ-NEW-035], [3_MCP_DESIGN-REQ-NEW-036], [3_MCP_DESIGN-REQ-EC-PAR-001], [3_MCP_DESIGN-REQ-EC-PAR-002], [3_MCP_DESIGN-REQ-EC-PAR-003], [3_MCP_DESIGN-REQ-EC-PAR-004], [3_MCP_DESIGN-REQ-EC-PAR-005], [3_MCP_DESIGN-REQ-EC-PAR-006], [3_MCP_DESIGN-REQ-EC-SELF-001], [3_MCP_DESIGN-REQ-EC-SELF-003], [3_MCP_DESIGN-REQ-EC-SELF-004], [3_MCP_DESIGN-REQ-EC-SELF-005], [3_MCP_DESIGN-REQ-EC-SELF-006], [3_MCP_DESIGN-REQ-EC-TDD-001], [3_MCP_DESIGN-REQ-EC-TDD-002], [3_MCP_DESIGN-REQ-EC-TDD-003], [3_MCP_DESIGN-REQ-EC-TDD-004], [3_MCP_DESIGN-REQ-EC-TDD-005], [3_MCP_DESIGN-REQ-EC-TDD-006], [3_MCP_DESIGN-REQ-EC-TDD-007], [3_MCP_DESIGN-REQ-EC-TDD-008], [3_MCP_DESIGN-REQ-EC-TDD-009], [3_MCP_DESIGN-REQ-DBG-BR-013], [3_MCP_DESIGN-REQ-DBG-BR-014], [3_MCP_DESIGN-REQ-DBG-BR-015], [3_MCP_DESIGN-REQ-DBG-BR-016], [3_MCP_DESIGN-REQ-EC-MCP-009], [3_MCP_DESIGN-REQ-EC-MCP-002]

## Dependencies
- depends_on: ["01_submit_run_tool.md", "04_signal_completion_tool.md", "07_inject_stage_input_and_assert_output_tools.md", "10_observation_tool_data_and_streaming.md", "11_agent_state_and_context_management.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-pool (consumer)", "devs-checkpoint (consumer)", "Traceability & Coverage Infrastructure (consumer)", "./do Entrypoint Script & CI Pipeline (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/edge_cases/mod.rs` with integration test modules

### Parallel Session Edge Cases
- [ ] **Test: `test_parallel_session_monitoring`** — Start two agent sessions monitoring the same project. Assert both receive updates independently. Covers [3_MCP_DESIGN-REQ-NEW-010].
- [ ] **Test: `test_pool_exhaustion_parallel_sessions`** — Multiple sessions exhaust pool. Assert appropriate queuing or error. Covers [3_MCP_DESIGN-REQ-NEW-011].
- [ ] **Test: `test_parallel_tasks_modify_same_file`** — Two parallel tasks write to the same file. Assert conflict is detected or last-write-wins with no corruption. Covers [3_MCP_DESIGN-REQ-EC-PAR-001].
- [ ] **Test: `test_git_conflict_in_merge`** — Two parallel tasks produce conflicting git changes. Assert merge conflict is reported as stage failure. Covers [3_MCP_DESIGN-REQ-EC-PAR-002].
- [ ] **Test: `test_task_c_depends_on_a_b_concurrency`** — Task C depends on A and B. Start A and B in parallel, verify C only starts after both complete. Covers [3_MCP_DESIGN-REQ-EC-PAR-003].
- [ ] **Test: `test_timeout_one_parallel_task`** — One of N parallel tasks times out. Assert timed-out task marked Failed, others continue. Covers [3_MCP_DESIGN-REQ-EC-PAR-004].
- [ ] **Test: `test_pool_exhaustion_parallel`** — More parallel tasks than pool slots. Assert tasks queue and execute as slots become available. Covers [3_MCP_DESIGN-REQ-EC-PAR-005].
- [ ] **Test: `test_missing_integration_branch`** — Parallel tasks reference a non-existent integration branch. Assert appropriate error. Covers [3_MCP_DESIGN-REQ-EC-PAR-006].

### Self-Development Edge Cases
- [ ] **Test: `test_agent_modifies_devs_mcp_while_running`** — Agent writes to `crates/devs-mcp/src/` while MCP server is running. Assert server continues operating (no live reload, changes take effect on restart). Covers [3_MCP_DESIGN-REQ-EC-SELF-001].
- [ ] **Test: `test_cargo_toml_incompatibility`** — Agent introduces a Cargo.toml change that breaks compilation. Assert build failure detected by presubmit. Covers [3_MCP_DESIGN-REQ-EC-SELF-003].
- [ ] **Test: `test_port_already_in_use`** — Start MCP server when port is already bound. Assert `address_in_use` error with clear message. Covers [3_MCP_DESIGN-REQ-EC-SELF-004].
- [ ] **Test: `test_mcp_port_bind_fails_restart`** — MCP port bind fails on restart. Assert graceful error and no orphaned gRPC server. Covers [3_MCP_DESIGN-REQ-EC-SELF-005].
- [ ] **Test: `test_new_tool_not_registered`** — Add a new MCP tool handler but forget to register in router. Assert `method_not_found` error for unregistered tool. Covers [3_MCP_DESIGN-REQ-EC-SELF-006].

### TDD Workflow Edge Cases
- [ ] **Test: `test_tdd_red_exits_zero`** — TDD-red phase: test is expected to fail but exits 0. Assert stage output captures unexpected success. Covers [3_MCP_DESIGN-REQ-EC-TDD-001].
- [ ] **Test: `test_tdd_pool_exhausted`** — TDD workflow runs when pool is exhausted. Assert queuing with appropriate wait. Covers [3_MCP_DESIGN-REQ-EC-TDD-002].
- [ ] **Test: `test_tdd_compilation_error`** — Agent code has compilation error. Assert stage fails with compiler output captured. Covers [3_MCP_DESIGN-REQ-EC-TDD-003].
- [ ] **Test: `test_tdd_timeout`** — TDD stage exceeds timeout. Assert stage cancelled and marked Failed. Covers [3_MCP_DESIGN-REQ-EC-TDD-004].
- [ ] **Test: `test_tdd_two_reqs_share_pool_slot`** — Two requirement tasks share a single pool slot. Assert serialized execution. Covers [3_MCP_DESIGN-REQ-EC-TDD-005].
- [ ] **Test: `test_tdd_invalid_test_annotation`** — Test has malformed `// Covers:` annotation. Assert traceability scanner detects and reports it. Covers [3_MCP_DESIGN-REQ-EC-TDD-006].
- [ ] **Test: `test_tdd_stream_logs_connection_drops`** — `stream_logs` connection drops during TDD. Assert reconnection delivers remaining logs. Covers [3_MCP_DESIGN-REQ-EC-TDD-007].
- [ ] **Test: `test_tdd_qg002_fails`** — E2E coverage falls below 80% (QG-002). Assert `./do coverage` exits non-zero. Covers [3_MCP_DESIGN-REQ-EC-TDD-008].
- [ ] **Test: `test_tdd_blind_retry_without_diagnosis`** — Agent retries a failed stage without investigating. Assert retry behavior is correct (no special prevention, but stage output is available for diagnosis). Covers [3_MCP_DESIGN-REQ-EC-TDD-009].

### Coverage and Traceability Business Rules
- [ ] **Test: `test_do_coverage_exits_nonzero_on_failure`** — Set coverage below threshold, run `./do coverage`. Assert exit code non-zero when `overall_passed = false`. Covers [3_MCP_DESIGN-REQ-DBG-BR-013].
- [ ] **Test: `test_coverage_gates_independent`** — Verify unit gates (QG-001) and E2E gates (QG-002 + QG-003) are evaluated independently. Covers [3_MCP_DESIGN-REQ-DBG-BR-014].
- [ ] **Test: `test_do_test_traceability_failures`** — Introduce stale `// Covers:` annotations, run `./do test`. Assert exit non-zero. Covers [3_MCP_DESIGN-REQ-DBG-BR-015].
- [ ] **Test: `test_requirement_id_regex_discovery`** — Verify requirement IDs are discovered via regex `\[([0-9A-Z_a-z]+-[A-Z]+-[0-9]+)\]` and test annotations via `// Covers: <id>`. Covers [3_MCP_DESIGN-REQ-DBG-BR-016].

### Presubmit and Workflow Conventions
- [ ] **Test: `test_branch_cleanup_after_presubmit`** — After presubmit passes on integration branch, verify branch is cleaned up. Covers [3_MCP_DESIGN-REQ-NEW-012].
- [ ] **Test: `test_prompt_file_conventions`** — Verify prompt files follow naming conventions. Covers [3_MCP_DESIGN-REQ-NEW-013] through [3_MCP_DESIGN-REQ-NEW-019].
- [ ] **Test: `test_investigation_protocol_stage_failure`** — Stage fails, verify investigation protocol flowchart is followed (check output → check logs → check pool state). Covers [3_MCP_DESIGN-REQ-NEW-020], [3_MCP_DESIGN-REQ-NEW-021].
- [ ] **Test: `test_coverage_report_cargo_llvm_cov`** — Verify `target/coverage/report.json` is generated by cargo-llvm-cov with expected schema. Covers [3_MCP_DESIGN-REQ-NEW-022].
- [ ] **Test: `test_debugging_dependencies`** — Verify debugging/observability dependency list. Covers [3_MCP_DESIGN-REQ-NEW-023].

## 2. Task Implementation
- [ ] Implement parallel session tracking in MCP server: each session gets independent event streams
- [ ] Implement validation for self-development scenarios: graceful handling of port conflicts, missing tool registrations, build failures
- [ ] Implement TDD workflow support: proper stage output capture for compilation errors, timeout handling, pool queueing
- [ ] Ensure `./do coverage` and `./do test` properly exit non-zero on gate/traceability failures (integrate with existing ./do infrastructure)
- [ ] Implement prompt file convention validation (naming patterns under `.devs/prompts/`)
- [ ] Implement investigation protocol: when a stage fails, provide structured diagnostic information (output, logs, pool state) in the failure response

## 3. Code Review
- [ ] Verify parallel session isolation (no shared mutable state between sessions beyond server state)
- [ ] Verify port bind error handling releases all resources (no orphaned listeners)
- [ ] Verify coverage gate independence (unit vs E2E evaluated separately)
- [ ] Verify traceability regex matches the specification exactly

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test edge_cases`
- [ ] Run `./do test` to verify traceability integration

## 5. Update Documentation
- [ ] Doc comments on parallel session model, self-development constraints, and TDD workflow support

## 6. Automated Verification
- [ ] Run `./do test` — all edge case tests pass
- [ ] Run `./do coverage` — verify coverage gates are evaluated
- [ ] Run `./do lint` — zero warnings
