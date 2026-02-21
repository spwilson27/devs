# Task: Implement Host Entropy Seeding for Sandbox PRNGs (Sub-Epic: 05_TLS and Cryptographic Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-EDG-002]

## 1. Initial Test Written
- [ ] In `src/sandbox/__tests__/entropy-seeder.test.ts`, write a unit test that calls `seedSandboxEntropy()` and asserts it returns a `Buffer` of at least 32 bytes sourced from `crypto.randomBytes` (mock `crypto.randomBytes` to return a known value and assert the seed equals that value).
- [ ] Write a test that calls `injectEntropy(sandboxContext)` where `sandboxContext` is a mock object. Assert: (a) `sandboxContext.env['DEVS_ENTROPY_SEED']` is set to a hex string, and (b) the length of the decoded seed bytes is ≥ 32.
- [ ] Write a test verifying `seedSandboxEntropy()` does NOT use `Math.random()` at any point — spy on `Math.random` and assert it is never called.
- [ ] Write a test for the non-blocking guarantee: mock `crypto.randomBytes` to invoke its callback asynchronously (nextTick), then call the async variant `seedSandboxEntropyAsync()`, and assert it resolves within 100ms without blocking the event loop.
- [ ] Write a test for `validateEntropySeed(seed: Buffer): boolean` that asserts `false` for a seed shorter than 32 bytes and `true` for 32+ byte seeds.

## 2. Task Implementation
- [ ] Create `src/sandbox/entropy-seeder.ts`. Add module-level comment:
  ```ts
  // [5_SECURITY_DESIGN-REQ-SEC-EDG-002]: Sandbox PRNGs seeded from host entropy
  // via crypto.randomBytes to ensure non-blocking, cryptographically secure operation.
  ```
- [ ] Export:
  - `ENTROPY_SEED_BYTES = 48` — constant for seed length (48 bytes = 384 bits, well above NIST SP 800-90A minimum).
  - `seedSandboxEntropy(): Buffer` — calls `crypto.randomBytes(ENTROPY_SEED_BYTES)` synchronously and returns the result.
  - `seedSandboxEntropyAsync(): Promise<Buffer>` — wraps the callback form of `crypto.randomBytes` in a Promise to avoid blocking when called from async contexts.
  - `validateEntropySeed(seed: Buffer): boolean` — returns `seed.length >= 32`.
  - `injectEntropy(sandboxEnv: Record<string, string>): void` — calls `seedSandboxEntropy()`, validates the seed, and sets `sandboxEnv['DEVS_ENTROPY_SEED']` to `seed.toString('hex')`.
- [ ] In `src/sandbox/sandbox-manager.ts` (create or update), call `injectEntropy(sandboxContext.env)` during sandbox initialization, before any agent process is spawned.
- [ ] Ensure the generated seed is never logged to console or written to disk. Add a lint rule comment `// no-log` above any `console.*` calls in this file to signal intent.

## 3. Code Review
- [ ] Verify only `crypto.randomBytes` (Node built-in) is used — no third-party PRNG libraries, no `Math.random`.
- [ ] Verify `injectEntropy` validates the seed with `validateEntropySeed` before injecting; if validation fails, it must throw `EntropyError` rather than silently inject a weak seed.
- [ ] Verify `ENTROPY_SEED_BYTES` is a named constant, not a magic number.
- [ ] Verify `sandboxEnv['DEVS_ENTROPY_SEED']` is hex-encoded (not base64 or binary) to avoid shell quoting issues when passed to child processes.
- [ ] Verify TypeScript strict mode: no `any`, proper typing of `sandboxEnv`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/entropy-seeder.test.ts --coverage` and confirm all tests pass with ≥ 90 % line coverage on `entropy-seeder.ts`.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Append to `docs/security.md` a section "Sandbox Entropy Seeding": "Sandbox PRNGs are seeded from host entropy using Node's `crypto.randomBytes` (REQ-SEC-EDG-002). A 48-byte seed is injected as `DEVS_ENTROPY_SEED` hex into each sandbox's environment before agent process spawn. See `src/sandbox/entropy-seeder.ts`."
- [ ] Update `memory/architecture-decisions.md`: "ADR-SEC-005: Sandbox PRNG seeding uses 48-byte (384-bit) seeds from crypto.randomBytes, injected as DEVS_ENTROPY_SEED env var at sandbox init time."
- [ ] Document the `DEVS_ENTROPY_SEED` environment variable in `docs/environment-variables.md` (create if absent), noting it is sandbox-internal and must not be forwarded to the host environment.

## 6. Automated Verification
- [ ] Run:
  ```bash
  node -e "
  const {seedSandboxEntropy, validateEntropySeed, ENTROPY_SEED_BYTES} = require('./dist/sandbox/entropy-seeder');
  const seed = seedSandboxEntropy();
  if (!validateEntropySeed(seed)) { console.error('Seed too short'); process.exit(1); }
  if (seed.length < ENTROPY_SEED_BYTES) { console.error('Seed length mismatch'); process.exit(1); }
  console.log('Host entropy seeding verified (' + seed.length + ' bytes) ✓');
  "
  ```
  Assert exit code 0.
- [ ] Run `grep -r "Math.random" src/sandbox/entropy-seeder.ts` and assert no matches (zero occurrences).
