# Task: Parallel Task Protocol: Source File Overlap Guard (Sub-Epic: 06_MCP Logging & Stage Output)

## Covered Requirements
- [3_MCP_DESIGN-REQ-083]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-mcp/tests/parallel_submission_test.rs` to verify the parallel task guarding strategy.
- [ ] The test MUST:
  - Submit multiple tasks (e.g., Task A and Task B).
  - Define both tasks as having an intersection in their `source_files` lists (e.g., both touch `src/lib.rs`).
  - Verify that the agent logic detects this intersection *before* submission.
  - Assert that instead of parallel submission, the agent serializes them by adding a `depends_on` relationship (B depends on A) in the resulting `devs` workflow submission.
  - Verify that if the `source_files` are disjoint, parallel submission proceeds normally.

## 2. Task Implementation
- [ ] Implement the `ParallelPlanOptimizer` component (or equivalent logic in the development agent/workflow):
  - Accepts a list of intended tasks with their `source_files`.
  - Performs a pairwise intersection check on all `source_files` lists.
  - If an intersection is found, it automatically serializes those tasks in the generated `WorkflowDefinition`.
  - Ensures that the integration stage is also correctly updated to depend on all serialized chains.
- [ ] Ensure that `search_content` or `list_files` via filesystem MCP is used effectively to determine the exact `source_files` impacted by each task if they are not explicitly declared.

## 3. Code Review
- [ ] Verify that the serialization is applied over ALL pairs in the session (REQ-083).
- [ ] Ensure the serialization is deterministic to avoid unstable workflow definitions.
- [ ] Validate that the check doesn't overly serialize disjoint tasks, which would defeat the purpose of parallelism.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test parallel_submission_test`.
- [ ] Confirm that intersecting tasks are serialized and disjoint tasks are parallel.

## 5. Update Documentation
- [ ] Document the "Parallel Session Guarding" rules in `docs/plan/specs/3_mcp_design.md`.
- [ ] Record the `source_files` intersection check in the AI agent's development guidelines.

## 6. Automated Verification
- [ ] Run `./do test` to verify traceability for [3_MCP_DESIGN-REQ-083].
