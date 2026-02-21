# Task: Enforce TLS 1.3 on All Outbound HTTP Requests (Sub-Epic: 05_TLS and Cryptographic Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-027]

## 1. Initial Test Written
- [ ] In `src/network/__tests__/http-client.test.ts`, write unit tests using `nock` or a custom `https.Agent` spy to assert that the shared HTTP client is constructed with `minVersion: 'TLSv1.3'`.
- [ ] Write a test that instantiates the client and inspects its underlying `https.Agent` options, verifying `secureOptions` includes `SSL_OP_NO_TLSv1` and `SSL_OP_NO_TLSv1_1` (or equivalent constant flags from `crypto` / `constants`).
- [ ] Write an integration test using a mock HTTPS server (e.g., `selfsigned` + `https.createServer`) configured for TLS 1.2 only; assert the client throws a connection error with a recognizable message (e.g., `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`).
- [ ] Write a test verifying that every public export of `src/network/http-client.ts` that makes external calls (e.g., `get`, `post`, `stream`) uses the shared TLS-enforcing agent rather than Node's default global agent.

## 2. Task Implementation
- [ ] Create `src/network/http-client.ts` (or update if it exists). Export a singleton `secureFetch` wrapper built on Node's `https` module or `undici` `Agent`.
- [ ] Construct a shared `https.Agent` (or `undici.Agent`) with `{ minVersion: 'TLSv1.3' }`. For Node's built-in `https`, also pass `secureOptions: crypto.constants.SSL_OP_NO_TLSv1 | crypto.constants.SSL_OP_NO_TLSv1_1 | crypto.constants.SSL_OP_NO_TLSv1_2` to double-lock the floor.
- [ ] Replace all ad-hoc `fetch`/`axios`/`https.request` call sites that reach external APIs (Gemini, npm registry, VCS hosts) with `secureFetch`. Audit with `grep -r "https.request\|axios\|node-fetch\|cross-fetch" src/` to find all call sites.
- [ ] Add a module-level comment `// [5_SECURITY_DESIGN-REQ-SEC-SD-027]: TLS 1.3 enforced via minVersion on shared https.Agent` above the agent construction.
- [ ] Export a `getTlsAgentOptions()` helper that returns the agent config object, so downstream tasks (cipher suite, cert pinning) can compose on top of it.

## 3. Code Review
- [ ] Verify that no call site bypasses the shared agent (e.g., no bare `global.fetch` or `http.get` for external hosts).
- [ ] Confirm `minVersion: 'TLSv1.3'` is the only mechanism used — not a fragile runtime env-var.
- [ ] Confirm `getTlsAgentOptions()` is pure (returns a plain object, no side effects) for composability.
- [ ] Confirm TypeScript strict mode is satisfied: no `any` casts around agent options.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/network/__tests__/http-client.test.ts --coverage` and confirm all tests pass with ≥ 90 % line coverage on `http-client.ts`.
- [ ] Run the full test suite (`npm test`) to confirm no regressions.

## 5. Update Documentation
- [ ] Add a section "TLS Policy" to `docs/security.md` (create if absent) stating: "All outbound connections use TLS 1.3 minimum (REQ-SEC-SD-027). The shared agent is defined in `src/network/http-client.ts`."
- [ ] Update `memory/architecture-decisions.md` with an ADR entry: "ADR-SEC-001: TLS 1.3 enforced via Node https.Agent minVersion on all external HTTP calls."

## 6. Automated Verification
- [ ] Run `node -e "const {getTlsAgentOptions} = require('./dist/network/http-client'); const o = getTlsAgentOptions(); if(o.minVersion !== 'TLSv1.3') process.exit(1); console.log('TLS 1.3 enforced ✓');"` and assert exit code 0.
- [ ] Run `grep -r "minVersion" dist/network/http-client.js` and assert the string is present, confirming the build output retains the setting.
