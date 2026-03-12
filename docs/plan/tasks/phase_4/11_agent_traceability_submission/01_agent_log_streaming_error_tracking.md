# Task: Agent Log Streaming & Error Sequence Recording (Sub-Epic: 11_Agent Traceability & Submission)

## Covered Requirements
- [3_MCP_DESIGN-REQ-036], [3_MCP_DESIGN-REQ-037]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-grpc, devs-mcp]

## 1. Initial Test Written
- [ ] Create an E2E test case `tests/e2e/test_agent_observability.rs` that simulates an AI agent performing a development task on the `devs` server.
- [ ] The test must verify that the agent uses `stream_logs` with `follow: true` when waiting for stage completion, rather than polling `get_stage_output`.
- [ ] The test must simulate a stage failure with output containing an "error" line (e.g., a Rust compilation error).
- [ ] The test must verify that the agent records the `sequence` number of the first error line emitted during the `stream_logs` session.
- [ ] The test must confirm that the agent uses this sequence number in a subsequent `get_stage_output` or `stream_logs(from_sequence: N)` call to locate the error efficiently.

## 2. Task Implementation
- [ ] Update the AI agent's Standard Operating Procedure (SOP) or system instructions (e.g., in `.devs/prompts/agent_sop.md` or as part of the MCP tool documentation in `crates/devs-mcp/src/lib.rs`).
- [ ] Explicitly instruct the agent to use `stream_logs(follow: true)` for real-time stage monitoring to save context window and pool bandwidth.
- [ ] Mandate the recording of the `sequence` number of the first error detected in the log stream.
- [ ] Implement a helper utility or a recommended pattern in the agent's toolbox for "skipping to error" using the recorded sequence number.
- [ ] Ensure the `devs-mcp` bridge and server correctly propagate monotonic sequence numbers starting at 1 with no gaps, as required by [3_MCP_DESIGN-REQ-DBG-BR-001].

## 3. Code Review
- [ ] Verify that `stream_logs` correctly delivers chunks with sequence numbers.
- [ ] Ensure that `follow: true` holds the connection open as expected and flushes output immediately.
- [ ] Confirm that the agent's logic for "skipping to error" using the sequence number correctly offsets from the start of the log buffer.
- [ ] Check for proper error handling if the stream is interrupted (the agent should use `from_sequence` to resume).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_agent_observability` to verify the observability patterns are followed.
- [ ] Ensure the test passes on all platforms (Linux, macOS, Windows).

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` to reflect the established agent diagnostic protocol for log streaming.
- [ ] Update the project's "Glass-Box" section in the README to emphasize the importance of sequence-based error tracking.

## 6. Automated Verification
- [ ] Run `./do test` to ensure traceability for `[3_MCP_DESIGN-REQ-036]` and `[3_MCP_DESIGN-REQ-037]` is updated in `target/traceability.json`.
- [ ] Verify that the E2E test individually achieves at least 50% line coverage of the `stream_logs` handler in `devs-mcp`.
