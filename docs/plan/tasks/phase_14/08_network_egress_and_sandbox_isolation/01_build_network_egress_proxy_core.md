# Task: Build Network Egress Proxy Core — Deny-All HTTP/HTTPS Interceptor (Sub-Epic: 08_Network Egress and Sandbox Isolation)

## Covered Requirements
- [9_ROADMAP-TAS-203], [8_RISKS-REQ-007]

## 1. Initial Test Written
- [ ] Create `src/sandbox/proxy/__tests__/egressProxy.test.ts`.
- [ ] Write a unit test that instantiates `EgressProxy` (the class to be created) and verifies it starts an HTTP proxy server listening on a configurable port (e.g., `localhost:18080`).
- [ ] Write a unit test that sends an HTTP `CONNECT` (HTTPS tunnel) request to the proxy for a **non-whitelisted** domain (e.g., `evil.example.com`) and asserts the proxy responds with HTTP `403 Forbidden` and closes the connection.
- [ ] Write a unit test that sends a plain HTTP `GET` request to the proxy for a **non-whitelisted** domain and asserts the proxy responds with HTTP `403 Forbidden`.
- [ ] Write an integration test using a real TCP socket that verifies the proxy binds to the configured port on startup and unbinds on `proxy.stop()`.
- [ ] Write a test that verifies `EgressProxy` emits a `blocked` event (or calls a registered callback) with `{ domain, method, timestamp }` payload whenever a request is denied.
- [ ] All tests must be in `describe('EgressProxy – deny-all baseline')` and must FAIL before implementation.

## 2. Task Implementation
- [ ] Create `src/sandbox/proxy/egressProxy.ts` exporting class `EgressProxy` with:
  - Constructor accepting `EgressProxyOptions { port: number; allowlist: string[]; onBlocked?: (event: BlockedEvent) => void }`.
  - `start(): Promise<void>` — starts an `http.createServer` acting as a forward proxy. For `CONNECT` (HTTPS), upgrade the socket and immediately destroy it with `403` if the target hostname is not in the allowlist. For plain HTTP, parse the `Host` header and return `403` if not whitelisted.
  - `stop(): Promise<void>` — closes the server and all open sockets.
  - Internal `_isAllowed(hostname: string): boolean` method that normalises the hostname (strips port) and checks against the allowlist (exact match and subdomain wildcard via `*.domain` entries).
- [ ] Create `src/sandbox/proxy/types.ts` exporting:
  - `BlockedEvent { domain: string; method: string; url: string; timestamp: string; }`
  - `EgressProxyOptions { port: number; allowlist: string[]; onBlocked?: (event: BlockedEvent) => void }`
- [ ] Create `src/sandbox/proxy/index.ts` re-exporting `EgressProxy` and all types.
- [ ] Use Node.js built-in `http` and `net` modules only — **no third-party HTTP proxy library** to minimise supply-chain risk.
- [ ] Annotate every method with the requirement IDs: `// [9_ROADMAP-TAS-203] [8_RISKS-REQ-007]`.

## 3. Code Review
- [ ] Verify no third-party runtime dependencies are introduced in `package.json` for the proxy core.
- [ ] Confirm `_isAllowed` correctly handles edge cases: empty hostname, IPv4/IPv6 literals (must be blocked), ports stripped before comparison, and case-insensitive matching.
- [ ] Confirm `CONNECT` tunnel teardown does **not** leave dangling socket listeners (check for `socket.destroy()` in the `403` path).
- [ ] Confirm the `onBlocked` callback is invoked synchronously before the socket is destroyed so callers can log without race conditions.
- [ ] Confirm TypeScript strict-mode compatibility (`strict: true` in `tsconfig.json`).
- [ ] Confirm requirement ID annotations are present on `start()`, `stop()`, and `_isAllowed()`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/proxy/__tests__/egressProxy.test.ts --runInBand` and confirm all tests pass with exit code 0.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Confirm test coverage for `egressProxy.ts` is ≥ 90% (branches, lines, statements) via `--coverage` flag.

## 5. Update Documentation
- [ ] Create `src/sandbox/proxy/PROXY.agent.md` documenting:
  - Purpose: deny-all egress control for agent sandboxes.
  - API surface: constructor options, `start()`, `stop()`, `BlockedEvent`.
  - Extension points: how to add new allowlist entries.
  - Requirement traceability: `[9_ROADMAP-TAS-203]`, `[8_RISKS-REQ-007]`.
- [ ] Add an entry to the project-level `docs/architecture/sandbox.md` (create the file if absent) describing the proxy's role in the sandbox security model.

## 6. Automated Verification
- [ ] Add a `validate:proxy-core` script to `package.json`:
  ```
  "validate:proxy-core": "jest src/sandbox/proxy/__tests__/egressProxy.test.ts --runInBand --passWithNoTests=false && tsc --noEmit"
  ```
- [ ] Run `npm run validate:proxy-core` and confirm exit code 0 in CI output.
- [ ] Confirm the test output file `test-results/proxy-core.xml` (via `--reporters=jest-junit`) is generated and contains zero `<failure>` elements.
