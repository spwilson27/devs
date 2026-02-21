# Task: Implement Mandatory Fresh Ephemeral Sandbox Lifecycle with SandboxOrchestrator (Sub-Epic: 08_Sandbox Lifecycle & Environment Management)

## Covered Requirements
- [1_PRD-REQ-SEC-001], [9_ROADMAP-REQ-SEC-001]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/orchestrator.test.ts`, write unit and integration tests for the `SandboxOrchestrator` class:
  - Test `runTask(task)`: verify that a brand-new sandbox ID is generated for every invocation (assert `SandboxProvider.create` is called once per `runTask` call with a unique ID).
  - Test that no sandbox is ever reused across two `runTask` calls, even if the task definitions are identical.
  - Test `runTask` success path: assert lifecycle sequence is `create → preflight → execute → cleanup(success)` in exactly that order with no steps skipped.
  - Test `runTask` failure path: assert lifecycle is `create → preflight → execute → cleanup(failure)` and the container is preserved.
  - Test `runTask` preflight failure: assert lifecycle is `create → preflight(throws) → cleanup(failure)` and execute is never called.
  - Test concurrent `runTask` calls: run 5 tasks simultaneously, assert 5 distinct sandbox IDs are created and destroyed independently.
  - Write an integration test using real Docker: call `runTask` with a task that runs `echo hello` and assert: (a) container existed during execution, (b) container does not exist after `cleanup(success)`, (c) only one container was ever created for that task.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/orchestrator/SandboxOrchestrator.ts`:
  - Inject: `SandboxProvider`, `PreflightService`, `SandboxCleanupService`, `SessionKeyManager`, `SecretInjector`, `EnvironmentSanitizer`.
  - Implement `runTask(task: TaskManifest, opts: RunTaskOptions): Promise<TaskResult>`:
    1. Generate a cryptographically unique `sandboxId` using `crypto.randomUUID()`.
    2. Call `SandboxProvider.create(sandboxId, { image: HARDENED_BASE_IMAGE, env: sanitizer.sanitize(process.env) })` to create a fresh container.
    3. Generate and register a session key via `SessionKeyManager`.
    4. Call `PreflightService.runPreflight(sandboxId, { projectRoot, task, mcpConfig })`.
    5. Inject secrets (including `DEVS_SESSION_KEY`) via `SecretInjector.inject`.
    6. Execute the agent workload via `SandboxProvider.exec(sandboxId, agentEntrypoint)` and capture result.
    7. Call `SandboxCleanupService.teardown(sandboxId, { outcome: result.success ? 'success' : 'failure' })`.
    8. Call `SessionKeyManager.revokeKey(sandboxId)`.
    9. Return `TaskResult`.
  - Wrap steps 2–8 in a `try/finally` to ensure cleanup and key revocation always execute.
  - Emit structured lifecycle events: `sandbox_created`, `preflight_complete`, `execution_complete`, `sandbox_torn_down`.
- [ ] Define `HARDENED_BASE_IMAGE` constant (e.g., `'ghcr.io/devs/sandbox-base:latest'`) in `packages/sandbox/src/constants.ts`.
- [ ] Export `SandboxOrchestrator` and `RunTaskOptions` from `packages/sandbox/src/index.ts`.

## 3. Code Review
- [ ] Verify that `SandboxOrchestrator` never stores or re-uses a `sandboxId` after teardown (no caching of live container references between tasks).
- [ ] Verify the `try/finally` block covers all steps after `create` so cleanup always runs.
- [ ] Confirm that environment sanitization (`EnvironmentSanitizer`) is applied before `SandboxProvider.create`, not after.
- [ ] Verify that concurrent `runTask` calls do not share any mutable state (no shared queue without synchronization); each call operates on its own local `sandboxId`.
- [ ] Confirm all lifecycle events are emitted as structured JSON logs parseable by the monitoring subsystem.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `orchestrator.test.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` and confirm the Docker-based full lifecycle integration test passes.
- [ ] Confirm test coverage for `SandboxOrchestrator.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Create `packages/sandbox/src/orchestrator/orchestrator.agent.md` documenting: the full `runTask` lifecycle sequence (all 9 steps), the freshness guarantee (new ID per task), the `try/finally` cleanup contract, and the structured lifecycle event schema.
- [ ] Update `packages/sandbox/README.md` to include a "SandboxOrchestrator" section with a sequence diagram (Mermaid) illustrating the full `create → preflight → execute → teardown` lifecycle.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm exit code 0.
- [ ] In CI, run `SANDBOX_DRIVER=docker pnpm --filter @devs/sandbox test:integration` and confirm exit code 0.
- [ ] After the integration test, run `docker ps -a --filter label=devs.sandbox=true --format '{{.Names}}'` and assert empty output (all test containers were cleaned up).
