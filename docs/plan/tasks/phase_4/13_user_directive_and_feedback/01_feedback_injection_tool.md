# Task: Implement Feedback Injection Tool for Long-Term Memory (Sub-Epic: 13_User_Directive_and_Feedback)

## Covered Requirements
- [4_USER_FEATURES-REQ-072]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/feedbackInjection.test.ts`, write unit tests for a `FeedbackInjectionService` class:
  - Test `injectFeedback(projectId: string, feedbackText: string): Promise<void>`:
    - Assert that `feedbackText` is embedded using `text-embedding-004` (mock the embedding client).
    - Assert the resulting vector record is written to LanceDB with `type: "user_feedback"`, `projectId`, `timestamp`, and `content` fields.
    - Assert that duplicate feedback (same content within 60 seconds) is deduplicated and not re-inserted.
    - Assert that an empty or whitespace-only `feedbackText` throws a `ValidationError`.
  - Write integration tests in `packages/memory/src/__tests__/feedbackInjection.integration.test.ts`:
    - Spin up a temporary LanceDB store (`.devs/test_memory.lancedb`).
    - Inject 3 distinct feedback entries and assert all 3 are retrievable via a semantic search query.
    - Assert records contain correct metadata fields.

## 2. Task Implementation
- [ ] Create `packages/memory/src/feedbackInjection.ts` exporting `FeedbackInjectionService`:
  - Constructor accepts: `{ lanceDbPath: string; embeddingClient: EmbeddingClient; tableName?: string }`.
  - `injectFeedback(projectId, feedbackText)`:
    1. Validate `feedbackText` is non-empty; throw `ValidationError` if not.
    2. Compute embedding via `embeddingClient.embed(feedbackText)` (uses `text-embedding-004`).
    3. Open or create the `user_feedback` table in LanceDB with schema `{ id: string, projectId: string, content: string, vector: Float32Array, type: "user_feedback", timestamp: number }`.
    4. Check for duplicates: query the table for records with matching `projectId` and `content` within the last 60 seconds; skip insert if found.
    5. Insert the new record.
- [ ] Export `FeedbackInjectionService` from `packages/memory/src/index.ts`.
- [ ] Add a CLI command `devs feedback "<message>"` in `packages/cli/src/commands/feedback.ts` that:
  - Reads the active `projectId` from `.devs/project.json`.
  - Instantiates `FeedbackInjectionService` with the project's LanceDB path.
  - Calls `injectFeedback` with the provided message.
  - Prints confirmation: `Feedback injected into long-term memory.`
- [ ] Register the `feedback` command in `packages/cli/src/index.ts`.
- [ ] Add a VSCode Extension command `devs.injectFeedback` in `packages/vscode-extension/src/commands/feedback.ts` that:
  - Opens an input box prompt: `Enter global feedback for the current project:`.
  - Calls `FeedbackInjectionService.injectFeedback` on submit.
  - Shows an information message on success.
- [ ] Define `ValidationError` in `packages/memory/src/errors.ts` if not already present.

## 3. Code Review
- [ ] Verify `FeedbackInjectionService` depends only on interfaces (`EmbeddingClient`, LanceDB adapter), not concrete implementations — dependency injection pattern must be used.
- [ ] Verify the deduplication check uses a time-bounded query (not a full table scan) to avoid performance degradation as the table grows.
- [ ] Verify the LanceDB table schema is declared in a single shared schema constant (not inline), so it can be reused by other services.
- [ ] Verify no secrets or API keys are hardcoded; embedding client configuration comes from environment/config.
- [ ] Verify error messages are descriptive and do not expose internal paths.
- [ ] Verify the CLI command is registered with `--help` documentation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` and confirm all unit and integration tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/cli test` and confirm the `feedback` command tests pass.
- [ ] Run `pnpm --filter @devs/vscode-extension test` and confirm the `devs.injectFeedback` command tests pass.
- [ ] Run `pnpm lint` and confirm no linting errors.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` with a section "Feedback Injection" describing `FeedbackInjectionService` API, constructor parameters, and usage example.
- [ ] Update `docs/user-guide/feedback.md` (create if absent) with end-user instructions for the `devs feedback` CLI command and VSCode UI.
- [ ] Update agent memory file `.devs/memory/decisions.md` with entry: `[4_USER_FEATURES-REQ-072] Implemented FeedbackInjectionService; user feedback is embedded with text-embedding-004 and stored in LanceDB under type=user_feedback with deduplication within 60s window.`

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --coverage` and assert line coverage for `feedbackInjection.ts` is ≥ 90%.
- [ ] Execute the integration test script `scripts/verify_feedback_injection.sh` which:
  1. Invokes `devs feedback "Test global preference: use functional programming"` against a test project.
  2. Queries LanceDB directly and asserts a record with `type=user_feedback` and matching content exists.
  3. Exits with code 0 on success, non-zero on failure.
- [ ] Assert CI pipeline (`pnpm ci`) exits with code 0.
