# Task: Provider Handoff Continuity Integration (Sub-Epic: 12_Model Failover and Provider Handling)

## Covered Requirements
- [8_RISKS-REQ-081], [8_RISKS-REQ-082]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/ProviderHandoff.integration.test.ts`, write end-to-end integration tests (using `nock` for HTTP mocking) covering:
  - A full task execution where Gemini fails with HTTP 429, causing `FailoverManager` to switch to Claude. Verify that:
    - A `HandoffContext` is serialized (to an in-memory store) before the switch.
    - The `HandoffContext` passed to Claude contains the correct `threadId`, `taskId`, `previousProvider: 'gemini-3-pro'`, and a non-empty `reasoningSummary`.
    - Claude receives the deserialized context in its prompt as a "## Handoff Context" section.
  - A full task execution where both Gemini and Claude fail, causing failover to GPT-4o, and the `HandoffContext` chains: `previousProvider` is `'claude-3.5-sonnet'` for the GPT-4o call.
  - After a successful handoff to a fallback provider, the returned `LLMResponse` contains `{ provider: 'claude-3.5-sonnet', handoffOccurred: true, handoffCount: 1 }` metadata.
  - If no handoff occurs, `handoffOccurred` is `false` and `handoffCount` is `0`.
- [ ] In `src/llm/__tests__/ProviderHandoff.persistence.test.ts`, test that `HandoffContext` is persisted to SQLite (`state.db`) via `HandoffStore` so it survives process restarts:
  - Insert a `HandoffContext`, kill/restart the in-memory store, reload from DB, and assert deep equality.

## 2. Task Implementation
- [ ] Create `src/llm/LLMClient.ts` (or extend existing) as the main entry point that composes `ProviderRegistry`, `FailoverManager`, and `HandoffSerializer`:
  - `async chat(request: LLMRequest): Promise<LLMResponse>`:
    - Calls `FailoverManager.executeWithFailover(provider => callProvider(provider, request))`.
    - On each `'provider:switch'` event from `FailoverManager`: captures current reasoning summary (from `request.messages` last assistant turn), builds a `HandoffContext`, serializes it, persists via `HandoffStore`, then injects the serialized Markdown into the next provider call's system prompt under a `## Handoff Context` heading.
  - `LLMRequest` interface: `{ taskId: string; threadId: string; messages: ChatMessage[]; }`.
  - `LLMResponse` interface: `{ content: string; provider: string; handoffOccurred: boolean; handoffCount: number; }`.
- [ ] Create `src/llm/HandoffStore.ts`:
  - `save(context: HandoffContext): Promise<void>` — upserts into `handoff_contexts` table keyed by `(threadId, taskId)`.
  - `load(threadId: string, taskId: string): Promise<HandoffContext | null>`.
  - `createTable()` migration: `CREATE TABLE IF NOT EXISTS handoff_contexts (thread_id TEXT, task_id TEXT, serialized_markdown TEXT, created_at TEXT, PRIMARY KEY (thread_id, task_id))`.
- [ ] Create `src/llm/callProvider.ts` implementing per-provider HTTP calls (Gemini/Anthropic/OpenAI SDKs), mapping SDK errors to the typed error classes from `errors.ts`.

## 3. Code Review
- [ ] Verify that the `## Handoff Context` block is injected as a system message (not a user message) to avoid polluting the conversation history visible to the model.
- [ ] Confirm that `HandoffStore.save` is called before the HTTP request to the new provider (not after), so context is durable even if the new provider call also fails.
- [ ] Check that `handoffCount` increments monotonically and that `LLMResponse.provider` always reflects the provider that actually returned the successful response.
- [ ] Ensure `callProvider` maps HTTP 429, 401, and 503 to the exact typed errors used by `FailoverManager`'s switch logic.
- [ ] Validate that `LLMClient` has no direct dependency on SQLite — it depends on `HandoffStore` interface only (dependency inversion).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/ProviderHandoff"` and confirm all integration and persistence tests pass.
- [ ] Run `npm run lint -- src/llm/` with 0 errors.
- [ ] Run `npm run typecheck` with 0 errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/llm-providers.md` with a "Handoff Flow" sequence diagram (Mermaid) showing: request → Gemini fail → serialize context → persist → inject into Claude → success → response with metadata.
- [ ] Update `docs/database-schema.md` with the `handoff_contexts` table definition.
- [ ] Add changelog entry: `feat(llm): integrate FailoverManager + HandoffSerializer into LLMClient with SQLite-backed HandoffStore`.

## 6. Automated Verification
- [ ] Run the full integration test suite: `npm test -- --testPathPattern="ProviderHandoff" --forceExit` and assert exit code 0.
- [ ] Verify the `handoff_contexts` table is created in a test SQLite DB by running `sqlite3 /tmp/test-state.db ".schema handoff_contexts"` within the test setup and confirming the schema matches the migration definition.
