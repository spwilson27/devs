# Task: Enforce SubmitRun as Sole Run Creation Path (Sub-Epic: 044_Detailed Domain Specifications (Part 9))

## Covered Requirements
- [1_PRD-REQ-077]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-server, devs-proto]

## 1. Initial Test Written
- [ ] Create an architectural verification test in `devs-core` or a dedicated verification tool in `.tools/`.
- [ ] This test MUST grep/search the entire workspace (excluding `devs-proto` generated code and `devs-core` itself) for any direct instantiation of the `WorkflowRun` or calls to the authoritative `create_run` method.
- [ ] The test MUST verify that only the `SubmitRun` gRPC handler and the MCP `submit_run` tool are allowed to invoke the run creation logic.

## 2. Task Implementation
- [ ] In `devs-core`, restrict the visibility of the `WorkflowRun` constructor or its creation logic (e.g., using `pub(crate)` or `pub(in crate::server)` if possible, though they are in different crates).
- [ ] Alternatively, define a specific "Run Creation" trait or token that is only accessible or obtainable through the gRPC/MCP request handlers.
- [ ] Implement an automated architectural check (e.g., in `.tools/arch_check.py` or as a `cargo test`) that verifies this constraint by inspecting call sites.
- [ ] Ensure any violation of this rule fails the build or test suite.

## 3. Code Review
- [ ] Verify that no "test-only" backdoors bypass this requirement unless explicitly marked and audited.
- [ ] Ensure the MCP `submit_run` tool uses the same internal service path as the gRPC `SubmitRun` method.

## 4. Run Automated Tests to Verify
- [ ] Run the architectural verification test and ensure it passes for the current codebase.

## 5. Update Documentation
- [ ] Update the `devs-core` documentation to state that `SubmitRun` is the only authorized code path for creating a new `WorkflowRun`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the new architectural test is executed and passes, annotated with `/// Verifies [1_PRD-REQ-077]`.
