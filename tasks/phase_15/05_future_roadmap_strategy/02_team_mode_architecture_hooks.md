# Task: Design and Implement Team Mode Architectural Hooks (Sub-Epic: 05_Future Roadmap Strategy)

## Covered Requirements
- [9_ROADMAP-FUTURE-002]

## 1. Initial Test Written
- [ ] In `src/session/__tests__/session_context.test.ts`, write unit tests for a `SessionContext` model:
  - Test that `SessionContext.create({ ownerId: string })` creates a session with `mode: 'single-user'` and a single `members` array containing only the `ownerId`.
  - Test that `SessionContext.toJSON()` produces an object with `id`, `ownerId`, `mode`, `members`, and `createdAt` fields.
  - Test that calling `session.addMember(userId)` on a `single-user` session throws a `TeamModeNotEnabledError` with the message `"Team Mode is not yet supported. See FUTURE_ROADMAP.md (9_ROADMAP-FUTURE-002)."`.
  - Test that `SessionContextSchema` (Zod) correctly validates the shape and rejects sessions with `mode: 'team'` with a descriptive error: `"Team mode is reserved for a future release."`.
- [ ] In `src/state/__tests__/state_store.test.ts`, write integration tests verifying the `StateStore` correctly persists and retrieves a `SessionContext` by ID from SQLite.

## 2. Task Implementation
- [ ] Create `src/session/types.ts` with:
  - `SessionMode` type: `'single-user'` only (not `'team'`, which is explicitly excluded via Zod `.refine()` with the error message above).
  - `SessionContextSchema` Zod schema: `{ id: z.string().uuid(), ownerId: z.string(), mode: z.literal('single-user'), members: z.array(z.string()).min(1).max(1), createdAt: z.string().datetime() }`.
  - `TeamModeNotEnabledError extends Error`.
- [ ] Create `src/session/session_context.ts` implementing the `SessionContext` class:
  - `static create(opts: { ownerId: string }): SessionContext` — initializes with `mode: 'single-user'`, `members: [opts.ownerId]`, `id: uuidv4()`, `createdAt: new Date().toISOString()`.
  - `addMember(userId: string): void` — always throws `TeamModeNotEnabledError`. Add JSDoc: `/** Future hook for 9_ROADMAP-FUTURE-002: Team Mode. */`
  - `toJSON(): SessionContextJSON` — returns a plain object matching the Zod schema.
- [ ] Add a `sessions` table migration in `src/db/migrations/` (e.g., `0010_add_sessions_table.sql`):
  ```sql
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'single-user',
    members_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  ```
- [ ] Update `src/state/state_store.ts` to add `saveSession(ctx: SessionContext)` and `getSession(id: string): SessionContext | null` methods using the new table.
- [ ] Export `SessionContext`, `SessionContextSchema`, and `TeamModeNotEnabledError` from `src/session/index.ts`.

## 3. Code Review
- [ ] Verify the `SessionContextSchema` Zod schema uses `z.literal('single-user')` (not `z.enum(['single-user', 'team'])`) so `'team'` is not a valid value in the current type system. This is a deliberate constraint.
- [ ] Verify `addMember` contains ONLY the `TeamModeNotEnabledError` throw and JSDoc annotation—no partial implementation.
- [ ] Verify the DB migration file follows the existing naming convention in `src/db/migrations/`.
- [ ] Verify `StateStore` methods `saveSession` and `getSession` use parameterized queries (no string interpolation) to prevent SQL injection.
- [ ] Verify `members_json` is stored as a JSON string and correctly round-trips through `JSON.parse`/`JSON.stringify`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/session/__tests__/session_context.test.ts"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/state_store.test.ts"` and confirm all tests pass.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/session/session.agent.md` documenting: the `SessionContext` model, the `single-user` constraint, how to query sessions from the DB, and a prominent `## Future: Team Mode (9_ROADMAP-FUTURE-002)` section explaining what `addMember` will do when implemented and what schema changes will be needed.
- [ ] Add a `## Future: Team Mode (9_ROADMAP-FUTURE-002)` section to `docs/FUTURE_ROADMAP.md` describing: the `SessionContext.addMember` hook, the existing `sessions` DB table structure, what changes are needed to enable `mode: 'team'` (e.g., WebSocket session bus, shared lock primitives, conflict resolution strategy).

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/session/__tests__/session_context.test.ts" --json --outputFile=test-results/session-context.json` and verify `numFailedTests === 0`.
- [ ] Run `node -e "const {SessionContextSchema} = require('./dist/session'); const r = SessionContextSchema.safeParse({id:'x',ownerId:'y',mode:'team',members:['y'],createdAt:new Date().toISOString()}); process.exit(r.success ? 1 : 0);"` and confirm exit code `0` (schema correctly rejects `'team'` mode).
