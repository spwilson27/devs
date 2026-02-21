# Task: Build Regex Pattern Library for Phase 1 Secret Identification (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-050], [4_USER_FEATURES-REQ-021]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/patterns.test.ts`.
- [ ] For each of the following pattern categories, write at least two positive-match tests (should detect) and one negative-match test (must NOT over-fire on benign data):
  - `AWS_ACCESS_KEY` — matches `AKIA[0-9A-Z]{16}`; should NOT match `AKIAIOSFODNN7EXAMPLE` (well-known docs example may be acceptable to flag — document the decision).
  - `AWS_SECRET_KEY` — 40-char base64 string following `aws_secret`.
  - `GITHUB_TOKEN` — `ghp_`, `gho_`, `ghs_`, `ghr_` prefixed tokens.
  - `SLACK_TOKEN` — `xox[baprs]-` prefix tokens.
  - `STRIPE_KEY` — `sk_live_` and `pk_live_` prefixes.
  - `PRIVATE_KEY_BLOCK` — PEM `-----BEGIN ... PRIVATE KEY-----` blocks.
  - `GENERIC_API_KEY` — patterns like `api_key=`, `apikey=`, `API_KEY=` followed by non-whitespace 16–64 chars.
  - `BEARER_TOKEN` — `Authorization: Bearer <token>` patterns.
  - `DATABASE_URL` — `postgres://user:password@`, `mysql://`, `mongodb+srv://` with credentials embedded.
  - `JWT_TOKEN` — three Base64url segments separated by `.` with correct header prefix.
  - `SSH_PRIVATE_KEY` — `-----BEGIN OPENSSH PRIVATE KEY-----`.
  - `NPM_TOKEN` — `npm_` prefix.
  - `HEROKU_API_KEY` — UUID-style 32 hex chars.
  - `TWILIO_SID` — `AC` followed by 32 hex chars.
  - `SENDGRID_KEY` — `SG.` prefix.
  - `GOOGLE_API_KEY` — `AIza` prefix.
  - `FIREBASE_KEY` — `AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}`.
  - `AZURE_STORAGE_KEY` — Base64 with `AccountKey=` preceding.
  - `DISCORD_TOKEN` — `[\w-]{24}\.[\w-]{6}\.[\w-]{27}`.
  - `TELEGRAM_BOT_TOKEN` — `\d{8,10}:[A-Za-z0-9_-]{35}`.
  - At least 80 more patterns covering common secrets (SSH ed25519, GCP SA JSON, CircleCI tokens, etc.) — stub out as `// TODO: add <name> tests` with a failing test placeholder so the count can be verified.
- [ ] Add a test asserting `SECRET_PATTERNS.length >= 100` to enforce the 100+ pattern requirement.
- [ ] Confirm all tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=patterns --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/patterns.ts`.
- [ ] Export `SECRET_PATTERNS: ReadonlyArray<SecretPattern>` where `SecretPattern` is:
  ```ts
  export interface SecretPattern {
    type: string;          // e.g. "AWS_ACCESS_KEY"
    regex: RegExp;         // compiled with global + unicode flags
    description: string;  // human-readable label
  }
  ```
- [ ] Implement at minimum the 20 categories listed above plus 80+ additional patterns to exceed 100 total.
- [ ] Each `RegExp` must be compiled with `/g` flag so it can be used with `matchAll`.
- [ ] All regexes must pass the ReDoS safety check: no nested quantifiers over the same character class (document this constraint in a JSDoc comment at the top of `patterns.ts`).
- [ ] Export a helper `findPatternMatches(text: string): PatternMatch[]` where:
  ```ts
  export interface PatternMatch {
    type: string;
    value: string;
    start: number;
    end: number;
  }
  ```
- [ ] Export everything from `packages/secret-masker/src/index.ts`.

## 3. Code Review
- [ ] Verify `SECRET_PATTERNS.length >= 100` at module initialization (throw a descriptive `Error` if not, to catch accidental deletions).
- [ ] Confirm no pattern uses backtracking-heavy constructs: run `safe-regex` or equivalent static analysis on each compiled `RegExp` source.
- [ ] Confirm every `SecretPattern` has a non-empty `type` and `description`.
- [ ] Ensure `findPatternMatches` resets `regex.lastIndex` before each scan to avoid stateful `RegExp` bugs with the global flag.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=patterns --coverage` and confirm all tests pass.
- [ ] Confirm coverage for `patterns.ts` is ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Create `packages/secret-masker/docs/patterns.md` listing all pattern types, their regex source, and an example matching string (redacted to `***` for safety).
- [ ] Update `packages/secret-masker/README.md` with a `## Supported Secret Types` section linking to `docs/patterns.md`.
- [ ] Update `.agent/memory/phase_2.md` with: "Regex pattern library implemented: `SECRET_PATTERNS` in `@devs/secret-masker`. ≥100 patterns. See `packages/secret-masker/docs/patterns.md`."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=patterns --json --outputFile=/tmp/patterns_results.json && node -e "const r=require('/tmp/patterns_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `node -e "const {SECRET_PATTERNS}=require('./packages/secret-masker/dist'); if(SECRET_PATTERNS.length < 100) { console.error('FAIL: only ' + SECRET_PATTERNS.length + ' patterns'); process.exit(1); } console.log('PASS: ' + SECRET_PATTERNS.length + ' patterns');"` after building.
