# Task: WebContainer Network Shim — Egress Interception (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [1_PRD-REQ-SEC-002], [9_ROADMAP-REQ-SEC-002], [5_SECURITY_DESIGN-REQ-SEC-SD-048]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/WebContainerNetworkShim.test.ts`.
- [ ] Write a unit test: instantiate `WebContainerNetworkShim` with `allowedHosts: ["registry.npmjs.org"]`; call `interceptFetch(new Request("https://registry.npmjs.org/package"))` (using the `undici` `Request` mock); assert the call is forwarded (returns a mocked `Response` with status `200`).
- [ ] Write a unit test: call `interceptFetch(new Request("https://evil.com"))` and assert a `Response` with status `403` and body `"Egress blocked by policy"` is returned without making any upstream network call.
- [ ] Write a unit test: call `interceptFetch(new Request("https://REGISTRY.NPMJS.ORG/foo"))` (uppercase) and assert the call is forwarded (case-insensitive host match).
- [ ] Write a unit test: verify the shim emits a structured log event `{ event: "webcontainer_egress_blocked", host: "evil.com" }` on a blocked request.
- [ ] Write a unit test: call `WebContainerNetworkShim.install(webContainerInstance, config)` and verify the shim patches `globalThis.fetch` inside the WebContainer context (use a jest spy on `webContainerInstance.fs` or equivalent WebContainer API entry-point).

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/WebContainerNetworkShim.ts`.
- [ ] Implement `WebContainerNetworkShim` class:
  ```ts
  interface WebContainerNetworkShimConfig {
    allowedHosts: string[];
  }
  export class WebContainerNetworkShim {
    constructor(config: WebContainerNetworkShimConfig) {}
    interceptFetch(request: Request): Promise<Response>;
    static install(webContainerInstance: WebContainer, config: WebContainerNetworkShimConfig): WebContainerNetworkShim;
  }
  ```
- [ ] `interceptFetch` logic:
  1. Parse `request.url` and extract `hostname`.
  2. Lowercase and strip port; check against `allowedHosts`.
  3. If blocked: return `new Response("Egress blocked by policy", { status: 403 })` without any upstream I/O.
  4. If allowed: delegate to the original `globalThis.fetch` (captured before installation).
- [ ] `install` method:
  1. Captures current `globalThis.fetch` as `originalFetch`.
  2. Replaces `globalThis.fetch` with a wrapper that calls `this.interceptFetch`.
  3. Returns the `WebContainerNetworkShim` instance for further configuration.
- [ ] Wire `WebContainerNetworkShim.install` into `WebContainerDriver.start()` immediately after the WebContainer instance is booted, before any agent code runs.
- [ ] Expose `WebContainerNetworkShim` from `packages/sandbox/src/network/index.ts`.

## 3. Code Review

- [ ] Confirm `originalFetch` is saved before the shim is installed; the shim should never call itself recursively.
- [ ] Confirm the shim respects WebContainer's `@webcontainer/api` boot lifecycle — installation must happen after `WebContainer.boot()` resolves.
- [ ] Confirm no `any` casts; use `@webcontainer/api` types for `WebContainer` parameter.
- [ ] Confirm the shim's `interceptFetch` is pure with respect to the original `fetch` — it does not modify request headers or body before delegation.
- [ ] Confirm structured log on every blocked request includes `{ event, host, url }`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test --testPathPattern="WebContainerNetworkShim"`.
- [ ] All tests pass with zero failures.
- [ ] `WebContainerNetworkShim.ts` line coverage ≥ 90 %.

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` with a section `### WebContainer Network Shim` explaining how `globalThis.fetch` is patched and the allow-list is enforced in the browser/WebContainer context.
- [ ] Update `docs/security/network-egress-policy.md` with a section `### WebContainer Integration` noting that WebContainer egress is controlled via `fetch` interception rather than a TCP proxy.
- [ ] Add entry to `.agent/memory/phase_2_decisions.md`: `"WebContainer egress controlled by patching globalThis.fetch; same AllowlistEngine logic applied; no TCP-level proxy available in WebContainer context."`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --coverage --ci` and assert exit code `0`.
- [ ] Run `grep -r "WebContainerNetworkShim" packages/sandbox/src/network/index.ts` and assert the export exists.
- [ ] Run the following script and assert exit code `0`:
  ```bash
  node -e "
    const { WebContainerNetworkShim } = require('./packages/sandbox/dist/network');
    const shim = new WebContainerNetworkShim({ allowedHosts: ['registry.npmjs.org'] });
    shim.interceptFetch(new Request('https://evil.com')).then(r => {
      console.assert(r.status === 403, 'Expected 403 for blocked host');
      console.log('WebContainerNetworkShim smoke-check PASSED');
    });
  "
  ```
