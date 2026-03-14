# Task: write_workflow_definition Atomicity & Validation (Sub-Epic: 03_MCP Execution Control & Atoms)

## Covered Requirements
- [3_MCP_DESIGN-REQ-087]

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-config, devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/write_workflow_atomicity.rs`.
- [ ] The test MUST:
    - [ ] Initialize a mock `CheckpointStore` and `ProjectRegistry`.
    - [ ] Call `write_workflow_definition` with a malformed TOML (syntax error) and verify that the file on disk is NOT created/modified and returns `invalid_argument`.
    - [ ] Call `write_workflow_definition` with a valid TOML but invalid workflow logic (e.g., a dependency cycle) and verify that the file on disk remains unchanged.
    - [ ] Use a mock filesystem that fails during the `rename` operation (e.g., after the `.tmp` file is written) and verify that the original workflow definition (if any) is preserved.
    - [ ] Verify that a successful write uses the `.tmp` -> `rename` pattern to ensure atomicity.

## 2. Task Implementation
- [ ] Implement/Update the `write_workflow_definition` tool in `crates/devs-mcp/src/tools/control.rs`:
    - [ ] Integrate with `devs-config` to perform full `WorkflowDefinition` validation (syntax + DAG validity) before any IO.
    - [ ] Use `tempfile` or a similar pattern to write the new content to `<path>.tmp`.
    - [ ] Perform an atomic `std::fs::rename` from the `.tmp` path to the final `.devs/workflows/<name>.toml` path.
    - [ ] Ensure that the `ProjectRegistry` is notified to reload the definition after a successful write.
- [ ] Ensure the tool returns `validated: true` and the final `source_path` on success.

## 3. Code Review
- [ ] Verify that the write lock is held during the entire validation-and-write sequence to prevent concurrent `submit_run` calls from reading a partial file.
- [ ] Check that the `.tmp` file is cleaned up if validation fails or the server crashes.
- [ ] Confirm that Rust-format workflows are rejected with the appropriate error message.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test write_workflow_atomicity`
- [ ] Run `./do test` and verify traceability for REQ-087.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` §2.5.9 to explicitly document the `.tmp` rename atomic guarantee.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-087]` as covered.
