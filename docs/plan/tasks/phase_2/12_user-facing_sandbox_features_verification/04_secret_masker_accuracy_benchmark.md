# Task: SecretMasker Accuracy Benchmark Suite (>99.9% Recall) (Sub-Epic: 12_User-Facing Sandbox Features & Verification)

## Covered Requirements
- [9_ROADMAP-REQ-021]

## 1. Initial Test Written
- [ ] Create the benchmark fixture file at `packages/core/src/sandbox/__tests__/fixtures/secret_benchmark.jsonl`. Each line must be a JSON object with:
  - `id`: unique string identifier.
  - `input`: a string containing exactly one secret of the specified type.
  - `secretType`: one of `aws_key`, `gcp_key`, `ssh_private_key`, `jwt_token`, `stripe_key`, `github_pat`, `sendgrid_key`, `generic_high_entropy`, `pii_ssn`, `pii_credit_card`, etc.
  - `expectedRedacted`: boolean — `true` if the secret should be replaced with `[REDACTED]`.
  - The fixture MUST contain at least 500 entries covering all secret types, including adversarial cases (secrets embedded in JSON strings, base64-encoded secrets, secrets with newlines).
- [ ] In `packages/core/src/sandbox/__tests__/SecretMasker.benchmark.test.ts`, write the benchmark test:
  - Load all entries from `secret_benchmark.jsonl`.
  - For each entry, call `SecretMasker.mask(entry.input)` and compare `output.includes('[REDACTED]')` to `entry.expectedRedacted`.
  - Track `truePositives`, `falseNegatives`, and `falsePositives`.
  - Assert `recall = truePositives / (truePositives + falseNegatives) >= 0.999` (>99.9%).
  - Assert `precision >= 0.98` (allowing up to 2% false positives).
  - Log the full breakdown by `secretType` for debugging if the benchmark fails.
- [ ] In `packages/core/src/sandbox/__tests__/SecretMasker.unit.test.ts`, write targeted unit tests:
  - Test that `SecretMasker.mask("AKIAIOSFODNN7EXAMPLE")` returns `"[REDACTED]"` (AWS Access Key pattern).
  - Test that `SecretMasker.mask("sk-ant-abc123...")` returns `"[REDACTED]"` (Anthropic key pattern).
  - Test that a string with Shannon entropy < 3.5 (e.g., `"hello world this is normal text"`) is NOT redacted.
  - Test that a string with Shannon entropy > 4.5 (e.g., a random 32-char base64 string) IS redacted.
  - Test that `SecretMasker.mask("password: supersecretvalue123!")` returns `"password: [REDACTED]"` (preserves surrounding context, replaces only the secret value).
  - Test that `SecretMasker.mask()` is idempotent: masking an already-masked string does not double-redact.
  - Test that masking a 10MB string completes within 500ms (performance constraint).

## 2. Task Implementation
- [ ] Implement `SecretMasker` in `packages/core/src/sandbox/SecretMasker.ts`:
  - **Phase 1 — Pattern Matching**: Apply a catalog of 100+ named regex patterns (see `packages/core/src/sandbox/secretPatterns.ts`) using `String.prototype.replace` with a `[REDACTED]` replacer. Patterns must cover: AWS, GCP, Azure, GitHub, Stripe, SendGrid, Twilio, Slack, JWT, SSH private keys, RSA keys, PEM certificates, SSN, credit card numbers (Luhn-valid patterns), and generic `password: <value>` / `api_key: <value>` key-value patterns.
  - **Phase 2 — Shannon Entropy**: Calculate Shannon entropy (`H = -Σ p(x) log₂ p(x)`) for each token (whitespace-delimited). If `H > 4.5` and token length ≥ 20 characters and the token has not already been redacted, replace with `[REDACTED]`.
  - **Phase 3 — Replacement Hashing**: For audit purposes, store a SHA-256 hash of each unique redacted value in `SecretMasker.redactedHashes: Map<string, string>` (hash → original position metadata). This allows post-hoc auditing without storing the secret.
  - Export `mask(input: string): string` as the primary public API.
- [ ] Create `packages/core/src/sandbox/secretPatterns.ts` containing all regex patterns as an exported `const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }>` array. Patterns must be pre-compiled (not constructed at call time).
- [ ] Add `SecretMasker` to the `ToolProxy` stream pipeline in `packages/core/src/mcp/ToolProxy.ts`:
  - After receiving sandbox stdout/stderr, pipe through `SecretMasker.mask()` before storing in the Glass-Box or returning to the LLM.
- [ ] Create `scripts/run_secret_masker_benchmark.sh`:
  ```bash
  #!/bin/bash
  pnpm --filter @devs/core test -- --testPathPattern=SecretMasker.benchmark --verbose 2>&1 | tee .devs/reports/secret_masker_benchmark.txt
  grep -E "recall|precision|PASS|FAIL" .devs/reports/secret_masker_benchmark.txt
  ```

## 3. Code Review
- [ ] Verify all regex patterns in `secretPatterns.ts` are pre-compiled (outside function scope) to avoid re-compilation overhead on every call.
- [ ] Confirm entropy calculation handles the empty string without throwing (return 0 entropy).
- [ ] Confirm `SecretMasker.mask()` is a pure function with no side effects beyond populating `redactedHashes`.
- [ ] Confirm the `ToolProxy` integration does not buffer the entire stream before masking — use streaming `Transform` semantics if the output exceeds 1MB.
- [ ] Confirm no regex pattern uses catastrophic backtracking — run each pattern through a ReDoS checker (e.g., `safe-regex` or `vuln-regex-detector`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SecretMasker.unit` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SecretMasker.benchmark` and confirm recall ≥ 99.9% and precision ≥ 98%.
- [ ] Run `bash scripts/run_secret_masker_benchmark.sh` and confirm the output file `.devs/reports/secret_masker_benchmark.txt` contains `PASS`.
- [ ] Run `pnpm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/security/secret-masker.md`:
  - Document all three phases (Pattern, Entropy, Replacement Hashing).
  - List all 100+ pattern categories with one example each.
  - Document the entropy threshold (4.5) and minimum token length (20 chars) rationale.
  - Document the benchmark methodology and the ≥99.9% recall requirement.
- [ ] Update `.agent/memory/phase_2_decisions.md` with the entropy threshold decision (4.5) and the rationale for the 20-character minimum token length.
- [ ] Add a JSDoc comment on `SecretMasker.mask()` documenting all three phases and the idempotency guarantee.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run `bash scripts/run_secret_masker_benchmark.sh` and confirm exit code 0 and the output contains `"recall: 0.999"` or higher.
- [ ] Run the following to verify the pattern count:
  ```bash
  node -e "
    const { SECRET_PATTERNS } = require('./packages/core/dist/sandbox/secretPatterns');
    console.log('Pattern count:', SECRET_PATTERNS.length);
    process.exit(SECRET_PATTERNS.length >= 100 ? 0 : 1);
  "
  # Expected exit code: 0
  ```
- [ ] Run the following to verify masking performance:
  ```bash
  node -e "
    const { SecretMasker } = require('./packages/core/dist/sandbox/SecretMasker');
    const input = 'AKIAIOSFODNN7EXAMPLE ' + 'x'.repeat(10 * 1024 * 1024);
    const start = Date.now();
    SecretMasker.mask(input);
    const elapsed = Date.now() - start;
    console.log('Elapsed:', elapsed, 'ms');
    process.exit(elapsed <= 500 ? 0 : 1);
  "
  # Expected exit code: 0 (completes within 500ms)
  ```
