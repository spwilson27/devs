# Task: gRPC API Design Review for Future GUI Compatibility (Sub-Epic: 040_Detailed Domain Specifications (Part 5))

## Covered Requirements
- [1_PRD-REQ-058]

## Dependencies
- depends_on: []
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] In `devs-proto`, create a test module `test_gui_compatibility_contract` that validates the proto-generated Rust types meet GUI-friendliness criteria:
  1. `WorkflowRun` message contains structured fields: `run_id` (string), `status` (enum, not string), `created_at` (Timestamp), `updated_at` (Timestamp), `stages` (repeated message, not a flattened string).
  2. `StageRun` message contains: `stage_id` (string), `status` (enum), `started_at` (optional Timestamp), `completed_at` (optional Timestamp), `depends_on` (repeated string).
  3. `LogLine` message contains: `timestamp` (Timestamp), `level` (enum), `stage_id` (string), `content` (string) — no ANSI escape codes in the proto field definitions themselves.
  4. All status fields use protobuf `enum` types (not raw strings) so GUI clients get a stable, typed API.
  5. The test asserts these fields exist on the generated Rust structs (e.g., `WorkflowRun::default().status` compiles and is an enum variant, not a `String`).
- [ ] Add `// Covers: 1_PRD-REQ-058` annotation to the test.
- [ ] NOTE: This test depends on the proto definitions from Sub-Epic 008 (devs-proto). If the protos are not yet defined, write the test against the expected struct shapes and mark with `// BOOTSTRAP-STUB: proto definitions from Sub-Epic 008`. The test will initially fail to compile, which is correct TDD behavior.

## 2. Task Implementation
- [ ] Review all `.proto` files in `proto/devs/v1/` and verify each service response message uses structured, typed fields suitable for programmatic consumption by any client (CLI, TUI, or future GUI).
- [ ] Ensure all status fields are `enum` types, not `string` — this provides compile-time safety for GUI clients.
- [ ] Ensure all timestamp fields use `google.protobuf.Timestamp`, not string-formatted dates.
- [ ] Ensure the DAG structure (stage dependencies) is exposed as structured data (repeated `depends_on` fields or a dedicated `DependencyGraph` message) so a GUI can render the workflow graph visually.
- [ ] Ensure log streaming RPCs (`StreamLogs`) return structured `LogLine` messages, not raw text blobs.
- [ ] If any proto messages are found to use flattened strings where structured types are appropriate, update the `.proto` files and regenerate bindings.
- [ ] Add a `// GUI compatibility: [1_PRD-REQ-058]` comment in each relevant `.proto` file near the service/message definitions.

## 3. Code Review
- [ ] Verify that no proto message field contains terminal-specific data (ANSI escape codes, raw terminal output) in its type definition. Terminal formatting is a client-side concern.
- [ ] Verify that the gRPC API provides sufficient state information for a GUI to render: workflow list, run detail with stage graph, per-stage status and timing, log streaming, pool utilization.
- [ ] Confirm that the API design does not require server modifications for a future GUI client to connect — the existing RPCs and messages should be sufficient.
- [ ] Verify that enum values include an `UNSPECIFIED` variant (proto3 best practice) for forward compatibility.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto` and confirm the GUI compatibility contract tests pass.
- [ ] Run `./do build` to ensure proto compilation succeeds with any changes.

## 5. Update Documentation
- [ ] Add a section to `proto/devs/v1/README.md` (or a comment block in the main `.proto` file) explaining the GUI-compatibility design principle: all messages use structured types, enums for statuses, Timestamps for dates, and expose graph structure for visual rendering.

## 6. Automated Verification
- [ ] Run `./do test` and verify exit code 0.
- [ ] Verify `1_PRD-REQ-058` appears in `target/traceability.json` from the traceability scanner.
