# Task: Network Egress Blocking Verification & Zero-Escape Audit Logging (Sub-Epic: 12_User-Facing Sandbox Features & Verification)

## Covered Requirements
- [9_ROADMAP-REQ-020]
- [1_PRD-REQ-MET-016]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/NetworkEgressProxy.verification.test.ts`, write integration tests for the Network Egress Proxy:
  - Test that a sandbox attempting to reach `https://evil.example.com` (not in the allowlist) receives a TCP reset or HTTP 403 and the attempt is logged to `SandboxAuditLog`.
  - Test that a sandbox reaching `https://registry.npmjs.org` (in the default allowlist) succeeds with HTTP 200.
  - Test that DNS resolution for a disallowed domain inside the sandbox returns `NXDOMAIN`.
  - Test that the `SandboxAuditLog` entry for a blocked attempt includes: `{ sandboxId, attempt: { destination, protocol, port, timestamp }, outcome: 'BLOCKED' }`.
  - Test that 100 consecutive blocked attempts all produce 100 distinct log entries (no deduplication/suppression).
- [ ] In `packages/core/src/sandbox/__tests__/SandboxEscapeDetector.test.ts`, write unit tests for `SandboxEscapeDetector`:
  - Test that an attempt to access a path outside `/workspace` (e.g., `/etc/passwd`) is detected and triggers a `sandboxEscapeAttempt` event with `{ sandboxId, type: 'filesystem', path, timestamp }`.
  - Test that a network connection to a non-allowlisted IP triggers a `sandboxEscapeAttempt` event with `{ sandboxId, type: 'network', destination, timestamp }`.
  - Test that detected escape attempts increment the metric counter `sandbox.escape_attempts_total` (Prometheus format).
  - Test that when `sandboxEscapeAttempt` fires, the sandbox is immediately paused via `sandbox.pause()`.
- [ ] In `packages/core/src/audit/__tests__/SandboxAuditLog.test.ts`, write unit tests for `SandboxAuditLog`:
  - Test that `SandboxAuditLog.record(entry)` persists a JSON-Lines entry to `.devs/audit/sandbox.log` with all required fields.
  - Test that `SandboxAuditLog.queryBlocked({ sandboxId, since })` returns only `BLOCKED` outcome entries for the given sandbox after the given timestamp.
  - Test that `SandboxAuditLog.getMetric('block_rate')` returns `blockedCount / totalAttempts` as a float between 0 and 1.

## 2. Task Implementation
- [ ] Implement `SandboxAuditLog` in `packages/core/src/audit/SandboxAuditLog.ts`:
  - Uses `fs.appendFile` to write JSON-Lines to `.devs/audit/sandbox.log`.
  - Provides `record(entry: AuditLogEntry): Promise<void>`, `queryBlocked(filter)`, and `getMetric(name)` methods.
  - Defines `AuditLogEntry` type in `packages/core/src/audit/types.ts` with fields: `sandboxId`, `timestamp`, `type` (`'network' | 'filesystem'`), `destination | path`, `outcome` (`'BLOCKED' | 'ALLOWED'`).
- [ ] Integrate `SandboxAuditLog.record()` into the Network Egress Proxy (`packages/core/src/sandbox/NetworkEgressProxy.ts`):
  - After each intercepted request, determine `outcome` by matching against the allowlist.
  - Call `SandboxAuditLog.record(entry)` for every attempt, both BLOCKED and ALLOWED.
  - Return HTTP 403 (or TCP reset) for BLOCKED attempts.
- [ ] Implement `SandboxEscapeDetector` in `packages/core/src/sandbox/SandboxEscapeDetector.ts`:
  - Subscribes to `NetworkEgressProxy` BLOCKED events and filesystem access audit hooks (via Docker's `--security-opt` audit rules or WebContainer filesystem watchers).
  - Emits a `sandboxEscapeAttempt` event and calls `sandbox.pause()` on detection.
  - Exposes a Prometheus-compatible counter `sandbox_escape_attempts_total` via `packages/core/src/metrics/MetricsRegistry.ts`.
- [ ] Expose `sandbox_escape_attempts_total` and `sandbox_egress_block_rate` metrics in the MCP metrics endpoint (`packages/mcp/src/handlers/metricsHandler.ts`).
- [ ] Add a VS Code notification in `packages/vscode-extension/src/extension/messageHandlers/sandboxEscapeHandler.ts`:
  - Subscribe to `sandboxEscapeAttempt` events from `SandboxEscapeDetector`.
  - Show `vscode.window.showErrorMessage("⛔ Sandbox Escape Attempt Detected: {type} access to {destination|path}. Sandbox paused.")`.
  - Provide a "View Audit Log" button that opens `.devs/audit/sandbox.log` in a new editor tab.

## 3. Code Review
- [ ] Verify that `SandboxAuditLog.record()` is called for EVERY network request through the proxy — confirm no code path skips logging for ALLOWED requests (both allowed and blocked must be auditable).
- [ ] Confirm `SandboxEscapeDetector` calls `sandbox.pause()` synchronously before emitting the event — ensure the sandbox cannot perform further actions while the event propagates.
- [ ] Confirm `SandboxAuditLog` writes are atomic (use `fs.appendFile` which is atomic for small writes on POSIX) and the log file is never truncated.
- [ ] Confirm Prometheus metric names follow the `snake_case` convention and include `_total` suffix for counters.
- [ ] Confirm the MCP metrics endpoint returns metrics in Prometheus exposition format (plain text, `# HELP`, `# TYPE` headers).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxAuditLog` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxEscapeDetector` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=NetworkEgressProxy.verification` and confirm all integration tests pass (requires Docker daemon).
- [ ] Run `pnpm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/security/sandbox-audit-log.md`:
  - Document the `AuditLogEntry` schema.
  - Explain how to query the log for blocked attempts.
  - Document the `sandbox_escape_attempts_total` and `sandbox_egress_block_rate` metrics.
- [ ] Update `docs/security/zero-escape-policy.md`:
  - Explicitly link this implementation to `[1_PRD-REQ-MET-016]` (Zero Sandbox Escapes).
  - Document the automatic sandbox pause behavior on escape detection.
- [ ] Update `.agent/memory/phase_2_decisions.md` with the decision that ALL egress attempts (ALLOWED and BLOCKED) are logged to maintain a complete audit trail meeting `[9_ROADMAP-REQ-020]`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Execute the egress verification script:
  ```bash
  node scripts/verify_network_egress.js --driver docker --attempts 100 --destination evil.example.com
  # Expected output: "PASS: 100/100 unauthorized egress attempts blocked and logged"
  # Expected exit code: 0
  ```
- [ ] Execute the escape detection verification script:
  ```bash
  node scripts/verify_escape_detection.js --driver docker --type filesystem --path /etc/passwd
  # Expected output: "PASS: Escape attempt detected, sandbox paused within 1s"
  # Expected exit code: 0
  ```
- [ ] Query the audit log and confirm block rate equals 1.0:
  ```bash
  node -e "
    const { SandboxAuditLog } = require('./packages/core/dist/audit/SandboxAuditLog');
    const log = new SandboxAuditLog();
    log.getMetric('block_rate').then(r => process.exit(r === 1.0 ? 0 : 1));
  "
  ```
