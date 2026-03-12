# Task: Agentic Workflow Infrastructure (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-051], [3_MCP_DESIGN-REQ-054], [3_MCP_DESIGN-REQ-055], [3_MCP_DESIGN-REQ-056], [3_MCP_DESIGN-REQ-062], [3_MCP_DESIGN-REQ-063], [3_MCP_DESIGN-REQ-068], [3_MCP_DESIGN-REQ-069], [3_MCP_DESIGN-REQ-070], [3_MCP_DESIGN-REQ-071], [3_MCP_DESIGN-REQ-072], [3_MCP_DESIGN-REQ-NEW-013], [3_MCP_DESIGN-REQ-NEW-014], [3_MCP_DESIGN-REQ-NEW-015], [3_MCP_DESIGN-REQ-NEW-016], [3_MCP_DESIGN-REQ-NEW-017], [3_MCP_DESIGN-REQ-NEW-018], [3_MCP_DESIGN-REQ-NEW-019], [3_MCP_DESIGN-REQ-NEW-022], [3_MCP_DESIGN-REQ-NEW-028], [3_MCP_DESIGN-REQ-NEW-029], [3_MCP_DESIGN-REQ-NEW-034], [3_MCP_DESIGN-REQ-NEW-035], [3_MCP_DESIGN-REQ-NEW-036]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-executor, devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-executor/tests/context_file.rs`.
- [ ] Test cases:
    - [ ] `.devs_context.json` must be written to the stage working directory before spawn.
    - [ ] It must contain the outputs of all completed dependency stages (schema in NEW-034).
    - [ ] It must respect the 10MiB total size limit, truncating proportionally if needed (EC-CTX-007).
- [ ] Write integration tests in `crates/devs-checkpoint/tests/snapshot.rs`.
- [ ] Test cases:
    - [ ] `workflow_snapshot.json` must be written at run start.
    - [ ] It must be immutable even if the live workflow definition is subsequently updated.
- [ ] Write a test for `./do test` and `./do coverage` to verify they produce `target/traceability.json` and `target/coverage/report.json` with the required schema (NEW-022, NEW-029, NEW-035).

## 2. Task Implementation
- [ ] Implement `workflow_snapshot.json` capture in `devs-scheduler` / `devs-checkpoint`:
    - [ ] Serialize `WorkflowDefinition` at the moment a run transitions from `Pending` to `Running`.
    - [ ] Store at `.devs/runs/<run-id>/workflow_snapshot.json` on the checkpoint branch.
- [ ] Implement `.devs_context.json` generation in `devs-executor`:
    - [ ] Before spawning an agent, gather outputs of all completed dependency stages.
    - [ ] Serialize to the required JSON schema (NEW-034).
    - [ ] Enforce 10MiB total size limit by truncating `stdout`/`stderr` fields proportionally across all entries.
- [ ] Implement `target/traceability.json` generator:
    - [ ] Scan `docs/plan/specs/*.md` for requirement IDs.
    - [ ] Scan `crates/**/*.rs` and `tests/**/*.rs` for `// Covers: <ID>` annotations.
    - [ ] Compare annotations with requirement IDs and test results to determine `covered: true/false`.
- [ ] Implement `target/coverage/report.json` generator that converts `cargo-llvm-cov` output to the 5-gate schema (NEW-017).

## 3. Code Review
- [ ] Verify that context and snapshot files use `schema_version: 1` as required.
- [ ] Ensure that `traceability_pct` is calculated correctly and is rounded to one decimal place.
- [ ] Check that `./do test` exits non-zero if `traceability_pct < 100.0` or if stale annotations are found.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --test context_file`
- [ ] Run `cargo test -p devs-checkpoint --test snapshot`
- [ ] Run `./do test` and verify `target/traceability.json` schema.
- [ ] Run `./do coverage` and verify `target/coverage/report.json` schema.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that the server now provides authoritative context files and traceability memory.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage of infrastructure requirements.
