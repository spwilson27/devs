# Task: Reflexive Agentic Loop Invariants and Glass-Box Verification (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-008], [9_PROJECT_ROADMAP-REQ-109], [9_PROJECT_ROADMAP-REQ-110], [9_PROJECT_ROADMAP-REQ-251], [9_PROJECT_ROADMAP-REQ-291], [9_PROJECT_ROADMAP-REQ-292]
- [8_RISKS-REQ-301] through [8_RISKS-REQ-367]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler, devs-grpc]

## 1. Initial Test Written
- [ ] Create a new integration test in `tests/reflexive_loop_tests.rs`.
- [ ] Test cases must verify the `diagnostic_read_before_write` invariant: the agent MUST read a file before making a modification via the same tool.
- [ ] Test cases must verify that the server rejects a `SubmitRunRequest` if the `run_name` conflicts with an active run (Atomic Collision Check).
- [ ] Test cases must verify that if the server goes into `read-only` mode (e.g., during a backup), all `submit_run` and `cancel_run` calls return the correct gRPC error code.
- [ ] Test cases must verify that the `Glass-Box` active status is accurately reflected in the server heartbeat and MCP metadata.

## 2. Task Implementation
- [ ] Enhance `devs-core`'s `StateMachine` to enforce atomic `run_name` registration and rejection of duplicates.
- [ ] Implement the `diagnostic-read-enforcement` in the MCP server: track which files an agent has read and issue a warning/block if a `replace` call is made on an unread file.
- [ ] Add the `Glass-Box` heartbeat to the gRPC `WorkflowService`: a periodic event containing high-level server health and active project stats.
- [ ] Implement the `agent-reentry-protection`: if an agent is already working on a project, additional agents are queued until the first one signals completion or times out.
- [ ] Add the `reflexive_log_audit`: after each agent stage, the server parses the logs to verify the agent didn't "lie" about a test passing (e.g., by matching `PASSED` against actual exit codes).

## 3. Code Review
- [ ] Verify that the reflexive invariants are implemented in the core state machine, not just the interface layer.
- [ ] Ensure the Glass-Box observability doesn't leak sensitive data in its metadata.
- [ ] Check that the reentry protection is fair and handles long-running agents gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test reflexive_loop_tests`.
- [ ] Verify the gRPC and MCP interfaces correctly expose the new metadata.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/9_project_roadmap.md` with the new agentic loop invariants and Glass-Box details.
- [ ] Ensure `MEMORY.md` reflects the completion of these core reflexive capabilities.

## 6. Automated Verification
- [ ] Attempt a "blind write" (without reading) via the MCP tool and verify the server rejects it.
- [ ] Submit two runs with the same name simultaneously and verify only one succeeds.
