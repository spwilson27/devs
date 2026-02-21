# Task: Implement User Fix DNA Encoding into LanceDB as USER_PREFERENCE (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [8_RISKS-REQ-077]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/dna-encoding.test.ts` with the following test cases:
  - `DnaEncoder.encodeUserFix(fix)` calls the `text-embedding-004` embedding model with the concatenated text of `fix.description + ' ' + fix.code_diff` and receives a vector of length 768.
  - `DnaEncoder.encodeUserFix(fix)` writes a record to LanceDB table `user_preferences` with fields: `id` (UUID), `type` (`'USER_PREFERENCE'`), `task_id`, `description`, `code_diff`, `vector` (Float32Array length 768), `created_at` (ISO-8601).
  - `DnaEncoder.encodeUserFix(fix)` also stores the returned `lancedb_vector_id` back in the `directive_history` row identified by `fix.directive_history_id` (calls `DirectiveHistoryService.setVectorId(id, vectorId)`).
  - When the embedding model call fails (simulated rejection), `DnaEncoder.encodeUserFix(fix)` throws a `DnaEncodingError` wrapping the original error.
  - When the LanceDB write fails, `DnaEncoder.encodeUserFix(fix)` throws a `DnaEncodingError`.
  - Mock `text-embedding-004` via a Jest mock of `@google-cloud/vertexai` or the project's `EmbeddingClient` abstraction — no real API calls.
  - Mock LanceDB using the project's existing in-memory LanceDB test helper.

## 2. Task Implementation
- [ ] Define the `UserFix` input type in `packages/memory/src/types/dna.ts`:
  ```ts
  export interface UserFix {
    directive_history_id: string; // FK to directive_history.id
    task_id: string;
    description: string;          // Human-readable summary of what the user fixed
    code_diff: string;            // Unified diff string of the manual change
  }
  ```
- [ ] Create `packages/memory/src/services/DnaEncoder.ts`:
  - Constructor accepts `EmbeddingClient` (project abstraction over `text-embedding-004`) and a `LanceDBConnection` instance (project abstraction, already used by `VectorStore` from phase 4's LanceDB integration).
  - `async encodeUserFix(fix: UserFix): Promise<string>` — returns the `lancedb_vector_id` of the inserted record.
  - Concatenates `fix.description + '\n\n' + fix.code_diff` as the text to embed.
  - Inserts into the `user_preferences` LanceDB table using the project's `VectorStore.add()` method with `{ type: 'USER_PREFERENCE', ...metadata }`.
  - Calls `DirectiveHistoryService.setVectorId(fix.directive_history_id, vectorId)` to link the vector back.
  - Wraps all errors in `DnaEncodingError`.
- [ ] Create `packages/memory/src/errors/DnaEncodingError.ts`:
  ```ts
  export class DnaEncodingError extends Error {
    constructor(message: string, public readonly cause: unknown) {
      super(message);
      this.name = 'DnaEncodingError';
    }
  }
  ```
- [ ] Define the LanceDB `user_preferences` table schema in `packages/memory/src/vector/schemas.ts` (or the existing schema file):
  ```ts
  export const USER_PREFERENCES_SCHEMA = {
    tableName: 'user_preferences',
    fields: ['id', 'type', 'task_id', 'description', 'code_diff', 'created_at'],
    vectorDimension: 768,
  };
  ```
- [ ] Export `DnaEncoder`, `DnaEncodingError`, `UserFix`, and `USER_PREFERENCES_SCHEMA` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm that `DnaEncoder` does NOT directly instantiate `EmbeddingClient` or `LanceDBConnection`; both are injected (DI pattern).
- [ ] Confirm the embedded text is `description + '\n\n' + code_diff` (not just one field) to ensure both the intent and the change are captured in the vector.
- [ ] Confirm the `user_preferences` table insert uses the shared `VectorStore.add()` method rather than a direct LanceDB API call, to maintain a single insertion code path.
- [ ] Confirm `DnaEncodingError` wraps the original `cause` and does not swallow the stack trace.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="dna-encoding"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Add `## DNA Encoding (USER_PREFERENCE)` section to `packages/memory/AGENT.md` describing: the `UserFix` input shape, the LanceDB table written to, and the linking back to `directive_history`.
- [ ] Update `packages/memory/src/vector/schemas.ts` inline comments to describe the `user_preferences` table fields.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="dna-encoding"` and confirm exit code 0 with branch coverage ≥ 90% for `DnaEncoder.ts`.
- [ ] Run `pnpm tsc --noEmit --project packages/memory/tsconfig.json` and confirm zero TypeScript errors.
