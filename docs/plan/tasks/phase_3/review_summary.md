# Phase 3 Task Review Summary

**Date:** 2026-03-14
**Before:** 151 task files
**After:** 117 task files
**Deleted:** 34 duplicate task files

## Duplicate Deletions

### Sub-Epic 01: Core gRPC Server and Infrastructure (11 deleted)

| Deleted File | Superseded By | Rationale |
|---|---|---|
| `01_core_grpc_server_and_lifecycle.md` | `01_devs_grpc_crate_scaffold_and_server_service.md` | Scaffold task is more detailed; covers same gRPC server setup + health check + port config |
| `02_protocol_hardening_and_discovery.md` | `02_grpc_client_version_interceptor.md` + `06_discovery_file_protocol.md` | Discovery split into its own task; version interceptor covers the protocol hardening |
| `03_streaming_infrastructure.md` | `03_grpc_service_stubs_and_streaming.md` | Stubs task covers same streaming RPCs with more detail on all 6 services |
| `04_networking_security_baseline.md` | `07_security_startup_checks_and_network_policy.md` | Security startup task is a superset: loopback binding, WARN on non-loopback, no-auth interceptor, GetInfo RPC |
| `05_credential_protection_and_redaction.md` | `08_credential_security_and_env_handling.md` | Credential security task covers Redacted<T>, env stripping, prompt files, webhook secrets — all in scope of the deleted task plus more |
| `08_webhook_security_ssrf_and_hmac.md` | `10_network_security_webhook_ssrf_tls_size_limits.md` | Network security task is a strict superset covering SSRF, HMAC, TLS, size limits, SSH, Docker |
| `09_transport_layer_security.md` | `10_network_security_webhook_ssrf_tls_size_limits.md` | TLS requirements (REQ-032/033/034) fully covered in the network security task |
| `10_remote_execution_security.md` | `10_network_security_webhook_ssrf_tls_size_limits.md` | SSH/Docker security (REQ-012/038/039/069) fully covered in the network security task |
| `11_injection_prevention_and_subprocess_safety.md` | `09_input_validation_and_injection_prevention.md` | Input validation task covers all the same: template single-pass, env key validation, subprocess arg arrays, prompt file UUIDs |
| `12_input_validation_and_state_integrity.md` | `09_input_validation_and_injection_prevention.md` | JSON depth limits, success field validation, context file truncation all covered in the input validation task |
| `13_architecture_forward_compatibility.md` | `08_credential_security_and_env_handling.md` + `09_input_validation_and_injection_prevention.md` | Env inheritance covered by credential task; context file limit covered by input validation; auth interceptor placeholder covered by security startup task |

### Sub-Epic 04: MCP Server Framework (3 deleted)

| Deleted File | Superseded By | Rationale |
|---|---|---|
| `01_mcp_server_foundation.md` | `01_mcp_crate_scaffold_and_jsonrpc_server.md` | Scaffold task is more detailed with explicit test cases for JSON-RPC error codes, content type validation, method routing |
| `02_mcp_stdio_bridge.md` | `04_mcp_stdio_bridge.md` | Exact duplicate — same bridge implementation described twice with different task numbers |
| `03_mcp_observation_framework.md` | `03_mcp_tool_registry_and_categorization.md` | Registry task covers tool categorization, data model completeness, and responsiveness — a superset of the observation framework |

### Sub-Epic 05: MCP Tools - Observability (10 deleted)

| Deleted File | Superseded By | Rationale |
|---|---|---|
| `01_mcp_bridge.md` | `04_mcp_server_framework/04_mcp_stdio_bridge.md` | Third copy of bridge implementation; sub-epic 04 already has the canonical version |
| `01_mcp_stdio_bridge_binary.md` | `04_mcp_server_framework/04_mcp_stdio_bridge.md` | Fourth copy of bridge implementation |
| `02_list_get_run.md` | `02_list_runs_tool.md` + `03_get_run_tool.md` | Combined task split into two more detailed individual tool tasks |
| `03_get_stage_output.md` | `04_get_stage_output_tool.md` | Detailed tool task covers all the same edge cases plus fan-out index and UTF-8 boundary truncation |
| `04_stream_logs.md` | `05_stream_logs_tool.md` | Detailed tool task covers ring buffer, sequence numbers, follow-before-start, and client disconnect |
| `05_pool_workflow_obs.md` | `06_get_pool_state_tool.md` + `07_get_workflow_definition_tool.md` | Combined task split into two more detailed individual tool tasks |
| `06_list_checkpoints.md` | `08_list_checkpoints_tool.md` | Detailed tool task covers pagination, never-written branch, and spawn_blocking |
| `07_submit_run.md` | `06_mcp_tools_-_control_and_management/01_submit_run_tool.md` | submit_run is a control tool, not observation; canonical version in sub-epic 06 |
| `08_cancel_tools.md` | `06_mcp_tools_-_control_and_management/02_cancel_run_and_stage_tools.md` | cancel is a control tool; canonical version in sub-epic 06 |
| `09_submit_and_cancel_tools.md` | `06_mcp_tools_-_control_and_management/01_submit_run_tool.md` + `02_cancel_run_and_stage_tools.md` | Third copy; covered by detailed tasks in sub-epic 06 |

### Sub-Epic 06: MCP Tools - Control and Management (10 deleted)

| Deleted File | Superseded By | Rationale |
|---|---|---|
| `01_mcp_control_tools.md` | `01_submit_run_tool.md` + `02_cancel_run_and_stage_tools.md` + `03_pause_resume_tools.md` | Monolithic combined task; split tasks are more granular and detailed |
| `02_mcp_workflow_updates.md` | `06_write_workflow_definition_tool.md` | Detailed tool task covers cycle detection, active run check, name mismatch, atomicity |
| `03_mcp_testing_tools.md` | `07_inject_stage_input_and_assert_output_tools.md` | Detailed tool task covers all assertion types, regex validation, JSONPath, truncation |
| `04_mcp_mid_run_tools.md` | `04_signal_completion_tool.md` + `05_report_progress_and_rate_limit_tools.md` | Combined task split into two with detailed concurrency controls and per-run mutex |
| `05_mcp_filesystem_server.md` | `08_filesystem_mcp_tools.md` | Detailed tool task covers path traversal, target/ read-only, .devs/runs/ protection, search limits |
| `06_mcp_protocol_invariants.md` | `09_mcp_server_shared_state_and_data_model.md` | Shared state task covers JSON-RPC format, 1 MiB limits, consistency, bridge connection model — superset |
| `07_mcp_submission_listing_refinement.md` | `01_submit_run_tool.md` | Listing/sorting covered by list_runs in sub-epic 05; input validation covered by submit_run |
| `08_mcp_glass_box_observability.md` | `10_observation_tool_data_and_streaming.md` | Observation data task covers all the same invariants (stdout/stderr never null, truncation, pool snapshots) with more detail |
| `09_agentic_infrastructure.md` | `11_agent_state_and_context_management.md` + `12_self_dev_parallel_and_tdd_edge_cases.md` | Infrastructure split into state management and edge case tasks with much more detail |
| `10_agentic_loop_support.md` | `11_agent_state_and_context_management.md` + `12_self_dev_parallel_and_tdd_edge_cases.md` | Same split; reflexive testing and DEVS_MCP_ADDR injection covered in edge cases task |

## Remaining Overlap Flagged for Attention

### Sub-Epic 07 vs 08: TUI Framework vs TUI Visualization

Sub-epic 07 (TUI Framework, 6_UI_UX_ARCHITECTURE-REQ-*) and sub-epic 08 (TUI Visualization, 7_UI_UX_DESIGN-REQ-*) implement the **same code artifacts** but from different requirement documents. Key overlapping pairs:

- `07/07_string_constants_and_styling.md` ↔ `08/01_string_constants_and_ascii_hygiene.md`
- `07/11_log_pane_and_ansi_stripping.md` ↔ `08/04_ansi_stripping_and_log_buffer.md`
- `07/09_dag_view_widget.md` ↔ `08/08_dag_tier_precomputation.md` + `08/09_dag_box_rendering.md`
- `07/06_layout_system_and_terminal_constraints.md` ↔ `08/07_layout_system_and_terminal_sizing.md`
- `07/16_keyboard_input_and_focus_management.md` ↔ `08/11_keyboard_input_and_tab_navigation.md`
- `07/04_connection_state_machine_and_reconnect.md` ↔ `08/13_reconnection_and_status_bar.md`

These were **not merged** because they trace to different requirement spec documents (spec 6 vs spec 7) and consolidating them risks losing requirement traceability. Implementers should treat 07_ tasks as the primary implementation tasks and 08_ tasks as additional acceptance criteria / test requirements applied to the same code.

### Sub-Epic 01: Mega-Tasks (tasks 25-48)

Tasks 25-48 in sub-epic 01 are extremely large "acceptance criteria verification" tasks covering hundreds of requirement IDs each (e.g., task 43 covers 142 UI-DES-* requirements). These are essentially test-writing tasks grouped by spec document. While not duplicates of each other, they overlap with implementation tasks in sub-epics 07 and 08 where the same tests would naturally be written alongside the implementation. Implementers should cross-reference these tasks when implementing 07/08 to avoid writing tests twice.

### Sub-Epic 03 vs 07/20: CLI Implementation

`03_cli_implementation/` contains the canonical CLI tasks, but `07/20_cli_command_architecture_and_mcp_bridge.md` also covers CLI command architecture. These are not exact duplicates — 03 is implementation-focused while 07/20 covers UI/UX architecture requirements — but implementers should reference both.

## Gaps Identified (No new tasks created per constraint)

1. **No dedicated webhook dispatcher task**: Webhook delivery lifecycle, retry policy, and event emission are referenced by security tasks but no task focuses on implementing the `devs-webhook` crate's core dispatch logic (connecting webhook config to actual HTTP delivery). The `10_network_security_webhook_ssrf_tls_size_limits.md` task covers security aspects but not the basic event-to-delivery pipeline.

2. **No dedicated log retention task**: Log retention policy (configurable max age/max size) is referenced in requirements but no task explicitly implements the retention sweep mechanism.

3. **gRPC reflection**: `02_grpc_client_version_interceptor.md` depends on the scaffold task but the scaffold already covers tonic-reflection. No gap, but the version interceptor task should note reflection is already handled.

## Final File Count by Sub-Epic

| Sub-Epic | Before | After | Deleted |
|---|---|---|---|
| 01_core_grpc_server_and_infrastructure | 48 | 37 | 11 |
| 02_state_recovery_and_lifecycle | 4 | 4 | 0 |
| 03_cli_implementation | 5 | 5 | 0 |
| 04_mcp_server_framework | 7 | 4 | 3 |
| 05_mcp_tools_-_observability | 18 | 8 | 10 |
| 06_mcp_tools_-_control_and_management | 22 | 12 | 10 |
| 07_tui_framework_and_navigation | 20 | 20 | 0 |
| 08_tui_visualization_-_dag_and_logs | 16 | 16 | 0 |
| 09_risks_and_roadmap_integration | 10 | 10 | 0 |
| **Total** | **151** | **117** | **34** |
