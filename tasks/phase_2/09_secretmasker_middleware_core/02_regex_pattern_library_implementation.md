# Task: Regex Pattern Library Implementation (100+ Patterns) (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [9_ROADMAP-TAS-204], [1_PRD-REQ-SEC-005]

## 1. Initial Test Written

- [ ] Create `packages/secret-masker/src/__tests__/patterns.test.ts`. For each pattern category below, write at least two tests: one that MUST match a known secret string (true positive) and one that MUST NOT match a clearly benign string (true negative).
- [ ] Pattern categories to test:
  - **AWS**: `AKIA[0-9A-Z]{16}` (Access Key ID), `aws_secret_access_key = [A-Za-z0-9/+=]{40}`.
  - **GCP/GCP Service Account**: `AIza[0-9A-Za-z\\-_]{35}`, JSON service-account blocks containing `"private_key"`.
  - **GitHub**: `gh[pousr]_[A-Za-z0-9]{36,255}`, `github_pat_[A-Za-z0-9_]{82}`.
  - **Generic API Key**: `(?i)(api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*\S{16,}`.
  - **Bearer Token**: `(?i)bearer\s+[A-Za-z0-9\-._~+/]+=*`.
  - **Basic Auth in URL**: `https?://[^:]+:[^@]+@`.
  - **Private Keys (PEM)**: `-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----`.
  - **JWT**: `eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+`.
  - **Database DSN**: `(postgres|mysql|mongodb|redis)://[^:]+:[^@]+@`.
  - **Slack Token**: `xox[baprs]-[0-9A-Za-z\-]{10,}`.
  - **Stripe Key**: `(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}`.
  - **Generic Password**: `(?i)password\s*[:=]\s*\S{8,}`.
  - **SSH Private Key**: `-----BEGIN OPENSSH PRIVATE KEY-----`.
  - **Hex Secret (32+ chars)**: `\b[0-9a-f]{32,}\b`.
  - Additional patterns (expand to >= 100 total) covering: Twilio, SendGrid, Mailgun, Azure SAS, NPM tokens, Docker config credentials, generic `secret`, `token`, `credential` key-value pairs.
- [ ] All pattern tests MUST fail initially because `PATTERNS` is not yet implemented.

## 2. Task Implementation

- [ ] Create `packages/secret-masker/src/patterns/index.ts` exporting `PATTERNS: PatternDefinition[]` where `PatternDefinition = { id: string; regex: RegExp; description: string; severity: 'critical' | 'high' | 'medium' }`.
- [ ] Implement at least 100 `PatternDefinition` entries covering all categories listed in the test plan. Organize patterns into sub-files by category (e.g., `patterns/aws.ts`, `patterns/gcp.ts`, `patterns/generic.ts`, `patterns/tokens.ts`, `patterns/pem.ts`, `patterns/database.ts`) and aggregate them in `patterns/index.ts`.
- [ ] Each regex MUST use the global flag (`/g`) to allow repeated `replace` calls across a single string.
- [ ] Each regex MUST be pre-compiled at module load time (not inside a function) to avoid per-call overhead.
- [ ] Update `SecretMasker.ts` to accept a `patterns: PatternDefinition[]` parameter in its constructor (defaulting to the exported `PATTERNS`) and use them in the `mask()` method: iterate patterns, apply `string.replace(regex, '[REDACTED]')`, accumulate `IRedactionHit` entries.
- [ ] Update `SecretMaskerFactory.create()` to pass the default `PATTERNS` to `new SecretMasker(PATTERNS)`.
- [ ] Export `PATTERNS` and `PatternDefinition` from `packages/secret-masker/src/index.ts`.

## 3. Code Review

- [ ] Verify all 100+ patterns have unique `id` strings (no duplicates). Run `pnpm --filter @devs/secret-masker ts-node -e "import {PATTERNS} from './src'; const ids = PATTERNS.map(p=>p.id); console.log(new Set(ids).size === ids.length)"` and confirm `true`.
- [ ] Verify no regex uses catastrophic backtracking patterns (no nested quantifiers on the same character class without atomic grouping). Review each pattern manually.
- [ ] Confirm all regex literals use the `g` flag and are defined at the module scope, not inline.
- [ ] Confirm `mask()` resets `regex.lastIndex = 0` before each call to avoid stateful global-regex bugs.
- [ ] Ensure no pattern's regex can match empty strings (which would produce infinite loops).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/secret-masker test -- --testPathPattern=patterns` and confirm all true-positive and true-negative tests pass.
- [ ] Run `pnpm --filter @devs/secret-masker test` to confirm no regressions from Task 01 tests.

## 5. Update Documentation

- [ ] Update `packages/secret-masker/.agent.md`:
  - Add a "Pattern Library" section listing each category file, its pattern count, and example IDs.
  - Document that custom patterns can be injected via `SecretMaskerFactory.create({ additionalPatterns: [...] })` (note: factory signature to be updated in a later task if needed).
- [ ] Add inline JSDoc to each pattern category file describing the threat model (e.g., `// AWS credentials can grant full account access if leaked`).

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/secret-masker test --coverage` and assert exit code `0`.
- [ ] Run the following script and assert output is `>= 100`:
  ```bash
  node -e "const {PATTERNS} = require('./packages/secret-masker/dist'); console.log(PATTERNS.length >= 100 ? 'PASS: ' + PATTERNS.length + ' patterns' : 'FAIL: only ' + PATTERNS.length)"
  ```
- [ ] Run `pnpm --filter @devs/secret-masker build` and assert exit code `0`.
