# Task: RefactorNode - Integrate with surgical_edit Tool (Sub-Epic: 12_3_MCP)

## Covered Requirements
- [3_MCP-TAS-085]

## 1. Initial Test Written
- [ ] Write integration tests that mock the surgical_edit interface and assert RefactorNode calls it correctly with a minimal patch payload.
  - Test file: tests/integration/test_refactornode_surgical_edit.py
  - Tests to write first:
    1. test_calls_surgical_edit_with_patch: mock surgical_edit to capture calls; call RefactorNode.apply_patch(sandbox) and assert surgical_edit invoked with arguments: {repo_root: sandbox, patches: [{file_path, start_line, end_line, replacement_text}], commit_message: "Refactor: <task_id>"}.
    2. test_translates_changes_to_unified_diff: verify that RefactorNode converts its internal changes list into a unified-diff string payload when surgical_edit expects a single patch blob.
    3. test_surgical_edit_failure_handling: mock surgical_edit to return an error; assert RefactorNode surfaces the error in its return value and does not commit.

## 2. Task Implementation
- [ ] Implement the surgical_edit integration in RefactorNode:
  - Add a small adapter module src/tools/surgical_edit_adapter.{py,ts} that exposes apply_patches(repo_root, patches, metadata) -> {success, artifact_id, diff}
  - The adapter must validate patch shapes, build a unified-diff, and call the repository surgical_edit implementation (or an RPC/local CLI) using the project's tool-invocation patterns (use ToolRegistry or subprocess wrapper in repo).
  - Make RefactorNode.apply_patch call the adapter after local validation and before writing final files; if surgical_edit returns success, update node status and return patch metadata.
  - Ensure adapter is dependency-injected or looked up through existing ToolRegistry so it can be mocked for tests.

## 3. Code Review
- [ ] Verify:
  - Proper use of the project's ToolRegistry or process invocation helpers.
  - No direct filesystem writes in the adapter; surgical_edit is the single writer to ensure atomicity.
  - Adapter has comprehensive input validation and clear error mapping.

## 4. Run Automated Tests to Verify
- [ ] Run the integration tests with surgical_edit mocked. Example command: `pytest tests/integration/test_refactornode_surgical_edit.py -q`.

## 5. Update Documentation
- [ ] Document adapter API and the expected patch payload shape in docs/tools/surgical_edit_adapter.md and reference it from docs/agents/refactor_node.md.

## 6. Automated Verification
- [ ] Add an end-to-end CI integration test that runs the adapter against a lightweight surgical_edit stub and verifies the returned artifact_id is well-formed and the diff applies cleanly to a sandbox repo.
