# Task: Enforce HTTPS-Only Egress for Research Agent Web Scraping (Sub-Epic: 05_Research Sandbox & Security Permissions)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-030]

## 1. Initial Test Written
- [ ] In `src/research/tools/__tests__/egress_guard.test.ts`, write the following unit tests:
  - `EgressGuard > allowsHttpsRequests`:
    - Call `EgressGuard.validateUrl('https://example.com/page')`.
    - Assert it returns `{ allowed: true }` without throwing.
  - `EgressGuard > blocksHttpRequests`:
    - Call `EgressGuard.validateUrl('http://example.com/page')`.
    - Assert it returns `{ allowed: false, reason: 'HTTP_SCHEME_BLOCKED' }`.
  - `EgressGuard > allowsHttpUrlWithExplicitOverride`:
    - Call `EgressGuard.validateUrl('http://legacy-internal.example.com', { allowHttpOverride: true, overrideReason: 'legacy-internal-source' })`.
    - Assert it returns `{ allowed: true, overrideApplied: true }`.
    - Verify `AuditLogger.log()` was called with event `'HTTP_OVERRIDE_ALLOWED'`, the URL, and the override reason.
  - `EgressGuard > logsBlockedHttpAttempt`:
    - Mock `AuditLogger.log()`.
    - Call `EgressGuard.validateUrl('http://attacker.com/inject')`.
    - Assert `AuditLogger.log()` was called with event `'HTTP_EGRESS_BLOCKED'`, the URL, and the current timestamp.
  - `EgressGuard > rejectsNonHttpSchemes`:
    - Call `EgressGuard.validateUrl('ftp://files.example.com')`.
    - Assert it returns `{ allowed: false, reason: 'UNSUPPORTED_SCHEME' }`.
  - `EgressGuard > rejectsMalformedUrls`:
    - Call `EgressGuard.validateUrl('not-a-url')`.
    - Assert it returns `{ allowed: false, reason: 'INVALID_URL' }`.
- [ ] In `src/research/tools/__tests__/http_client.test.ts`, write integration tests:
  - `SecureHttpClient > makesRequestWhenHttps`:
    - Mock the underlying HTTP adapter to return a 200 response for an HTTPS URL.
    - Call `SecureHttpClient.get('https://example.com')` and assert the response body is returned.
  - `SecureHttpClient > throwsEgressBlockedErrorForHttp`:
    - Call `SecureHttpClient.get('http://example.com')` without override.
    - Assert it throws `EgressBlockedError` with `url` and `reason = 'HTTP_SCHEME_BLOCKED'`.

## 2. Task Implementation
- [ ] Create `src/research/tools/egress_guard.ts`:
  - Export a `ValidationResult` interface: `{ allowed: boolean; reason?: string; overrideApplied?: boolean }`.
  - Export an `OverrideOptions` interface: `{ allowHttpOverride: boolean; overrideReason: string }`.
  - Export an `EgressGuard` class (or namespace with static methods) with:
    - `validateUrl(rawUrl: string, override?: OverrideOptions): ValidationResult`:
      1. Parse `rawUrl` using the native `URL` constructor. If parsing throws, return `{ allowed: false, reason: 'INVALID_URL' }`.
      2. If `url.protocol` is neither `'https:'` nor `'http:'`, return `{ allowed: false, reason: 'UNSUPPORTED_SCHEME' }`.
      3. If `url.protocol === 'http:'`:
         - If `override?.allowHttpOverride` is `true`: call `AuditLogger.log({ event: 'HTTP_OVERRIDE_ALLOWED', url: rawUrl, reason: override.overrideReason, timestamp: Date.now() })`; return `{ allowed: true, overrideApplied: true }`.
         - Otherwise: call `AuditLogger.log({ event: 'HTTP_EGRESS_BLOCKED', url: rawUrl, timestamp: Date.now() })`; return `{ allowed: false, reason: 'HTTP_SCHEME_BLOCKED' }`.
      4. Return `{ allowed: true }`.
- [ ] Create `src/research/tools/errors.ts` (or append to `src/research/sandbox/errors.ts`):
  - Export `EgressBlockedError extends Error` with `url: string` and `reason: string` fields.
- [ ] Create `src/research/tools/secure_http_client.ts`:
  - Export a `SecureHttpClient` class with:
    - `static async get(url: string, override?: OverrideOptions): Promise<HttpResponse>`:
      1. Call `EgressGuard.validateUrl(url, override)`.
      2. If `result.allowed === false`, throw `EgressBlockedError({ url, reason: result.reason })`.
      3. Perform the actual HTTP GET using the injected adapter (default: `node-fetch` or `axios`). Return `HttpResponse`.
    - `static async post(url: string, body: unknown, override?: OverrideOptions): Promise<HttpResponse>`: same guard logic before posting.
  - Export a `HttpResponse` interface: `{ status: number; body: string; headers: Record<string, string> }`.
- [ ] Update the `ContentExtractor` tool (`src/research/tools/content_extractor.ts`) to:
  - Replace any direct `fetch()`/`axios.get()` calls with `SecureHttpClient.get()`.
  - Pass no override by default (HTTPS enforcement is automatic).
- [ ] Update the Serper/Google Search API client (`src/research/tools/serper_client.ts`) to:
  - Replace direct HTTP calls with `SecureHttpClient.get()` or `SecureHttpClient.post()`.

## 3. Code Review
- [ ] Confirm that `SecureHttpClient` is the **only** HTTP egress point used by all research tools — grep for direct `fetch(`, `axios.get(`, `axios.post(`, `http.request(` in `src/research/` and verify none exist outside of `secure_http_client.ts`.
- [ ] Verify that `EgressGuard.validateUrl()` never mutates the URL or performs side effects other than audit logging.
- [ ] Confirm that `AuditLogger.log()` is called for both blocked HTTP and allowed HTTP overrides — no silent pass-throughs.
- [ ] Verify that `EgressBlockedError` contains enough context for the `ResearchManager` to surface a meaningful user-facing error.
- [ ] Confirm the `allowHttpOverride` flag requires a non-empty `overrideReason` string — validate this and throw `TypeError` if `overrideReason` is empty when `allowHttpOverride` is `true`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/research/tools/__tests__/egress_guard.test.ts src/research/tools/__tests__/http_client.test.ts --coverage` and confirm:
  - All 8 test cases pass.
  - Branch coverage for `egress_guard.ts` is 100%.
  - Branch coverage for `secure_http_client.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Create `src/research/tools/secure_http_client.agent.md` documenting:
  - The HTTPS-only egress policy and its rationale.
  - The `allowHttpOverride` escape hatch: when it is acceptable to use, required `overrideReason`, and the audit trail it generates.
  - The `EgressBlockedError` and how consuming agents should handle it (surface to user, do not silently retry over HTTP).
- [ ] Create `src/research/tools/egress_guard.agent.md` documenting:
  - The URL validation logic and all possible `reason` codes.
  - The audit events emitted (`HTTP_EGRESS_BLOCKED`, `HTTP_OVERRIDE_ALLOWED`) and where they are stored.
- [ ] Append to `docs/architecture/phase_5_research.md` a section titled "Secure Web Scraping Egress" referencing `SecureHttpClient` as the mandatory HTTP adapter.

## 6. Automated Verification
- [ ] Run `npx jest src/research/tools/__tests__/egress_guard.test.ts src/research/tools/__tests__/http_client.test.ts --json --outputFile=/tmp/egress_guard_results.json`.
- [ ] Execute `node -e "const r = require('/tmp/egress_guard_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `grep -rn "axios\.get\|axios\.post\|^fetch(\|http\.request(" src/research/ --include="*.ts" | grep -v "secure_http_client.ts" | grep -v ".test.ts"` and assert the output is **empty** (no direct HTTP calls outside the secure client).
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors in the new files.
