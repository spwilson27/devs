# Task: Implement Host Keychain Integration Service (Sub-Epic: 06_Secret and Token Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-019]

## 1. Initial Test Written

- [ ] Create `src/security/__tests__/KeychainService.test.ts`.
- [ ] Write a unit test that mocks `keytar` and asserts `KeychainService.getSecret('GEMINI_API_KEY')` returns the mocked value from the OS keychain (not from `process.env` or the SQLite DB).
- [ ] Write a unit test that asserts `KeychainService.setSecret('GEMINI_API_KEY', 'test-value')` calls `keytar.setPassword` with the correct service name (`'devs'`) and account key.
- [ ] Write a unit test asserting that if `keytar` throws (e.g., the keychain is locked), `KeychainService.getSecret` throws a typed `KeychainUnavailableError` rather than returning `undefined` or leaking a raw error.
- [ ] Write an integration test (skipped in CI unless `KEYCHAIN_INTEGRATION=true`) that performs a real round-trip: `setSecret` → `getSecret` → `deleteSecret`, asserting the key is absent after deletion.
- [ ] Write a test asserting that `KeychainService` **never** reads from `process.env` (mock `process.env` and assert `getSecret` does not access it).
- [ ] Write a test asserting that `KeychainService` **never** reads from or writes to the SQLite state database (spy on `db.prepare` and assert it is never called inside `KeychainService` methods).

## 2. Task Implementation

- [ ] Install `keytar` as a production dependency: `npm install keytar`. Verify native bindings compile (`node -e "require('keytar')"`).
- [ ] Create `src/security/KeychainService.ts` exporting a singleton class `KeychainService`.
  - [ ] Define constant `KEYCHAIN_SERVICE_NAME = 'devs'`.
  - [ ] Implement `async getSecret(key: string): Promise<string>` — calls `keytar.getPassword(KEYCHAIN_SERVICE_NAME, key)`. If the result is `null`, throw `KeychainUnavailableError`. Never fall back to `process.env` or DB.
  - [ ] Implement `async setSecret(key: string, value: string): Promise<void>` — calls `keytar.setPassword(KEYCHAIN_SERVICE_NAME, key, value)`.
  - [ ] Implement `async deleteSecret(key: string): Promise<void>` — calls `keytar.deletePassword(KEYCHAIN_SERVICE_NAME, key)`.
  - [ ] Implement `async listSecretKeys(): Promise<string[]>` — calls `keytar.findCredentials(KEYCHAIN_SERVICE_NAME)` and returns the account names.
- [ ] Create `src/security/errors/KeychainUnavailableError.ts` — a typed subclass of `Error` with name `'KeychainUnavailableError'`.
- [ ] Expose `KeychainService` through `src/security/index.ts`.
- [ ] Update the orchestrator bootstrap sequence (`src/orchestrator/bootstrap.ts`) to call `KeychainService.getSecret('GEMINI_API_KEY')` at startup, replacing any existing `process.env.GEMINI_API_KEY` reads.
- [ ] Add a migration hint in `src/cli/commands/setup.ts`: if `process.env.GEMINI_API_KEY` is detected, prompt the user to migrate it to the keychain via `KeychainService.setSecret`, then advise them to unset the env variable.
- [ ] Add a `.env.example` comment block: `# DO NOT put real API keys here. Use 'devs setup' to store them in your OS keychain.`

## 3. Code Review

- [ ] Verify that **no** call site in `src/` reads `process.env.GEMINI_API_KEY` (or any other API key env var) directly — use `grep -r "process.env" src/ --include="*.ts"` and confirm only `KeychainService` and test helpers reference key env vars.
- [ ] Confirm `keytar` is listed under `dependencies` (not `devDependencies`) in `package.json`.
- [ ] Confirm `KeychainUnavailableError` is a properly typed `Error` subclass with `instanceof` support.
- [ ] Confirm the singleton is lazily initialised and not imported at module evaluation time in a way that would break unit tests.
- [ ] Verify no secret value ever appears in a `console.log`, structured log, or thrown error message (search for `.log(` calls in `KeychainService.ts`).

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=KeychainService` and confirm all unit tests pass with 0 failures.
- [ ] Run `npm run lint` and confirm no lint errors are introduced.
- [ ] If `KEYCHAIN_INTEGRATION=true` is set in the shell, run the integration test suite and confirm the round-trip test passes.

## 5. Update Documentation

- [ ] Update `docs/security/secret-management.md` (create if absent) to document that all API keys are stored in the OS keychain via `KeychainService`, with examples for `devs setup` usage.
- [ ] Update `docs/architecture/orchestrator.md` to note that the bootstrap sequence retrieves secrets from the OS keychain.
- [ ] Add an entry in `CHANGELOG.md` under the current version: `feat(security): Host Keychain Integration — API keys are now stored in OS keychain via keytar [REQ-SEC-SD-019]`.
- [ ] Update the agent memory file `memory/security-decisions.md` (create if absent): record the decision to use `keytar` for cross-platform keychain access and the prohibition on `.env` / DB secret storage.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern=KeychainService --coverage` and assert line coverage for `src/security/KeychainService.ts` is ≥ 90%.
- [ ] Run `grep -r "process\.env\.(GEMINI|API_KEY|SECRET)" src/ --include="*.ts" | grep -v "KeychainService\|\.test\."` and assert the command returns no matches (zero lines).
- [ ] Run `node -e "require('./dist/security/KeychainService')"` after `npm run build` and assert no import errors are thrown.
