# Task: Implement ToolRegistry and Role-Based Permissions (Sub-Epic: 07_TAS)

## Covered Requirements
- [TAS-098], [TAS-079]

## 1. Initial Test Written
- [ ] In `packages/core/src/agents/__tests__/tool-registry.test.ts` write unit tests that:
  - Instantiate `ToolRegistry` and register tools with metadata `{ name, id, allowedRoles }` for a small test set (e.g., `file:read`, `file:write`, `sandbox:exec`, `search`, `summarize`).
  - Verify `ToolRegistry.register(toolMeta)` stores meta and `ToolRegistry.get(toolId)` returns the meta.
  - Verify `ToolRegistry.canRoleUse(roleId, toolId)` returns true/false according to registered `allowedRoles` and default role inheritance (if any).
  - Verify attempting to use a tool from an agent with insufficient permissions throws a descriptive `PermissionDeniedError`.
  - Verify serialization: `ToolRegistry.export()` returns stable JSON describing all tools and allowed roles.

## 2. Task Implementation
- [ ] Implement `packages/core/src/agents/tool-registry.ts` exporting `ToolRegistry` with the methods: `register(toolMeta)`, `get(toolId)`, `canRoleUse(roleId, toolId)`, `grantRoleTool(roleId, toolId)`, `export()`.
- [ ] Add `// REQ: TAS-098` and `// REQ: TAS-079` comments at the top of the file.
- [ ] Ensure `ToolRegistry` supports pluggable backends (in-memory default, optional SQLite adapter later).
- [ ] Provide a small runtime example in `packages/core/src/agents/tool-registry.example.ts` showing how to create a registry, register `sandbox:exec` and grant it to `developer`.

## 3. Code Review
- [ ] Verify `ToolRegistry` enforces least-privilege by default (no implicit grants unless explicitly configured).
- [ ] Confirm error messages are actionable and that permission checks are fast (O(1) lookup when using maps).
- [ ] Check `// REQ: TAS-098` and `// REQ: TAS-079` annotations exist.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="tool-registry"` to run the new tests and confirm they pass.
- [ ] Run the full test suite to ensure no regressions.

## 5. Update Documentation
- [ ] Add `docs/agents/tool-registry.md` explaining tool metadata, permission model, and examples of safe tool definitions.
- [ ] Add an entry to `packages/core/src/agents/prompts/prompts.agent.md` explaining how `allowedTools` interacts with `ToolRegistry`.

## 6. Automated Verification
- [ ] Run `node -e "require('./packages/core/src/agents/tool-registry').selfTest()"` (implement `selfTest()` helper) and assert exit code 0.
- [ ] Run `grep -n "REQ: TAS-098" packages/core/src/agents/tool-registry.ts` and assert exit code 0.
- [ ] Ensure `pnpm --filter @devs/core build` passes type checks.
