# Task: Implement Secure Sandboxed Autonomy Enforcement and Verification (Sub-Epic: 31_Project Goals and KPI Targets)

## Covered Requirements
- [1_PRD-REQ-GOAL-008]

## 1. Initial Test Written
- [ ] Write a unit test in `src/sandbox/__tests__/sandbox-guard.test.ts` verifying that `SandboxGuard.assertNotRoot()` throws `PrivilegedExecutionError` when `process.getuid()` returns `0`, and does not throw for any other UID.
- [ ] Write a unit test verifying that `SandboxGuard.assertSandboxBackend()` throws `SandboxBackendMissingError` when neither Docker nor WebContainers is detected, and resolves cleanly when either is available.
- [ ] Write a unit test in `src/sandbox/__tests__/sandbox-provisioner.test.ts` verifying that `SandboxProvisioner.provision(projectId: string)` calls `docker run` with `--network=none`, `--read-only`, `--user=devs` flags, and does not expose host filesystem paths beyond the project workspace.
- [ ] Write a unit test verifying that `SandboxProvisioner.provision()` emits a `SandboxProvisionedEvent` with `{ sandboxId, backend: 'docker' | 'webcontainer', isolationLevel: 'strict' }` via the `EventBus`.
- [ ] Write a unit test verifying that `SandboxProvisioner.runInSandbox(sandboxId, command)` returns a `SandboxResult` with `{ stdout, stderr, exitCode }` and never allows access to host ENV vars.
- [ ] Write an integration test in `src/sandbox/__tests__/sandbox-isolation.integration.test.ts` that provisions a real (or Docker-in-Docker test) sandbox, attempts to read a file outside the project workspace (e.g., `/etc/passwd`), and asserts the command exits non-zero or the file read is empty.
- [ ] Write an integration test verifying that `SandboxProvisioner.teardown(sandboxId)` removes all container artifacts and the container no longer exists in `docker ps -a`.
- [ ] Write an E2E test in `e2e/sandbox-isolation.test.ts` that runs a full task execution cycle using the CLI and asserts no host-level path appears in the generated project files.

## 2. Task Implementation
- [ ] Implement `src/sandbox/sandbox-guard.ts` exporting class `SandboxGuard`:
  - `assertNotRoot(): void` – calls `process.getuid()` on POSIX; on Windows, checks that the process is not in an elevated context; throws `PrivilegedExecutionError` with message `"devs must not run as root/Administrator"` if privileged.
  - `assertSandboxBackend(): Promise<void>` – probes for Docker availability via `docker info` (exec with timeout 5s), falls back to WebContainers detection; throws `SandboxBackendMissingError` if neither is available.
- [ ] Implement `src/sandbox/sandbox-provisioner.ts` exporting class `SandboxProvisioner`:
  - `provision(projectId: string): Promise<SandboxHandle>` – runs:
    ```
    docker run -d --network=none --read-only --user=devs \
      --memory=512m --cpus=0.5 \
      -v <workspace_path>:/workspace:rw \
      devs-agent-sandbox:latest
    ```
  - Returns `SandboxHandle { sandboxId: string; backend: 'docker'; workspacePath: string }`.
  - Emits `SandboxProvisionedEvent` via `EventBus`.
  - `runInSandbox(sandboxId: string, command: string[]): Promise<SandboxResult>` – uses `docker exec`; strips host ENV (only passes a minimal allow-list: `PATH`, `HOME=/workspace`, `DEVS_TASK_ID`).
  - `teardown(sandboxId: string): Promise<void>` – runs `docker rm -f <sandboxId>` and emits `SandboxTeardownEvent`.
- [ ] Define error classes `PrivilegedExecutionError` and `SandboxBackendMissingError` in `src/sandbox/errors.ts` extending `DevsSandboxError`.
- [ ] Define `SandboxHandle`, `SandboxResult`, `SandboxProvisionedEvent`, `SandboxTeardownEvent` types in `src/types/sandbox.ts`.
- [ ] Wire `SandboxGuard.assertNotRoot()` and `SandboxGuard.assertSandboxBackend()` as the very first calls in `OrchestratorService.start()`, before any agent is initialized.
- [ ] Add `sandbox_provisioning_ms` to the `kpi_events` table by calling `TtmTracker.recordPhaseStart('sandbox_provision')` before `provision()` and `TtmTracker.recordPhaseEnd('sandbox_provision')` after; surface the value in `KpiReport.sandbox_provision_latency_ms`.
- [ ] Implement a WebContainers fallback path in `SandboxProvisioner` that activates when Docker is unavailable (VSCode Web context): delegates to the `@webcontainer/api` SDK to boot a WebContainer instance and maps `runInSandbox` to `container.spawn()`.

## 3. Code Review
- [ ] Confirm `docker run` flags include `--network=none` (no egress) and `--read-only` (immutable root FS) in all non-test provisioning paths.
- [ ] Verify `runInSandbox` never passes `process.env` directly – only the explicit allow-list.
- [ ] Confirm `SandboxGuard.assertNotRoot()` is invoked before any LLM or agent call, not only at CLI entry point.
- [ ] Verify `teardown()` is called in a `finally` block in `TaskExecutionService.executeTask()` to prevent orphaned containers even on failure.
- [ ] Confirm the WebContainers fallback path is only reachable when `process.env.DEVS_ENV === 'web'` or `vscode.env.uiKind === UIKind.Web`.
- [ ] Verify that `SandboxHandle.sandboxId` is a UUID (not predictable), generated with `crypto.randomUUID()`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/sandbox/__tests__/sandbox-guard.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/sandbox/__tests__/sandbox-provisioner.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/sandbox/__tests__/sandbox-isolation.integration.test.ts` and confirm all integration tests pass (requires Docker available in CI).
- [ ] Run `pnpm test e2e/sandbox-isolation.test.ts` and confirm E2E test passes.
- [ ] Run `pnpm test --coverage` and verify `src/sandbox/sandbox-guard.ts` and `src/sandbox/sandbox-provisioner.ts` each report ≥ 95% line and branch coverage.

## 5. Update Documentation
- [ ] Add a `## Sandbox Architecture` section to `docs/security.md` describing the Docker isolation flags, ENV allow-list, the WebContainers fallback, and the UID 0 guard.
- [ ] Update `docs/architecture/adr/ADR-XXX-sandbox-isolation.md` documenting the decision to enforce `--network=none` and `--read-only` flags and the rationale for the ENV allow-list.
- [ ] Update `memory/phase_14_decisions.md`: "`SandboxGuard` and `SandboxProvisioner` implemented; Docker is primary backend, WebContainers is web fallback; UID 0 blocked at orchestrator start."

## 6. Automated Verification
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Run `node scripts/verify-sandbox-isolation.mjs` which starts a test sandbox, attempts to read `/etc/shadow`, and asserts the exit code is non-zero and no content is returned.
- [ ] Confirm CI step `sandbox-isolation-check` passes (runs the integration test with Docker-in-Docker).
- [ ] Confirm `kpi_events` table contains a `sandbox_provision` phase entry after each E2E run, with `sandbox_provision_latency_ms` < 30000 (30s) per `1_PRD-REQ-MET-009`.
