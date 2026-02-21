# Task: Implement MCP Subscription Hydration for Tier 2 (Sub-Epic: 06_Global_State_Tiers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-042]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/state/__tests__/mcp.sync.test.ts` to test the bridge between MCP messages and `useProjectStore`.
- [ ] Mock a `STATE_CHANGE` MCP message containing task updates.
- [ ] Verify that `useProjectStore.getState().tasks` is updated with the new task data from the mocked message.
- [ ] Test that multiple incoming updates for the same task correctly apply the latest state.
- [ ] Mock the initial `full_state` hydration on connection.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/state/mcp.bridge.ts` to coordinate MCP and Zustand.
- [ ] Implement `initSync()` function that sets up listeners for `STATE_CHANGE` events.
- [ ] Implement an initial hydration call to get the current project state from the MCP server on startup.
- [ ] Build the message handler for `STATE_CHANGE` that dispatches updates to `useProjectStore`: `useProjectStore.getState().updateTask(id, payload)`.
- [ ] Handle full snapshots vs. partial updates if defined by the MCP protocol.
- [ ] Ensure the bridge is started in the VSCode Extension `activate()` function.

## 3. Code Review
- [ ] Verify that MCP messages are parsed correctly before updating the store.
- [ ] Check that `STATE_CHANGE` updates only the relevant parts of the store (surgical reactivity).
- [ ] Ensure no performance bottlenecks occur when handling high-frequency updates (e.g., streaming logs/thoughts).

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test packages/vscode/src/state/__tests__/mcp.sync.test.ts`.
- [ ] Ensure 100% pass rate.

## 5. Update Documentation
- [ ] Update `packages/vscode/README.md` explaining how the Tier 2 store stays in sync with the core orchestrator via MCP.
- [ ] Document the `STATE_CHANGE` event payload structure.

## 6. Automated Verification
- [ ] Run `tsc` in `packages/vscode` to verify the types for the MCP bridge.
