# Task: Pre-Persistence Redaction & SQLite Integration (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-038], [8_RISKS-REQ-114]

## 1. Initial Test Written

- [ ] Create `packages/orchestrator/src/__tests__/pre-persistence-redaction.test.ts` (or the equivalent path).
- [ ] Test the `PersistenceLayer` (or equivalent class responsible for writing to SQLite) to verify that:
  - When `saveToolCallOutput({ stdout: "api_key=AKIAIOSFODNN7EXAMPLE00000", stderr: "" })` is called, the value written to the `tool_calls.stdout` column in SQLite is `"api_key=[REDACTED]"`, NOT the raw value.
  - When `saveAgentLog({ content: "The token is: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456" })` is called, the `logs.content` column stores the redacted version.
  - When `saveReasoningTrace({ thought: "I will use key AKIAIOSFODNN7EXAMPLE00000 to authenticate" })` is called, the `reasoning_traces.thought` column stores the redacted version.
- [ ] Test that the `PersistenceLayer` emits a `'secret-redacted'` event (or equivalent audit callback) each time it applies redaction before a write, so the security alert system can record the event.
- [ ] Test that `PersistenceLayer` with a `null`/`undefined` input does not throw, and stores `null`/`""` as-is.
- [ ] All tests MUST fail initially.

## 2. Task Implementation

- [ ] Locate the `PersistenceLayer` class (or equivalent SQLite write wrapper) in the `@devs/orchestrator` or `@devs/state` package.
- [ ] Inject `ISecretMasker` into `PersistenceLayer` constructor (via dependency injection). Default to `SecretMaskerFactory.create()` if not provided.
- [ ] Create a private helper `private redactBeforeSave(value: string | null | undefined): string | null`:
  - Returns `null` if the value is `null` or `undefined`.
  - Otherwise calls `this.masker.mask(value)`, emits a `'secret-redacted'` event if `hitCount > 0`, and returns `result.masked`.
- [ ] Apply `redactBeforeSave()` to the following fields before executing any SQLite `INSERT` or `UPDATE`:
  - `tool_calls`: `stdout`, `stderr`, `raw_output`.
  - `logs`: `content`, `message`.
  - `reasoning_traces`: `thought`, `content`.
  - Any other column storing free-form agent output (review the schema and apply consistently).
- [ ] Emit a `'secret-redacted'` event on the `PersistenceLayer` event emitter with payload `{ table: string; column: string; hitCount: number; patterns: string[] }` for each column write that produced redaction hits.
- [ ] Subscribe to the `'secret-redacted'` event in the orchestrator startup code and insert a row into the `security_alerts` table with `{ timestamp, alert_type: 'secret-redacted', details: JSON.stringify(payload) }`.

## 3. Code Review

- [ ] Verify redaction is applied in `PersistenceLayer`, not in the calling code, so it is impossible to accidentally bypass it by calling the persistence layer directly.
- [ ] Confirm the `security_alerts` table insert happens asynchronously and does NOT block the main write path (use a non-awaited promise or event queue).
- [ ] Verify no raw secret value is ever passed to a SQLite `db.prepare()` or `db.run()` call without first being passed through `redactBeforeSave()`.
- [ ] Confirm all existing SQLite write paths are accounted for — perform a `grep -r "db.prepare\|db.run\|db.exec" packages/` to enumerate all write sites and verify each is covered.
- [ ] Ensure the `redactBeforeSave()` helper handles `Buffer` and non-string types gracefully (convert to string via `.toString('utf8')` before masking).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern=pre-persistence-redaction` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/orchestrator test` to confirm no regressions.
- [ ] Run a database integration test: spin up an in-memory SQLite database, perform a tool-call write with a secret in stdout, then `SELECT stdout FROM tool_calls` and assert the value does NOT contain the original secret.

## 5. Update Documentation

- [ ] Update `packages/orchestrator/.agent.md` (or `packages/state/.agent.md`):
  - Add a "Pre-Persistence Redaction" section specifying which tables and columns are protected.
  - Document the `'secret-redacted'` event API including the payload shape.
  - Include an "Agentic Hook": "Verify redaction by querying `security_alerts` after any tool call that handled credentials."
- [ ] Add a comment block above each SQLite write site that has been hardened, e.g.:
  ```typescript
  // SECURITY: stdout is redacted via SecretMasker before persistence (see PersistenceLayer.redactBeforeSave).
  ```

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/orchestrator test --coverage` and assert exit code `0`.
- [ ] Run the following SQLite smoke-test and assert `PASS`:
  ```bash
  node -e "
  const {PersistenceLayer} = require('./packages/orchestrator/dist');
  const db = new PersistenceLayer(':memory:');
  db.saveToolCallOutput({ taskId: 'test-1', stdout: 'api_key=AKIAIOSFODNN7EXAMPLE00000', stderr: '' });
  const row = db.db.prepare('SELECT stdout FROM tool_calls WHERE task_id = ?').get('test-1');
  console.log(!row.stdout.includes('AKIAIOSFODNN7EXAMPLE') && row.stdout.includes('[REDACTED]') ? 'PASS' : 'FAIL: ' + row.stdout);
  "
  ```
- [ ] Run `grep -r "AKIAIOSFODNN7EXAMPLE" .devs/state.sqlite 2>/dev/null && echo FAIL || echo PASS` after running the test suite to confirm no test fixtures leak secrets into the state database.
