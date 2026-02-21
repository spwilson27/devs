# Task: Implement Default-Secure Auth Boilerplate Generator (Sub-Epic: 06_Secret and Token Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-025]

## 1. Initial Test Written

- [ ] Create `src/codegen/__tests__/AuthBoilerplateGenerator.test.ts`.
- [ ] Write a unit test asserting that `AuthBoilerplateGenerator.generate({ framework: 'express' })` returns source files that include an `argon2` password hashing call (import of `argon2` and call to `argon2.hash()`) and never include `bcrypt`, `md5`, `sha1`, or `crypto.createHash('md5')`.
- [ ] Write a unit test asserting the generated JWT utilities use short-lived access tokens (`expiresIn: '15m'`) and a separate refresh token (`expiresIn: '7d'`) with a distinct signing secret, implementing rotation logic.
- [ ] Write a unit test asserting that the generated cookie configuration sets `httpOnly: true`, `secure: true`, `sameSite: 'Strict'`, and never sets `sameSite: 'None'` without `secure: true`.
- [ ] Write a unit test asserting that `AuthBoilerplateGenerator.validate(sourceCode)` returns a `ValidationResult` with `errors` containing `'basic-auth-detected'` when the input source contains HTTP Basic Authentication patterns (`Authorization: Basic`, `btoa(`, `Buffer.from(...).toString('base64')`).
- [ ] Write a unit test asserting that `validate` returns `errors: []` for the generated boilerplate itself (self-validation: the output must pass its own validator).
- [ ] Write a unit test asserting that the generated boilerplate includes a `POST /auth/refresh` endpoint that invalidates the old refresh token before issuing a new one (token rotation, not reuse).
- [ ] Write a snapshot test that generates boilerplate for `express` and compares against a stored snapshot to detect unintended regressions in the template.

## 2. Task Implementation

- [ ] Create `src/codegen/AuthBoilerplateGenerator.ts` exporting class `AuthBoilerplateGenerator`.
  - [ ] Implement `generate(options: AuthBoilerplateOptions): Promise<AuthBoilerplateOutput>` — returns a map of file paths to source code strings for the following files:
    - `src/auth/hashPassword.ts` — exports `hashPassword(plain: string): Promise<string>` using `argon2.hash` with `{ type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 }`.
    - `src/auth/verifyPassword.ts` — exports `verifyPassword(hash: string, plain: string): Promise<boolean>` using `argon2.verify`.
    - `src/auth/jwtService.ts` — exports `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `rotateRefreshToken`. Access token TTL: `15m`. Refresh token TTL: `7d`. Uses `jsonwebtoken` with `algorithm: 'RS256'` (asymmetric).
    - `src/auth/cookieConfig.ts` — exports `SECURE_COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 900 }`.
    - `src/auth/routes/authRouter.ts` — Express router with `POST /login`, `POST /logout`, `POST /auth/refresh`. Refresh endpoint invalidates the old token in the DB before issuing a new one.
  - [ ] Implement `validate(sourceCode: string): ValidationResult` — scans the provided source string for prohibited patterns: `Authorization:\s*Basic`, `btoa\(`, `Buffer\.from[^)]*\.toString\(['"]base64`, `basicAuth`, `express-basic-auth`. Returns `{ errors: string[] }`.
- [ ] Create `src/codegen/errors/InsecureAuthPatternError.ts` — typed `Error` with `pattern: string` and `filePath: string`.
- [ ] Integrate `AuthBoilerplateGenerator.validate` into the Task Code Review agent step (`src/agents/CodeReviewAgent.ts`): after an agent generates auth-related files, call `validate` on each file and fail the review if any `errors` are returned, triggering a `REVIEW_FAILED` state transition.
- [ ] Add `argon2` and `jsonwebtoken` to the generated project's `package.json` template (`src/codegen/templates/package.json.template`).
- [ ] Expose `AuthBoilerplateGenerator` through `src/codegen/index.ts`.

## 3. Code Review

- [ ] Verify the `argon2` parameters meet OWASP 2024 recommendations: `memoryCost ≥ 65536`, `timeCost ≥ 3`, `parallelism ≥ 4`, `type: argon2id`.
- [ ] Verify the JWT signing algorithm is asymmetric (`RS256` or `ES256`) — symmetric `HS256` is prohibited in the boilerplate.
- [ ] Confirm the refresh token rotation endpoint queries the DB to confirm the old token is valid before invalidating and issuing a new one (prevents replay).
- [ ] Confirm `validate` catches all three basic-auth patterns (`Authorization: Basic`, `btoa`, `Buffer.from(...base64)`).
- [ ] Confirm `CodeReviewAgent` integration causes a hard `REVIEW_FAILED` (not a warning) when `validate` returns errors.
- [ ] Verify no generated file contains `console.log` statements that might print password hashes or token values.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=AuthBoilerplateGenerator` and confirm all tests pass with 0 failures.
- [ ] Run `npm test -- --testPathPattern=AuthBoilerplateGenerator -u` to update snapshots only if the template intentionally changed, then commit the updated snapshot.
- [ ] Run `npm run lint` and confirm no lint errors.
- [ ] Run `npm run build` and confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Update `docs/codegen/auth-boilerplate.md` (create if absent) documenting the generated auth stack: Argon2id for password hashing, RS256 JWT with 15m access / 7d refresh rotation, secure cookie config, and prohibited patterns.
- [ ] Update `docs/security/generated-project-security.md` (create if absent) explaining the default-secure auth guarantees applied to all generated projects.
- [ ] Add a `CHANGELOG.md` entry: `feat(codegen): Default-secure auth boilerplate generator — Argon2id, JWT RS256 rotation, secure cookies; basic-auth prohibited [REQ-SEC-SD-025]`.
- [ ] Update agent memory `memory/codegen-decisions.md` (create if absent): record that Argon2id is the mandated password hash algorithm, RS256 JWT with token rotation is mandatory, and basic-auth is prohibited in all generated projects.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern=AuthBoilerplateGenerator --coverage` and assert coverage for `src/codegen/AuthBoilerplateGenerator.ts` is ≥ 90%.
- [ ] Generate a sample project using `devs generate --template minimal` and run `AuthBoilerplateGenerator.validate` against all `src/auth/**/*.ts` files in the output — assert zero errors.
- [ ] Run `grep -r "basicAuth\|btoa\|Authorization.*Basic\|HS256" src/codegen/templates/ --include="*.ts"` and assert the command returns no matches.
