# Task: Proxy Audit Logging and Observability (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [9_ROADMAP-REQ-SEC-002], [5_SECURITY_DESIGN-REQ-SEC-SD-048], [8_RISKS-REQ-007]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/ProxyAuditLogger.test.ts`.
- [ ] Write a unit test: instantiate `ProxyAuditLogger`; call `logRequest({ host: "registry.npmjs.org", allowed: true, method: "CONNECT", timestampMs: 1000 })`; assert a structured JSON entry is written to the configured log sink (mock the sink).
- [ ] Write a unit test: call `logRequest({ host: "evil.com", allowed: false, method: "CONNECT", timestampMs: 2000 })`; assert the emitted entry has `event: "egress_blocked"`.
- [ ] Write a unit test: call `logRequest` 100 times rapidly; assert all 100 entries are flushed (log sink mock receives exactly 100 calls).
- [ ] Write a unit test: construct `ProxyAuditLogger` with `{ sinkType: "file", filePath: "/tmp/egress-audit.log" }`; call `logRequest(...)`; assert the line is appended to the file (use `fs.readFileSync`).
- [ ] Write a unit test: verify `ProxyAuditLogger` emits a `metrics` event `{ blockedCount, allowedCount }` aggregated per 60-second window (mock `Date.now`; advance time; call `getMetrics()`).
- [ ] Write an integration test: start `EgressProxy` with `ProxyAuditLogger` attached; make three allowed requests and two blocked requests; assert `logger.getMetrics()` returns `{ allowedCount: 3, blockedCount: 2 }`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/ProxyAuditLogger.ts`.
- [ ] Implement `ProxyAuditLogger` class:
  ```ts
  type LogSinkConfig =
    | { sinkType: "console" }
    | { sinkType: "file"; filePath: string }
    | { sinkType: "custom"; sink: (entry: AuditEntry) => void };

  interface AuditEntry {
    event: "egress_allowed" | "egress_blocked";
    host: string;
    method: string;
    timestampMs: number;
  }

  export class ProxyAuditLogger {
    constructor(config: LogSinkConfig) {}
    logRequest(params: { host: string; allowed: boolean; method: string; timestampMs: number }): void;
    getMetrics(): { allowedCount: number; blockedCount: number };
  }
  ```
- [ ] File sink: open an append-only `WriteStream` in the constructor; write each entry as a JSON line (`\n`-terminated). 
- [ ] Console sink: write via the project's structured logger at `INFO` level for allowed, `WARN` level for blocked.
- [ ] `getMetrics()`: return cumulative counters since `ProxyAuditLogger` was instantiated.
- [ ] Wire `ProxyAuditLogger` into `EgressProxy`:
  - Accept optional `auditLogger?: ProxyAuditLogger` in `EgressProxyConfig`.
  - After each allow/deny decision, call `auditLogger?.logRequest(...)`.
- [ ] Expose `ProxyAuditLogger` from `packages/sandbox/src/network/index.ts`.

## 3. Code Review

- [ ] Confirm file sink `WriteStream` is created with `{ flags: "a" }` (append, not overwrite).
- [ ] Confirm `logRequest` is synchronous (no async) to avoid missed entries under high load.
- [ ] Confirm `getMetrics` counters are never reset between calls — they represent lifetime totals.
- [ ] Confirm `AuditEntry` does **not** log full URLs or request paths — only `host` and `method` (to avoid inadvertent data leakage in logs).
- [ ] Confirm the file sink path is validated (non-empty, absolute path) in the constructor; throw `ConfigValidationError` if invalid.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test --testPathPattern="ProxyAuditLogger"`.
- [ ] All tests pass with zero failures.
- [ ] `ProxyAuditLogger.ts` line coverage ≥ 90 %.

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` with a section `### Proxy Audit Logging` describing the three sink types, the `AuditEntry` schema, and how to read egress metrics.
- [ ] Update `docs/security/network-egress-policy.md` with a section `### Audit Logging` noting that all egress decisions (allowed and blocked) are logged with host, method, and timestamp.
- [ ] Add entry to `.agent/memory/phase_2_decisions.md`: `"ProxyAuditLogger emits structured JSON per-request; file sink uses append-only WriteStream; full URLs not logged to avoid data leakage."`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --coverage --ci` and assert exit code `0`.
- [ ] Run the following script and assert exit code `0`:
  ```bash
  TMPLOG=$(mktemp)
  node -e "
    const { ProxyAuditLogger } = require('./packages/sandbox/dist/network');
    const logger = new ProxyAuditLogger({ sinkType: 'file', filePath: '$TMPLOG' });
    logger.logRequest({ host: 'registry.npmjs.org', allowed: true, method: 'CONNECT', timestampMs: Date.now() });
    logger.logRequest({ host: 'evil.com', allowed: false, method: 'CONNECT', timestampMs: Date.now() });
    const m = logger.getMetrics();
    console.assert(m.allowedCount === 1, 'allowedCount mismatch');
    console.assert(m.blockedCount === 1, 'blockedCount mismatch');
    console.log('ProxyAuditLogger smoke-check PASSED');
  "
  grep -c '"event"' "$TMPLOG" | grep -q "^2$" && echo "Log entries verified" || (echo "FAIL: log entries count mismatch" && exit 1)
  rm -f "$TMPLOG"
  ```
