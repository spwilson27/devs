# Task: Implement Directive Injection Authorization Guard (Sub-Epic: 06_Secret and Token Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-024]

## 1. Initial Test Written

- [ ] Create `src/security/__tests__/DirectiveAuthorizationGuard.test.ts`.
- [ ] Write a unit test asserting that `DirectiveAuthorizationGuard.authorize(directive, context)` returns `true` when `context.sessionId` matches the active authenticated user session stored in the DB.
- [ ] Write a unit test asserting that `authorize` throws `UnauthorizedDirectiveError` when the `context.sessionId` does not match the active session (i.e., the directive originates from an unexpected source).
- [ ] Write a unit test asserting that `authorize` throws `UnauthorizedDirectiveError` when `context.sessionId` is missing or undefined.
- [ ] Write a unit test asserting that `authorize` throws `UnauthorizedDirectiveError` when the user session has expired (session `expires_at < now()`).
- [ ] Write a unit test that mocks the MCP `inject_directive` tool handler and asserts it calls `DirectiveAuthorizationGuard.authorize` before processing any directive payload — if authorization fails the MCP response contains `error: 'UNAUTHORIZED'` and the orchestrator state is unchanged.
- [ ] Write a unit test asserting that all authorization attempts (both successful and failed) are written to the `directive_audit_log` table in SQLite with columns `(id, session_id, directive_type, authorized, attempted_at, reason)`.
- [ ] Write an integration test that sends an `inject_directive` MCP request with a forged session ID and asserts the orchestrator state is **not** modified.

## 2. Task Implementation

- [ ] Create `src/security/DirectiveAuthorizationGuard.ts` exporting a singleton class `DirectiveAuthorizationGuard`.
  - [ ] Implement `async authorize(directive: DirectivePayload, context: RequestContext): Promise<void>` — throws `UnauthorizedDirectiveError` if `context.sessionId` is absent, expired, or does not match the active session in the `user_sessions` SQLite table. On success, writes an audit record. On failure, writes an audit record and throws.
  - [ ] Implement `async getActiveSession(): Promise<UserSession | null>` — queries `user_sessions` for the current active session (`is_active = 1 AND expires_at > datetime('now')`).
- [ ] Create `src/security/errors/UnauthorizedDirectiveError.ts` — typed `Error` with fields `sessionId: string` (redacted in message), `reason: string`.
- [ ] Add the `directive_audit_log` and `user_sessions` table migrations to `src/db/migrations/` (e.g., `005_add_directive_audit.sql`):
  ```sql
  CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS directive_audit_log (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    directive_type TEXT NOT NULL,
    authorized INTEGER NOT NULL,
    attempted_at TEXT NOT NULL,
    reason TEXT
  );
  ```
- [ ] Update the MCP server's `inject_directive` tool handler (`src/mcp/tools/injectDirective.ts`) to call `DirectiveAuthorizationGuard.authorize(directive, context)` as the **first** operation before any state mutation.
- [ ] Implement session creation in `src/security/SessionManager.ts` (create if absent): `async createSession(ttlSeconds: number): Promise<UserSession>` — generates a cryptographically random session token (`crypto.randomBytes(32).toString('hex')`), inserts into `user_sessions`, and returns the session object.
- [ ] Expose `DirectiveAuthorizationGuard` and `SessionManager` through `src/security/index.ts`.

## 3. Code Review

- [ ] Verify that every call site for `inject_directive` in `src/mcp/` calls `DirectiveAuthorizationGuard.authorize` before mutating orchestrator state — use `grep -r "injectDirective\|inject_directive" src/mcp/` and review each result.
- [ ] Confirm the session token comparison uses a constant-time comparison function (e.g., `crypto.timingSafeEqual`) to mitigate timing attacks.
- [ ] Confirm `UnauthorizedDirectiveError` does **not** include the session token in its message or stack trace.
- [ ] Confirm the `directive_audit_log` is written for **both** authorized and unauthorized attempts (test the negative path explicitly).
- [ ] Confirm session expiry is enforced using `datetime('now')` in the SQL query (not in application code) to avoid clock skew issues.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=DirectiveAuthorizationGuard` and confirm all tests pass with 0 failures.
- [ ] Run `npm run lint` and confirm no lint errors.
- [ ] Run `npm run build` and confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Update `docs/security/directive-authorization.md` (create if absent) explaining the authorization flow: session token validation → audit log → orchestrator mutation.
- [ ] Update `docs/architecture/mcp-server.md` to document that all `inject_directive` calls require a valid session context.
- [ ] Add a `CHANGELOG.md` entry: `feat(security): Directive Injection Authorization Guard — all mid-task directives validated against authenticated session [REQ-SEC-SD-024]`.
- [ ] Update agent memory `memory/security-decisions.md`: record that directive injection requires an authenticated `sessionId` and that all attempts are audit-logged.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern=DirectiveAuthorizationGuard --coverage` and assert coverage for `src/security/DirectiveAuthorizationGuard.ts` is ≥ 90%.
- [ ] Run `grep -rn "injectDirective\|inject_directive" src/mcp/ --include="*.ts"` and confirm every match is preceded by (or internally calls) `DirectiveAuthorizationGuard.authorize`.
- [ ] Run the integration test with a forged session ID and assert the orchestrator DB state is unchanged after the unauthorized directive attempt.
