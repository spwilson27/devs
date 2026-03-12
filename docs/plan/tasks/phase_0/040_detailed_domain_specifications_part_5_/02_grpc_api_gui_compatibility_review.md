# Task: gRPC API Design Review for GUI Compatibility (Sub-Epic: 040_Detailed Domain Specifications (Part 5))

## Covered Requirements
- [1_PRD-REQ-058]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Add a new test case to `devs-proto` (or an integration test) that validates the gRPC message structures (e.g., `RunStatus`, `LogLine`, `StageStatus`) contain structured data fields (like `id`, `status_enum`, `timestamp`, `metadata_json`) rather than just flattened strings.
- [ ] The test should FIRST fail if any core message lacks these structured fields (e.g., if `RunStatus` only returns a string summary).

## 2. Task Implementation
- [ ] Review the `.proto` files in `proto/devs/v1/` (from Sub-Epic 008) to ensure they are designed with structured fields that a future GUI (e.g., a React dashboard or a local Electron app) can consume efficiently.
- [ ] Ensure that `LogLine` includes structured fields for `stage_id`, `timestamp`, `level`, and `content`.
- [ ] Ensure that `RunStatus` and `StageStatus` are enums, not strings, to provide a stable API for GUI clients.
- [ ] Implement a simple "GUI compatibility checklist" document inside `devs-proto` and verify the current schema against it.
- [ ] Add any missing structured fields (like `estimated_completion_time`, `elapsed_duration`, `dependency_graph_json`) if the current schema is too thin.

## 3. Code Review
- [ ] Verify that the gRPC API is NOT coupled to terminal-specific behaviors (like ANSI escape codes in status fields, unless explicitly requested).
- [ ] Ensure the API provides enough state information (e.g., full DAG structure) for a GUI to render the workflow graph visually.
- [ ] Confirm that `1_PRD-REQ-058` is satisfied by the current proto definitions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto` and ensure the schema-checking tests pass.
- [ ] Run the proto-compiler to ensure no syntax errors were introduced.

## 5. Update Documentation
- [ ] Update `devs-proto/README.md` to explain the design philosophy for GUI compatibility.
- [ ] Update `.agent/MEMORY.md` reflecting the completion of the GUI compatibility review for the gRPC API.

## 6. Automated Verification
- [ ] Run `./do build` to ensure all gRPC bindings are generated correctly.
- [ ] Verify that the traceability script finds the requirement ID in the test or documentation.
