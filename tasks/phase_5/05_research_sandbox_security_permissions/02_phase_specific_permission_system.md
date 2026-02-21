# Task: Implement Phase-Specific Dynamic Permission System for Research Agents (Sub-Epic: 05_Research Sandbox & Security Permissions)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-016]

## 1. Initial Test Written
- [ ] In `src/research/sandbox/__tests__/permission_manager.test.ts`, write the following unit tests:
  - `PermissionManager > grantsResearchToolsOnlyDuringDiscoveryPhase`:
    - Instantiate `PermissionManager` with `phaseId = 'PHASE_5_DISCOVERY'`.
    - Assert `isToolAllowed('web_search')` returns `true`.
    - Assert `isToolAllowed('code_write')` returns `false`.
    - Assert `isToolAllowed('file_system_write')` returns `false`.
  - `PermissionManager > revokesResearchToolsDuringImplementationPhase`:
    - Instantiate `PermissionManager` with `phaseId = 'PHASE_7_IMPLEMENTATION'`.
    - Assert `isToolAllowed('web_search')` returns `false`.
    - Assert `isToolAllowed('code_write')` returns `true`.
  - `PermissionManager > transitionRevokesOldPermissionsAndGrantsNew`:
    - Start with `phaseId = 'PHASE_5_DISCOVERY'`, verify `isToolAllowed('web_search')` is `true`.
    - Call `transitionToPhase('PHASE_7_IMPLEMENTATION')`.
    - Assert `isToolAllowed('web_search')` returns `false`.
    - Assert `isToolAllowed('code_write')` returns `true`.
  - `PermissionManager > logsPermissionDenialOnBlockedToolAccess`:
    - Mock the `AuditLogger.log()` method.
    - Instantiate with `phaseId = 'PHASE_7_IMPLEMENTATION'`.
    - Call `checkAndLog('web_search', 'research-agent-001')`.
    - Assert `AuditLogger.log()` was called with a `PERMISSION_DENIED` event containing the tool name, agent ID, and current phase.
  - `PermissionManager > throwsOnUnrecognizedPhaseId`:
    - Assert `new PermissionManager({ phaseId: 'UNKNOWN_PHASE' })` throws `UnknownPhaseError`.

## 2. Task Implementation
- [ ] Create `src/research/sandbox/phase_permission_map.ts`:
  - Define a `PhaseId` enum or string union type covering at minimum: `'PHASE_5_DISCOVERY'`, `'PHASE_6_ARCHITECTURE'`, `'PHASE_7_IMPLEMENTATION'`, `'PHASE_8_TESTING'`.
  - Export a `PHASE_TOOL_PERMISSIONS` constant mapping each `PhaseId` to an object: `{ allowed: string[]; denied: string[] }`.
  - For `PHASE_5_DISCOVERY`, `allowed` must include: `'web_search'`, `'content_extract'`, `'report_write'`; `denied` must include: `'code_write'`, `'file_system_write'`, `'shell_exec'`.
  - For `PHASE_7_IMPLEMENTATION`, `allowed` must include: `'code_write'`, `'file_system_write'`, `'shell_exec'`; `denied` must include: `'web_search'`, `'content_extract'`.
- [ ] Create `src/research/sandbox/permission_manager.ts`:
  - Export a `PermissionManager` class with:
    - Constructor accepting `{ phaseId: PhaseId }`. Validates the phase ID against `PHASE_TOOL_PERMISSIONS`; throws `UnknownPhaseError` if not found.
    - `isToolAllowed(toolName: string): boolean` — returns `true` if the tool is in the `allowed` list for the current phase.
    - `transitionToPhase(newPhaseId: PhaseId): void` — updates the internal phase, validates the new phase ID.
    - `checkAndLog(toolName: string, agentId: string): boolean` — calls `isToolAllowed()`; if denied, calls `AuditLogger.log({ event: 'PERMISSION_DENIED', toolName, agentId, phaseId: currentPhase, timestamp: Date.now() })`; returns the result.
    - `getCurrentPhase(): PhaseId` — returns the current phase ID.
- [ ] Add `UnknownPhaseError` to `src/research/sandbox/errors.ts`:
  - `UnknownPhaseError extends Error` with a `phaseId` field.
- [ ] Create `src/research/audit/audit_logger.ts` (stub if not yet existing):
  - Export an `AuditLogger` singleton with `log(event: AuditEvent): void` that writes a JSON line to `logs/audit.jsonl` and to `console.warn` in development.
  - Export `AuditEvent` interface: `{ event: string; toolName?: string; agentId?: string; phaseId?: string; timestamp: number; details?: Record<string, unknown> }`.
- [ ] Wire `PermissionManager` into `SandboxBootstrap`:
  - In `SandboxBootstrap.initialize(config)`, instantiate `PermissionManager` using `config.phaseId` and expose it via `getPermissionManager(): PermissionManager`.

## 3. Code Review
- [ ] Confirm `PHASE_TOOL_PERMISSIONS` is the single source of truth for all tool permissions — no permission logic is hardcoded elsewhere.
- [ ] Verify that `transitionToPhase()` is the only mutation point for `PermissionManager` state (no other method changes the internal phase).
- [ ] Confirm `AuditLogger.log()` is called synchronously and never swallows errors silently.
- [ ] Verify that `PermissionManager` is injected (not instantiated inline) within any consuming agent to enable testability.
- [ ] Confirm the `PhaseId` type/enum is the only accepted input to the constructor — no raw strings accepted at the TypeScript level.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/research/sandbox/__tests__/permission_manager.test.ts --coverage` and confirm:
  - All 5 test cases pass.
  - Branch coverage for `permission_manager.ts` and `phase_permission_map.ts` is ≥ 95%.

## 5. Update Documentation
- [ ] Create `src/research/sandbox/permission_manager.agent.md` documenting:
  - The phase-to-tool permission mapping table (which tools are allowed/denied per phase).
  - The `transitionToPhase()` contract and when it should be called (phase lifecycle hooks).
  - The `PERMISSION_DENIED` audit event schema and where logs are written.
- [ ] Update `src/research/sandbox/sandbox_bootstrap.agent.md` to reference that `PermissionManager` is initialized during bootstrap using the phase ID from `SandboxConfig`.

## 6. Automated Verification
- [ ] Run `npx jest src/research/sandbox/__tests__/permission_manager.test.ts --json --outputFile=/tmp/permission_manager_results.json`.
- [ ] Execute `node -e "const r = require('/tmp/permission_manager_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors in the new files.
- [ ] Manually verify that `logs/audit.jsonl` is created and contains a valid JSON line after running the `logsPermissionDenialOnBlockedToolAccess` test (or equivalent integration test that triggers a real denied call).
