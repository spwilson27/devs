# Task: Integrate Egress Proxy with Sandbox Process Spawning & Enforce Deny-All Network Policy (Sub-Epic: 08_Network Egress and Sandbox Isolation)

## Covered Requirements
- [9_ROADMAP-REQ-020], [8_RISKS-REQ-007], [9_ROADMAP-TAS-203]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/sandboxNetwork.test.ts`.
- [ ] Write a unit test for `SandboxLauncher.spawnWithProxy(task)` that stubs `child_process.spawn` (or `execa`) and asserts the child process environment contains:
  - `http_proxy=http://127.0.0.1:<proxyPort>`
  - `https_proxy=http://127.0.0.1:<proxyPort>`
  - `HTTP_PROXY=http://127.0.0.1:<proxyPort>`
  - `HTTPS_PROXY=http://127.0.0.1:<proxyPort>`
  - `no_proxy` is **absent** (no bypass allowed).
- [ ] Write a unit test that asserts `SandboxLauncher` starts the `EgressProxy` before the child process and stops it after the child exits (use spies on `EgressProxy.start` and `EgressProxy.stop`).
- [ ] Write an integration test (using a local HTTP server on a non-whitelisted port) that spawns a real child `curl http://non-whitelisted.example.com --proxy http://127.0.0.1:18080` and asserts the exit code indicates failure (i.e., the request was blocked).
- [ ] Write an integration test that spawns `curl https://registry.npmjs.org/ --proxy http://127.0.0.1:18080` (against the real proxy with allowlist enabled) and asserts the request succeeds (HTTP 200 or 301) when `registry.npmjs.org` is in the allowlist.
- [ ] All tests must FAIL before implementation.

## 2. Task Implementation
- [ ] Locate the existing sandbox process spawning logic (likely in `src/sandbox/sandboxLauncher.ts` or equivalent). If the file does not exist, create it.
- [ ] Refactor (or create) `SandboxLauncher` class to include `spawnWithProxy(task: Task, options?: SandboxLaunchOptions): Promise<SandboxProcess>`:
  - Instantiate `EgressProxy` with the configured allowlist and an ephemeral port.
  - Call `proxy.start()` before spawning the child.
  - Inject `http_proxy`, `https_proxy`, `HTTP_PROXY`, `HTTPS_PROXY` into the child's `env` (merged with a stripped-down host env — **do NOT pass the full `process.env`** to the child; only pass variables explicitly needed by the task).
  - Ensure `proxy.stop()` is called in a `finally` block after the child process exits or is killed.
- [ ] Create `src/sandbox/types.ts` (or extend existing) with:
  - `SandboxLaunchOptions { port?: number; allowlist?: string[]; stripEnv?: boolean; }`
  - `SandboxProcess { pid: number; exitCode: Promise<number>; kill(): void; }`
- [ ] Ensure that if `EgressProxy.start()` fails, the sandbox launch is aborted and the error is surfaced to the caller with a descriptive message.
- [ ] Annotate with `// [9_ROADMAP-REQ-020] [8_RISKS-REQ-007] [9_ROADMAP-TAS-203]`.

## 3. Code Review
- [ ] Verify the child process **never** inherits the full host `process.env` — confirm `env` is constructed explicitly.
- [ ] Verify `proxy.stop()` is always called even when the child process throws or is killed via `SIGKILL`.
- [ ] Verify the proxy port is allocated dynamically using `port: 0` (OS-assigned) or a `getAvailablePort()` utility to avoid hardcoded port conflicts.
- [ ] Verify there is no path where a sandbox process can run without the proxy being active (proxy start must complete before spawn).
- [ ] Verify TypeScript strict-mode compliance and requirement ID annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/sandboxNetwork.test.ts --runInBand` and confirm all tests pass.
- [ ] Run the full sandbox test suite `npx jest src/sandbox/ --runInBand` and confirm no regressions.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Confirm integration tests complete in < 10 seconds (proxy overhead must be negligible).

## 5. Update Documentation
- [ ] Update `docs/architecture/sandbox.md` with a **Network Isolation** section:
  - Diagram (Mermaid) showing the data-flow: `SandboxProcess → EgressProxy → Allowlisted Domain`.
  - Description of env-var injection mechanism and stripped env policy.
  - Note on dynamic port allocation.
  - Requirement traceability: `[9_ROADMAP-REQ-020]`, `[8_RISKS-REQ-007]`, `[9_ROADMAP-TAS-203]`.
- [ ] Update `src/sandbox/SANDBOX.agent.md` (create if absent) with the proxy integration API.

## 6. Automated Verification
- [ ] Add `validate:sandbox-network` script to `package.json`:
  ```
  "validate:sandbox-network": "jest src/sandbox/__tests__/sandboxNetwork.test.ts --runInBand --passWithNoTests=false && tsc --noEmit"
  ```
- [ ] Run `npm run validate:sandbox-network` and confirm exit code 0.
- [ ] Confirm `test-results/sandbox-network.xml` contains zero `<failure>` elements.
