# Task: Implement list_checkpoints MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-014], [3_MCP_DESIGN-REQ-EC-OBS-006], [3_MCP_DESIGN-REQ-EC-OBS-DBG-010]

## Dependencies
- depends_on: ["03_get_run_tool.md"]
- shared_components: ["devs-checkpoint (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/list_checkpoints_test.rs`:
  - `test_list_checkpoints_returns_commits`: create a project with 3 checkpoint commits, call `list_checkpoints`, assert response contains 3 entries each with `sha`, `timestamp`, `message`
  - `test_list_checkpoints_pagination`: create 25 checkpoint commits, call with default limit, assert `has_more: true` and `next_before_sha` is set; call again with `before_sha` param, assert remaining commits returned
  - `test_list_checkpoints_pending_run_no_checkpoints` (EC-OBS-006): create a run in `Pending` status that has no checkpoint commits yet, call `list_checkpoints`, assert `{"checkpoints": [], "has_more": false, "next_before_sha": null}` — not an error
  - `test_list_checkpoints_branch_never_written` (EC-OBS-DBG-010): project whose checkpoint branch has never been created in git, call `list_checkpoints`, assert `{"checkpoints": [], "has_more": false, "next_before_sha": null}` — no error, branch is created lazily on first write
  - `test_list_checkpoints_project_not_found`: call with nonexistent `project_id`, assert `not_found` error

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `list_checkpoints` handler:
  - Accept: `project_id: String`, `run_id: Option<String>`, `before_sha: Option<String>`, `limit: Option<u32>` (default 50)
  - Call `checkpoint_store.list_commits(project, run_id, before_sha, limit)` via `spawn_blocking` (git2 operations)
  - If checkpoint branch doesn't exist in git, return empty list (EC-OBS-DBG-010) — do NOT create the branch or return an error
  - If run is `Pending` with no checkpoints, return empty list (EC-OBS-006)
  - Serialize: `checkpoints` array (each: `sha`, `timestamp`, `message`), `has_more`, `next_before_sha`
- [ ] Register in MCP tool registry

## 3. Code Review
- [ ] Verify git2 calls are wrapped in `spawn_blocking` to avoid blocking the async runtime
- [ ] Verify missing branch is handled without error (not a `git2::Error` propagation)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- list_checkpoints` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments documenting pagination behavior and empty-branch semantics

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
