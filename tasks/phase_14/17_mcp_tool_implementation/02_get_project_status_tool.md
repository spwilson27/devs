# Task: Implement `get_project_status` MCP Tool (Sub-Epic: 17_MCP Tool Implementation)

## Covered Requirements
- [2_TAS-REQ-006]

## 1. Initial Test Written
- [ ] Create `src/mcp/tools/__tests__/get-project-status.test.ts` with the following test cases:
  - Calling `getProjectStatus()` returns a `ProjectStatus` object with fields:
    - `requirementFulfillment: { total: number, covered: number, uncovered: string[] }`
    - `taskProgress: { total: number, done: number, inProgress: number, pending: number, blocked: number }`
    - `currentPhase: string`
    - `currentTask: string | null`
  - When the DB has 10 requirements (8 covered, 2 uncovered) and 5 tasks (2 done, 1 in-progress, 2 pending): assert each field equals expected values.
  - When the DB is empty: assert all counts are 0 and `uncovered` is `[]`.
  - Test that the tool is registered in the MCP server and returns the correct JSON schema response when called via the MCP protocol.
  - Integration test: seed a real SQLite DB file in a temp directory and call the tool handler end-to-end.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/get-project-status.ts`:
  - Export interface `ProjectStatus` (fields as above).
  - Export async function `getProjectStatus(db: Database): Promise<ProjectStatus>`.
  - Query `SELECT COUNT(*) as total, SUM(CASE WHEN covered = 1 THEN 1 ELSE 0 END) as covered FROM requirements`.
  - Query `SELECT requirement_id FROM requirements WHERE covered = 0` to build `uncovered`.
  - Query `SELECT status, COUNT(*) as cnt FROM tasks GROUP BY status` to build task progress.
  - Query `SELECT id FROM phases WHERE active = 1 LIMIT 1` for `currentPhase`.
  - Query `SELECT id FROM tasks WHERE status = 'in_progress' LIMIT 1` for `currentTask`.
  - Return a fully populated `ProjectStatus`.
- [ ] Register the tool in `src/mcp/server.ts`:
  - Tool name: `get_project_status`
  - Input schema: `{}` (no parameters)
  - Output schema: JSON Schema matching `ProjectStatus`
  - Handler: instantiate `getProjectStatus(db)` and return the result.

## 3. Code Review
- [ ] Confirm all DB queries use parameterised statements.
- [ ] Verify the tool input schema is defined with `additionalProperties: false` to reject unexpected fields.
- [ ] Confirm `ProjectStatus` serialises cleanly (no `undefined`, no `NaN` — use `?? 0` defaults).
- [ ] Ensure the function is pure with respect to side-effects: it reads but never mutates DB state.
- [ ] Confirm the MCP handler wraps the call in `try/catch` and returns a structured MCP error on failure.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/get-project-status` and confirm all tests pass.
- [ ] Run `npm run build` to confirm TypeScript compiles without errors in strict mode.

## 5. Update Documentation
- [ ] Add `get_project_status` section to `docs/mcp-tools.md` with:
  - Description: "Returns current requirement fulfillment and task progress."
  - Input: none
  - Output: `ProjectStatus` JSON schema snippet
  - Example response JSON
- [ ] Create `src/mcp/tools/get-project-status.agent.md` documenting purpose, query strategy, and caveats.
- [ ] Add `// [2_TAS-REQ-006]` traceability comment at the top of `get-project-status.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/get-project-status --coverage` and assert line coverage ≥ 90%.
- [ ] Run `grep -r "get_project_status" src/mcp/server.ts` and confirm the tool is registered.
- [ ] Run `grep "2_TAS-REQ-006" src/mcp/tools/get-project-status.ts` and confirm the traceability comment exists.
