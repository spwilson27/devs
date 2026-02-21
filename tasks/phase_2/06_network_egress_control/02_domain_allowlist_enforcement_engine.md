# Task: Domain Allowlist Enforcement Engine (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [TAS-022], [1_PRD-REQ-SEC-002], [8_RISKS-REQ-007], [9_ROADMAP-TAS-203]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/AllowlistEngine.test.ts`.
- [ ] Write a unit test: construct `AllowlistEngine` with `["registry.npmjs.org", "pypi.org", "github.com"]`; call `isAllowed("registry.npmjs.org")` and assert `true`.
- [ ] Write a unit test: call `isAllowed("evil.com")` and assert `false`.
- [ ] Write a unit test: call `isAllowed("REGISTRY.NPMJS.ORG")` (uppercase) and assert `true` (case-insensitive).
- [ ] Write a unit test: call `isAllowed("api.github.com")` and assert `false` — sub-domains of allowed hosts are **not** permitted unless explicitly listed (no wildcard expansion in this task).
- [ ] Write a unit test: call `isAllowed("")` with an empty string and assert `false`.
- [ ] Write a unit test: call `isAllowed(null as any)` and assert `false` without throwing.
- [ ] Create `packages/sandbox/src/network/EgressProxy.allowlist.test.ts`.
- [ ] Write an integration test: start `EgressProxy` configured with `allowList: ["registry.npmjs.org"]`; send an HTTP `CONNECT` to `registry.npmjs.org:443`; assert the proxy returns `200 Connection Established`.
- [ ] Write an integration test: send an HTTP `CONNECT` to `pypi.org:443` (not in list); assert the proxy returns `403 Forbidden`.
- [ ] Write an integration test: mutate `allowList` at runtime by calling `proxy.updateAllowList([...])` and verify subsequent requests reflect the updated list.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/AllowlistEngine.ts` implementing `AllowlistEngine` class:
  ```ts
  export class AllowlistEngine {
    constructor(private allowedHosts: ReadonlyArray<string>) {}
    isAllowed(host: string): boolean { /* … */ }
    update(hosts: ReadonlyArray<string>): void { /* … */ }
  }
  ```
- [ ] Normalize host comparison: lowercase both sides, strip trailing `.`, ignore port suffix.
- [ ] Wire `AllowlistEngine` into `EgressProxy`:
  - Add `updateAllowList(hosts: string[]): void` method on `EgressProxy` that delegates to an internal `AllowlistEngine` instance.
  - On each `CONNECT` / HTTP request, call `allowlistEngine.isAllowed(targetHost)` before forwarding.
  - If denied: respond with `HTTP/1.1 403 Forbidden\r\n\r\n` and destroy the socket.
  - If allowed: proceed with tunnelling / forwarding.
- [ ] The hard-coded default allow-list (from `EgressProxyConfig.allowList`) should be used to initialise `AllowlistEngine` at proxy start.
- [ ] Log each allowed and denied decision at `DEBUG` level with the resolved host and list state at the time of the check.

## 3. Code Review

- [ ] Confirm `AllowlistEngine.isAllowed` contains **no regex** — only exact-match string comparison after normalization.
- [ ] Confirm `EgressProxy` does not perform any network I/O for a denied request (no DNS lookup, no TCP connect attempt).
- [ ] Confirm `updateAllowList` is thread-safe in the Node event-loop sense — no async gap between read and update of the internal list.
- [ ] Confirm the integration tests use a real proxy server on a real port (not mocked).
- [ ] Confirm structured log entries include fields: `{ event: "egress_decision", allowed: boolean, host: string }`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test --testPathPattern="AllowlistEngine|EgressProxy.allowlist"`.
- [ ] All tests must pass with zero failures.
- [ ] Verify `AllowlistEngine.ts` line coverage ≥ 95 %.

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` `## Network Egress Proxy` section to document the allow-list configuration, runtime update method, and default-deny policy enforcement.
- [ ] Add entry to `.agent/memory/phase_2_decisions.md`: `"AllowlistEngine uses exact lowercase FQDN match; no wildcard sub-domain expansion; list is mutable at runtime via updateAllowList()."`.
- [ ] List the canonical default-allowed domains (`registry.npmjs.org`, `pypi.org`, `github.com`) in `docs/security/network-egress-policy.md` (create file if absent).

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --coverage --ci` and assert exit code `0`.
- [ ] Run `grep -r "AllowlistEngine" packages/sandbox/src/network/index.ts` and assert the export is present.
- [ ] Execute the following smoke-check script and assert it exits `0`:
  ```bash
  node -e "
    const { AllowlistEngine } = require('./packages/sandbox/dist/network');
    const e = new AllowlistEngine(['registry.npmjs.org']);
    console.assert(e.isAllowed('registry.npmjs.org') === true);
    console.assert(e.isAllowed('evil.com') === false);
    console.log('AllowlistEngine smoke-check PASSED');
  "
  ```
