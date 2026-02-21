# Task: Isolated DNS Resolver for Sandbox Network (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-048], [9_ROADMAP-REQ-SEC-002], [TAS-022]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/IsolatedDnsResolver.test.ts`.
- [ ] Write a unit test: construct `IsolatedDnsResolver` with upstream `8.8.8.8`; stub the upstream UDP response; call `resolve("registry.npmjs.org")`; assert the returned IP matches the stub value.
- [ ] Write a unit test: call `resolve("evil.com")` when `evil.com` is not on the allow-list; assert the resolver returns `NXDOMAIN` (throw a typed `DnsBlockedError`) without forwarding any query to upstream.
- [ ] Write a unit test: call `resolve("registry.npmjs.org")` twice; assert the second call is served from the in-memory TTL cache (verify upstream stub is called exactly once).
- [ ] Write a unit test: expire the cache TTL manually (monkey-patch `Date.now`); call `resolve` again and assert upstream is queried a second time.
- [ ] Write a unit test: simulate upstream DNS timeout; assert `IsolatedDnsResolver` throws `DnsTimeoutError` after the configured timeout (default 5 s).
- [ ] Write an integration test: start a minimal UDP DNS stub server on `localhost:15353`; start `IsolatedDnsResolver` pointing at `localhost:15353`; send a real DNS query for an allowed host; verify the correct A record is returned.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/IsolatedDnsResolver.ts`.
- [ ] Implement `IsolatedDnsResolver` class:
  ```ts
  interface DnsResolverConfig {
    upstream: string;          // IP of upstream resolver
    upstreamPort?: number;     // default 53
    allowedHosts: string[];    // same list as EgressProxy allowList
    cacheTtlMs?: number;       // default 60_000
    timeoutMs?: number;        // default 5_000
  }
  export class IsolatedDnsResolver {
    constructor(config: DnsResolverConfig) {}
    async resolve(hostname: string): Promise<string>; // returns IP
  }
  ```
- [ ] Use Node's `dgram` module (UDP) to forward DNS queries to `upstream`; do **not** use `dns.resolve` (which uses the OS resolver and cannot be isolated).
- [ ] Before forwarding any query: check `hostname` (lowercase, stripped) against `allowedHosts`. If not allowed, throw `DnsBlockedError` immediately.
- [ ] Implement a simple TTL-based LRU cache (`Map<string, {ip: string, expiresAt: number}>`); cache size cap: 512 entries; evict oldest on overflow.
- [ ] Expose `IsolatedDnsResolver` from `packages/sandbox/src/network/index.ts`.
- [ ] Wire `IsolatedDnsResolver` into `EgressProxy`: set `dnsResolver` in `EgressProxyConfig` to an `IsolatedDnsResolver` instance; before tunnelling, call `resolver.resolve(targetHost)` to pre-validate DNS.

## 3. Code Review

- [ ] Confirm `IsolatedDnsResolver` never calls `require('dns').resolve` or `require('dns').lookup` — only `dgram`.
- [ ] Confirm `DnsBlockedError` and `DnsTimeoutError` are typed subclasses of `Error` with a `code` property (`"DNS_BLOCKED"` and `"DNS_TIMEOUT"` respectively).
- [ ] Confirm cache eviction does not produce memory leaks (bounded `Map` with size cap).
- [ ] Confirm `EgressProxy` integration: if `IsolatedDnsResolver.resolve()` throws `DnsBlockedError`, the proxy responds `403 Forbidden` (no upstream TCP connection attempted).
- [ ] Confirm all `dgram` socket errors are caught and surfaced as `DnsTimeoutError`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test --testPathPattern="IsolatedDnsResolver"`.
- [ ] All tests pass with zero failures.
- [ ] `IsolatedDnsResolver.ts` line coverage ≥ 90 %.

## 5. Update Documentation

- [ ] Update `docs/security/network-egress-policy.md` with a section `### DNS Filtering` explaining that the sandbox DNS resolver only resolves hostnames on the allow-list; all other queries return `NXDOMAIN`.
- [ ] Update `.agent/memory/phase_2_decisions.md`: `"IsolatedDnsResolver uses dgram UDP to avoid OS resolver; enforces allow-list at DNS layer in addition to proxy layer (defense-in-depth)."`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --coverage --ci` and assert exit code `0`.
- [ ] Run the following script and assert exit code `0`:
  ```bash
  node -e "
    const { IsolatedDnsResolver } = require('./packages/sandbox/dist/network');
    const r = new IsolatedDnsResolver({ upstream: '8.8.8.8', allowedHosts: ['registry.npmjs.org'] });
    r.resolve('evil.com').catch(e => {
      console.assert(e.code === 'DNS_BLOCKED', 'Expected DNS_BLOCKED');
      console.log('IsolatedDnsResolver smoke-check PASSED');
    });
  "
  ```
