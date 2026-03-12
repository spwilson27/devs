# Task: Implement list_checkpoints MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-014], [3_MCP_DESIGN-REQ-EC-OBS-006], [3_MCP_DESIGN-REQ-EC-OBS-DBG-010]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-mcp, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_obs.rs`.
- [ ] Test `list_checkpoints`:
    - Verify it returns a list of git commits from the project's state branch.
    - Test run with no checkpoints yet (e.g. `Pending`). // Covers: [3_MCP_DESIGN-REQ-EC-OBS-006]
    - Test project whose checkpoint branch has never been written. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-010]
    - Test pagination using `before_sha` and `limit`.

## 2. Task Implementation
- [ ] Implement `list_checkpoints` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Integrate with `devs-checkpoint` to execute `git log` on the relevant branch.
- [ ] Use `tokio::task::spawn_blocking` for the git operation to avoid blocking the async runtime.
- [ ] Ensure the response includes `checkpoints`, `has_more`, and `next_before_sha`.

## 3. Code Review
- [ ] Verify that no write locks are held during the git query.
- [ ] Ensure the tool handles cases where the git repository or branch is missing gracefully.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Document the pagination behavior for `list_checkpoints`.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
