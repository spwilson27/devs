# Task: Core Network Egress Proxy Server Skeleton (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [TAS-022], [1_PRD-REQ-SEC-002], [8_RISKS-REQ-007]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/EgressProxy.test.ts`.
- [ ] Write a unit test: instantiate `EgressProxy` with a config object; assert it returns an object exposing `start()`, `stop()`, and `isRunning()` methods.
- [ ] Write a unit test: call `start()` and assert the proxy binds to the configured TCP port (use an available ephemeral port, e.g. `0`); call `stop()` and assert `isRunning()` returns `false`.
- [ ] Write a unit test: send an HTTP `CONNECT` request to the proxy targeting an arbitrary host; assert the proxy responds with `407 Proxy Authentication Required` or `403 Forbidden` **before** any allow-list is configured (default-deny baseline).
- [ ] Write a unit test: send a plain HTTP `GET` request (non-CONNECT) to the proxy; assert the proxy responds with `403 Forbidden` (all non-proxied direct traffic is denied).
- [ ] All tests must use a real TCP socket (Node `net.createServer` / `supertest` or similar) — no mocks for the network layer itself.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/EgressProxy.ts`.
- [ ] Implement `EgressProxy` class in TypeScript accepting a `EgressProxyConfig` interface:
  ```ts
  interface EgressProxyConfig {
    port: number;           // 0 = OS-assigned ephemeral port
    allowList: string[];    // FQDNs / CIDR blocks (populated later)
    dnsResolver?: string;   // upstream DNS IP (optional, wired in task 03)
  }
  ```
- [ ] Use Node's built-in `http` and `net` modules to create an HTTP proxy that:
  - Handles `CONNECT` tunnelling (HTTPS).
  - Handles plain HTTP forwarding.
  - Responds `403 Forbidden` for any request whose target host is **not** in `allowList` (case-insensitive FQDN match; wildcard `*.domain.tld` is **not** supported in this task).
  - Before the allow-list is implemented (task 02), hard-code an empty default-deny response for all targets.
- [ ] Export `EgressProxy` as the default export from `packages/sandbox/src/network/index.ts`.
- [ ] Add `"network"` as a barrel export in `packages/sandbox/src/index.ts`.
- [ ] Do **not** implement allow-list enforcement logic yet — that is covered in task 02.

## 3. Code Review

- [ ] Confirm `EgressProxy` does **not** import any third-party HTTP-proxy library; only Node built-ins are used.
- [ ] Confirm the class is fully typed with no `any` casts.
- [ ] Confirm `start()` returns a `Promise<void>` and `stop()` returns a `Promise<void>`, both resolving only when the server is fully bound/closed.
- [ ] Confirm there is no code path where an unhandled socket error could crash the process (all `socket.on('error')` handlers present).
- [ ] Confirm `EgressProxy` emits a structured log entry (using the project logger) for every denied request, including the target host and the reason `"default-deny"`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test --testPathPattern="EgressProxy"`.
- [ ] All tests must pass with zero failures and zero skipped.
- [ ] Confirm test coverage for `EgressProxy.ts` is ≥ 90 % (lines + branches) via the coverage report.

## 5. Update Documentation

- [ ] Add a section `## Network Egress Proxy` to `packages/sandbox/README.md` describing: purpose, config shape, and the default-deny policy.
- [ ] Update `.agent/memory/phase_2_decisions.md` with the entry: `"EgressProxy skeleton uses Node built-in http/net modules; no third-party proxy library."`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --coverage --ci` and assert exit code `0`.
- [ ] Run `grep -r "EgressProxy" packages/sandbox/src/index.ts` and assert the export is present.
- [ ] Run `node -e "const {EgressProxy} = require('./packages/sandbox/dist'); console.assert(typeof EgressProxy === 'function')"` to confirm the compiled export is valid.
