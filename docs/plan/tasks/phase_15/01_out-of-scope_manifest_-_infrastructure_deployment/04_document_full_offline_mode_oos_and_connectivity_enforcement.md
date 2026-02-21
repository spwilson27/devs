# Task: Document Full Offline Operational Mode Out-of-Scope Declaration & Connectivity Enforcement (Sub-Epic: 01_Out-of-Scope Manifest - Infrastructure & Deployment)

## Covered Requirements
- [1_PRD-REQ-OOS-019]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/manifest.test.ts`, add an assertion that `OUT_OF_SCOPE_ITEMS` contains an entry with:
  - `id: "1_PRD-REQ-OOS-019"`
  - `category: "Infrastructure & Deployment"`
  - `title: "Full Offline Operational Mode"`
  - A non-empty `rationale` string.
  - `enforcement` array containing at least `"ScopeGuard"` and `"connectivity_checker"`.
- [ ] In `src/oos/__tests__/connectivity-checker.test.ts`, write unit tests for `ConnectivityChecker` from `src/oos/connectivity-checker.ts`:
  - Mock the HTTP client. When the mock simulates a successful response from the LLM API endpoint, `ConnectivityChecker.check()` resolves to `{ online: true, latencyMs: <number> }`.
  - When the mock simulates a network timeout or `ENOTFOUND` error, `ConnectivityChecker.check()` resolves to `{ online: false, error: "LLM API unreachable" }`.
  - `ConnectivityChecker.getOfflineRejectionMessage()` returns a string containing `"1_PRD-REQ-OOS-019"` and `"internet connection"`.
- [ ] In `src/oos/__tests__/connectivity-checker.test.ts`, write an integration test asserting:
  - When the orchestrator starts and `ConnectivityChecker.check()` returns `{ online: false }`, the orchestrator emits a structured error to stdout with OOS ID `1_PRD-REQ-OOS-019` and halts immediately.
  - The exit code of the CLI process is non-zero (e.g., `1`) in the offline scenario.

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-019` entry to `OUT_OF_SCOPE_ITEMS` in `src/oos/manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-019",
    category: "Infrastructure & Deployment",
    title: "Full Offline Operational Mode",
    rationale: "devs requires an active internet connection to call LLM APIs (e.g., Google Gemini, OpenAI). Full offline operation is not supported. This is an explicit architectural constraint, not a future enhancement, because local LLM inference management is separately out of scope (see 1_PRD-REQ-OOS-011). Users must have internet access to run devs.",
    enforcement: ["ScopeGuard", "connectivity_checker", "orchestrator_startup_check"]
  }
  ```
- [ ] Create `src/oos/connectivity-checker.ts`:
  - Define `LLM_CONNECTIVITY_PROBE_URL: string` (e.g., `"https://generativelanguage.googleapis.com"` or the configured LLM API base URL from environment).
  - Export `ConnectivityChecker` object with:
    - `check(timeoutMs?: number): Promise<{ online: boolean; latencyMs?: number; error?: string }>` — performs a lightweight HEAD request to `LLM_CONNECTIVITY_PROBE_URL` with a default 5-second timeout. Returns the result.
    - `getOfflineRejectionMessage(): string` — returns `"[OOS: 1_PRD-REQ-OOS-019] devs requires an active internet connection. Full offline operational mode is not supported. Please ensure connectivity to the LLM API before running devs."`.
- [ ] Update `src/orchestrator/startup.ts` (or create it):
  - During orchestrator startup (before any agent is invoked), call `await ConnectivityChecker.check()`.
  - If `online === false`, log the rejection message to stderr, write an entry to `logs/oos-violations.log` with `{ timestamp, oos_id: "1_PRD-REQ-OOS-019", error }`, and call `process.exit(1)`.
  - If `online === true`, log `"[startup] LLM API reachable (latency: <N>ms)"` at debug level and continue.
- [ ] Update `src/oos/scope-guard.ts`:
  - Add `isOutOfScope` handling for request type `"offline_mode"` mapping to `1_PRD-REQ-OOS-019`.

## 3. Code Review
- [ ] Verify the connectivity probe uses a HEAD request (not GET/POST) to minimize data transfer and avoid triggering rate limits.
- [ ] Confirm the timeout is configurable via environment variable `DEVS_CONNECTIVITY_TIMEOUT_MS` with a default of `5000`.
- [ ] Confirm `process.exit(1)` is only called in the CLI entrypoint path, not in library/module paths, to preserve testability. The startup module should throw a typed `OfflineModeError` that the CLI entrypoint catches and converts to `process.exit(1)`.
- [ ] Verify the audit log entry is written before `process.exit` to ensure the log is flushed.
- [ ] Confirm the probe URL is derived from the configured LLM provider, not hardcoded, to work across different API providers.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/connectivity-checker"` and confirm all tests pass with mocked HTTP.
- [ ] Run `npm test -- --testPathPattern="src/orchestrator/startup"` and confirm startup integration tests pass.
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/manifest"` and confirm the OOS-019 entry is asserted.
- [ ] Run `npm run lint` on all new and modified files.

## 5. Update Documentation
- [ ] Create `src/oos/connectivity-checker.agent.md`: Document the probe URL strategy, timeout configuration, the `OfflineModeError` type, and how to extend for multi-provider connectivity checks.
- [ ] Update `docs/architecture/out-of-scope.md`: Add `1_PRD-REQ-OOS-019` with full rationale and a note distinguishing it from `1_PRD-REQ-OOS-011` (local LLM hosting).
- [ ] Update `docs/user-guide/prerequisites.md` (create if absent): Add "Internet connectivity to LLM API" as a hard prerequisite, with a reference to `1_PRD-REQ-OOS-019`.
- [ ] Update `docs/agent-memory/phase_15_decisions.md`: Record that connectivity is checked at startup, implemented via `ConnectivityChecker`, and the `OfflineModeError` pattern was chosen for testability.

## 6. Automated Verification
- [ ] Run `node scripts/verify-oos-manifest.js --req-id="1_PRD-REQ-OOS-019"` and assert exit code `0`.
- [ ] Run `node scripts/verify-connectivity-checker.js` (create if absent): Mocks network offline, runs `ConnectivityChecker.check()`, asserts `{ online: false }` is returned, and exits with code `0`.
- [ ] In CI, assert `grep -r "1_PRD-REQ-OOS-019" src/oos/manifest.ts` exits with code `0`.
- [ ] Run `npm test -- --coverage --testPathPattern="src/oos/connectivity-checker"` and assert coverage ≥ 90%.
