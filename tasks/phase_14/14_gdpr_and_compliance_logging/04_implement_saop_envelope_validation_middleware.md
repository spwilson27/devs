# Task: Implement SAOP Envelope Validation Middleware (100% Coverage) (Sub-Epic: 14_GDPR and Compliance Logging)

## Covered Requirements
- [9_ROADMAP-REQ-018]

## 1. Initial Test Written
- [ ] Create `src/saop/__tests__/saop-validation.middleware.test.ts`.
- [ ] Write a unit test that calls `SaopValidationMiddleware.process(envelope)` with a valid envelope and asserts: (a) the promise resolves, (b) `AuditLogService.append` is called once with `eventType: 'envelope_validated'`, (c) the original envelope object is returned unchanged.
- [ ] Write a unit test that calls `process(invalidEnvelope)` with an envelope missing `agentId` and asserts: (a) the promise rejects with a `SaopValidationError`, (b) `AuditLogService.append` is called with `eventType: 'envelope_validation_failed'` and `payload.errors` is a non-empty array.
- [ ] Write a unit test that asserts every call to `process()` — valid or not — results in exactly one `AuditLogService.append` call (100% logging coverage requirement from REQ-018).
- [ ] Write an integration test that sends 50 envelopes (45 valid, 5 invalid) through the middleware and asserts: total audit entries == 50, failed entries == 5, success entries == 45.
- [ ] Write a test verifying that if `validateAgentEnvelope` throws an unexpected error (mocked), the middleware re-throws as `SaopValidationError` and still logs a failure audit event.

## 2. Task Implementation
- [ ] Create `src/saop/saop-validation.middleware.ts`:
  ```ts
  export class SaopValidationError extends Error {
    constructor(public readonly errors: ErrorObject[]) {
      super(`SAOP envelope validation failed: ${JSON.stringify(errors)}`);
    }
  }

  @injectable()
  export class SaopValidationMiddleware {
    constructor(
      private readonly auditLog: AuditLogService,
    ) {}

    async process<T extends object>(envelope: T): Promise<T> {
      let valid = false;
      let errors: ErrorObject[] | null = null;
      try {
        valid = validateAgentEnvelope(envelope);
        errors = validateAgentEnvelope.errors ?? null;
      } catch (e) {
        errors = [{ message: String(e) } as ErrorObject];
      }
      await this.auditLog.append({
        eventType: valid ? 'envelope_validated' : 'envelope_validation_failed',
        actorId: (envelope as Record<string, string>).agentId ?? 'unknown',
        payload: { errors },
      });
      if (!valid) throw new SaopValidationError(errors ?? []);
      return envelope;
    }
  }
  ```
- [ ] Register `SaopValidationMiddleware` in the DI container (`src/container.ts`).
- [ ] Inject `SaopValidationMiddleware` into the `OrchestratorLoop` (`src/orchestrator/orchestrator-loop.ts`) and call `middleware.process(envelope)` before dispatching every incoming agent message.
- [ ] Add `SaopValidationError` to `src/errors/index.ts` re-exports.

## 3. Code Review
- [ ] Confirm **every** code path through `process()` calls `auditLog.append` — success path, validation-failure path, and unexpected-throw path. There must be no early-return before the audit call.
- [ ] Confirm `SaopValidationError` extends `Error` and preserves the `errors` array for upstream handlers.
- [ ] Confirm `SaopValidationMiddleware` is `@injectable()` and not instantiated as a bare `new` call anywhere outside the DI container.
- [ ] Confirm the orchestrator loop does not catch `SaopValidationError` silently — it must propagate to the task failure handler.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=saop-validation.middleware` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm no new errors.
- [ ] Run `npm run build` to confirm TypeScript compilation succeeds.

## 5. Update Documentation
- [ ] Update `docs/saop-protocol.md` with a section "Validation Middleware" describing the 100% envelope coverage guarantee, audit log integration, and error type.
- [ ] Add requirement mapping comment to `src/saop/saop-validation.middleware.ts`: `// REQ: 9_ROADMAP-REQ-018`.
- [ ] Update `CHANGELOG.md`: "feat(saop): implement 100% envelope validation middleware with audit logging".
- [ ] Update `docs/agent-memory/phase_14.agent.md`: note that `SaopValidationMiddleware.process()` is the single validation gate — every envelope passes through it; failures throw `SaopValidationError`.

## 6. Automated Verification
- [ ] Run `npm run validate` and confirm exit code 0.
- [ ] Run `npm test -- --coverage --testPathPattern=saop-validation.middleware` and confirm `saop-validation.middleware.ts` line coverage ≥ 95%.
- [ ] Run `node scripts/validate-saop-coverage.js` (create script if absent) that reads the last 100 audit log entries and asserts every `envelope_*` event has a corresponding `envelopeId` — confirming 100% traceability.
