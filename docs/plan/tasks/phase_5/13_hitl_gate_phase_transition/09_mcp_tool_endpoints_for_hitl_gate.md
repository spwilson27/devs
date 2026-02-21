# Task: Implement MCP Tool Endpoints for HITL Gate (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001], [9_ROADMAP-DOD-P3]

## 1. Initial Test Written
- [ ] In `packages/mcp-server/src/__tests__/hitl-gate.tools.test.ts`, write unit tests using a mock MCP SDK that assert:
  - The MCP server exposes a tool named `devs_get_phase_gate` with input schema `{ gateId: string }`.
  - `devs_get_phase_gate({ gateId })` calls `IPhaseGateRepository.findById(gateId)` and returns the serialized `PhaseGateRecord` as JSON content.
  - `devs_get_phase_gate({ gateId: 'unknown' })` returns an MCP error response with code `NOT_FOUND`.
  - The MCP server exposes a tool named `devs_approve_phase_gate` with input schema `{ gateId: string; approvedBy: string }`.
  - `devs_approve_phase_gate({ gateId, approvedBy })` calls `HITLApprovalService.recordApproval(gateId, approvedBy)` and returns `{ success: true, newState: 'APPROVED' }`.
  - `devs_approve_phase_gate()` on a non-`AWAITING_USER_APPROVAL` gate returns an MCP error with code `INVALID_STATE`.
  - The MCP server exposes a tool named `devs_reject_phase_gate` with input schema `{ gateId: string; reason: string }`.
  - `devs_reject_phase_gate({ gateId, reason })` calls `HITLApprovalService.recordRejection(gateId, reason)` and returns `{ success: true, newState: 'REJECTED' }`.
  - The MCP server exposes a tool named `devs_trigger_phase_transition` with input schema `{ gateId: string }`.
  - `devs_trigger_phase_transition({ gateId })` calls `PhaseTransitionService.executeTransition(gateId)` and returns `{ success: true, nextPhase: 'architecture' }`.
  - `devs_trigger_phase_transition()` on a non-APPROVED gate returns an MCP error with code `TRANSITION_BLOCKED`.

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/tools/hitl-gate.tools.ts`:
  - Import `IPhaseGateRepository`, `HITLApprovalService`, `PhaseTransitionService`, and error types from `@devs/core`.
  - Define and export `registerHITLGateTools(server: McpServer, deps: { repository: IPhaseGateRepository; hitlService: HITLApprovalService; transitionService: PhaseTransitionService }): void`.
  - Register `devs_get_phase_gate`:
    - Input schema: `{ gateId: z.string() }` (use `zod`).
    - Handler: call `repository.findById(gateId)`, return JSON content or NOT_FOUND error.
  - Register `devs_approve_phase_gate`:
    - Input schema: `{ gateId: z.string(), approvedBy: z.string() }`.
    - Handler: call `hitlService.recordApproval(gateId, approvedBy)`, return success response or INVALID_STATE error.
  - Register `devs_reject_phase_gate`:
    - Input schema: `{ gateId: z.string(), reason: z.string().min(1) }`.
    - Handler: call `hitlService.recordRejection(gateId, reason)`, return success response or INVALID_STATE error.
  - Register `devs_trigger_phase_transition`:
    - Input schema: `{ gateId: z.string() }`.
    - Handler: call `transitionService.executeTransition(gateId)`, return result or TRANSITION_BLOCKED error.
- [ ] Call `registerHITLGateTools()` in the MCP server's bootstrap/initialization file (`packages/mcp-server/src/index.ts`), passing wired-up dependencies from the DI container.
- [ ] Update `packages/mcp-server/src/tools/index.ts` to export `registerHITLGateTools`.

## 3. Code Review
- [ ] Verify all four tools use `zod` schemas for input validation (not manual `typeof` checks).
- [ ] Verify error responses use the correct MCP error structure (not thrown JavaScript exceptions that would crash the server).
- [ ] Verify tool handlers catch `InvalidPhaseGateTransitionError` and `PhaseTransitionBlockedError` specifically, returning structured MCP errors rather than propagating raw exceptions.
- [ ] Verify no sensitive data (e.g., internal stack traces) is included in MCP error responses.
- [ ] Verify tool names follow the `devs_<verb>_<noun>` naming convention.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="hitl-gate.tools"` and confirm all tests pass.
- [ ] Confirm tests for all four tools cover both success and error paths.

## 5. Update Documentation
- [ ] Create `packages/mcp-server/src/tools/hitl-gate.tools.agent.md` documenting:
  - All four tool names, input schemas, success response shapes, and error codes.
  - Example MCP call/response for each tool.
  - Dependencies injected via `registerHITLGateTools()`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test:coverage -- --testPathPattern="hitl-gate.tools"` and assert exit code 0 with ≥ 95% branch coverage.
- [ ] Run `pnpm --filter @devs/mcp-server build` and assert exit code 0.
