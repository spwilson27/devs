# Task: Implement Full Project Validation Orchestrator for Global Audit (Sub-Epic: 14_GDPR and Compliance Logging)

## Covered Requirements
- [9_ROADMAP-REQ-040]

## 1. Initial Test Written
- [ ] Create `src/validation/__tests__/global-audit.orchestrator.test.ts`.
- [ ] Write a unit test for `GlobalAuditOrchestrator.run()` that mocks `SandboxManager.provision()`, `TestRunner.runAll()`, and `SandboxManager.destroy()`. Assert:
  1. `provision()` is called exactly once with `{ persistent: false }`.
  2. `runAll({ types: ['unit', 'integration', 'e2e'] })` is called inside the sandbox.
  3. `destroy()` is called in the `finally` block, even if `runAll` throws.
  4. The return value is `{ passRate: 1.0, passed: N, failed: 0, sandboxId: string }`.
- [ ] Write a unit test that mocks `runAll` to return `{ passed: 90, failed: 10 }` and asserts `GlobalAuditOrchestrator.run()` returns `{ passRate: 0.9, ... }` and throws `GlobalAuditFailureError` because `passRate < 1.0`.
- [ ] Write a unit test asserting that if `SandboxManager.provision()` fails, the orchestrator throws immediately and logs an audit event `{ eventType: 'global_audit_failed', payload: { reason: 'sandbox_provision_error' } }`.
- [ ] Write an integration test (using a local Docker sandbox or `tmp` directory test runner shim) that runs the orchestrator against the devs project's own test suite and asserts exit code 0 when all tests pass.

## 2. Task Implementation
- [ ] Create `src/validation/global-audit.orchestrator.ts`:
  ```ts
  export interface GlobalAuditResult {
    passRate: number;     // 0.0–1.0
    passed: number;
    failed: number;
    sandboxId: string;
    durationMs: number;
  }

  @injectable()
  export class GlobalAuditOrchestrator {
    constructor(
      private readonly sandbox: SandboxManager,
      private readonly runner: TestRunner,
      private readonly audit: AuditLogService,
    ) {}

    async run(): Promise<GlobalAuditResult> {
      const startMs = Date.now();
      const { sandboxId } = await this.sandbox.provision({ persistent: false });
      try {
        const result = await this.runner.runAll({
          sandboxId,
          types: ['unit', 'integration', 'e2e'],
        });
        const passRate = result.passed / (result.passed + result.failed);
        const report: GlobalAuditResult = {
          passRate, sandboxId, durationMs: Date.now() - startMs, ...result,
        };
        await this.audit.append({ eventType: 'global_audit_completed', actorId: 'system', payload: report });
        if (passRate < 1.0) throw new GlobalAuditFailureError(report);
        return report;
      } finally {
        await this.sandbox.destroy(sandboxId);
      }
    }
  }
  ```
- [ ] Create `src/validation/global-audit-failure.error.ts` exporting `GlobalAuditFailureError extends Error` with a `result: GlobalAuditResult` property.
- [ ] Wire `GlobalAuditOrchestrator` in the DI container and register it as the handler for the `devs validate --global` CLI subcommand.
- [ ] Add `devs validate --global` to `src/cli/commands/validate/validate.command.ts` and wire the handler to call `GlobalAuditOrchestrator.run()`, printing the JSON result and exiting 0 on success, 1 on `GlobalAuditFailureError`.

## 3. Code Review
- [ ] Confirm `sandbox.destroy()` is in a `finally` block and is always called — the sandbox must never be left running after validation.
- [ ] Confirm `persistent: false` is hardcoded and not configurable — the spec requires a non-persistent sandbox.
- [ ] Confirm `types: ['unit', 'integration', 'e2e']` are all three categories — omitting any one would violate REQ-040.
- [ ] Confirm `GlobalAuditFailureError` is thrown (not just logged) when `passRate < 1.0` so callers and CI pipelines receive a non-zero exit code.
- [ ] Confirm the audit event `global_audit_completed` is emitted with the full `GlobalAuditResult` payload including `passRate` for compliance traceability.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=global-audit.orchestrator` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm no new errors.
- [ ] Run `npm run build` to confirm TypeScript compilation succeeds.

## 5. Update Documentation
- [ ] Create `docs/global-audit.md` documenting: what the global audit does, how to trigger it (`devs validate --global`), expected output format, and what a 100% pass rate requirement means for the project.
- [ ] Add requirement mapping comment to `src/validation/global-audit.orchestrator.ts`: `// REQ: 9_ROADMAP-REQ-040`.
- [ ] Update `CHANGELOG.md`: "feat(validation): implement GlobalAuditOrchestrator for full-project validation in clean sandbox".
- [ ] Update `docs/agent-memory/phase_14.agent.md`: note that global audit runs via `GlobalAuditOrchestrator.run()`, requires `passRate === 1.0`, uses ephemeral non-persistent sandbox, and emits `global_audit_completed` audit event.

## 6. Automated Verification
- [ ] Run `npm run validate` and confirm exit code 0.
- [ ] Run `devs validate --global 2>&1 | tee /tmp/audit-result.json` and assert `jq '.passRate' /tmp/audit-result.json` equals `1` (100% pass rate).
- [ ] Confirm via `docker ps` (or sandbox manager logs) that no sandbox containers remain after the validation run completes.
- [ ] Run `npm test -- --coverage --testPathPattern=global-audit.orchestrator` and confirm `global-audit.orchestrator.ts` line coverage ≥ 90%.
