# Task: Implement Partial Completion Resume Protocol for LLM Token-Limit Mid-Envelope Truncation (Sub-Epic: 10_Retry and Tool Error Protocol)

## Covered Requirements
- [3_MCP-TAS-072]

## 1. Initial Test Written

- [ ] Create `src/orchestrator/__tests__/partialCompletionResumeProtocol.test.ts`. Import `PartialCompletionResumeProtocol` from `src/orchestrator/partialCompletionResumeProtocol.ts`.
- [ ] Write a unit test for `PartialCompletionResumeProtocol.detectTruncation(raw: string): TruncationDetectionResult`: given a raw JSON string that is syntactically incomplete (e.g., `'{"action":"write_file","parameters":{"path":"/src/foo.ts","content":"line1\nline'`), assert `{ truncated: true, lastValidToken: string, truncationIndex: number }` is returned.
- [ ] Write a unit test for `detectTruncation`: given a complete, valid JSON string, assert `{ truncated: false }` is returned.
- [ ] Write a unit test for `PartialCompletionResumeProtocol.buildResumePrompt(lastValidToken: string): string`: assert the returned prompt string contains the exact value of `lastValidToken` and the instruction `"Continue the JSON payload from the last valid token. Output ONLY the remaining JSON. Do not repeat any content before the last valid token."`.
- [ ] Write a unit test for `PartialCompletionResumeProtocol.mergeChunks(initial: string, continuation: string): string`: given a truncated initial chunk and a valid continuation, assert the merged result is a complete, parseable JSON object equal to the intended full payload.
- [ ] Write a unit test: given a mock `llmClient` where the first call returns a truncated JSON, and the second call (resume prompt) returns the valid continuation, assert `PartialCompletionResumeProtocol.resumeIfTruncated(llmClient, rawResponse)` returns the fully merged, valid `AgentResponse`.
- [ ] Write a unit test: given a mock `llmClient` that returns a truncated continuation (second call also truncated), assert the method attempts to resume a second time, and if the merged result is still invalid, throws `PartialCompletionResumeExhaustedError`.
- [ ] Write an integration test in `src/orchestrator/__tests__/partialCompletionResumeProtocol.integration.test.ts`: wire into the `AgentLoop` with a mocked LLM returning a truncated response. Confirm the orchestrator transparently resumes, and the `partial_completion_log` SQLite table records `{ task_id, turn_number, truncation_index, resume_attempts, final_status }`.
- [ ] Write a test that truncation detection DOES NOT trigger `MalformedResponseHandler`'s Formatting Correction flow — the two protocols must be invoked in the correct order (truncation resume first, then schema validation on the merged result).

## 2. Task Implementation

- [ ] Create `src/orchestrator/partialCompletionResumeProtocol.ts`. Export `PartialCompletionResumeProtocol` with:
  - `static detectTruncation(raw: string): TruncationDetectionResult` — attempts to parse the raw string; on `SyntaxError`, use a JSON streaming parser (e.g., `jsonparse` or manual bracket counting) to find the last valid token boundary.
  - `static buildResumePrompt(lastValidToken: string): string` — constructs the continuation prompt.
  - `static mergeChunks(initial: string, continuation: string): string` — concatenates `initial + continuation` and validates the result is parseable JSON.
  - `static async resumeIfTruncated(llmClient: LLMClient, raw: string, maxResumeAttempts: number = 2): Promise<string>` — orchestrates detection, prompting, and merging.
- [ ] Define `TruncationDetectionResult` as: `{ truncated: true; lastValidToken: string; truncationIndex: number } | { truncated: false }`.
- [ ] Implement `detectTruncation` using bracket/quote depth tracking: iterate over the raw string character-by-character, maintaining a depth counter for `{`, `[`, `"` (with escape handling). The last position where all opened brackets are balanced = `truncationIndex`.
- [ ] Export `PartialCompletionResumeExhaustedError` (extends `Error`) with fields: `attempts: number`, `mergedRaw: string`.
- [ ] Add a SQLite migration (e.g., `migrations/017_partial_completion_log.sql`) creating `partial_completion_log` with columns: `id INTEGER PRIMARY KEY`, `task_id TEXT NOT NULL`, `turn_number INTEGER NOT NULL`, `truncation_index INTEGER`, `initial_chunk_length INTEGER`, `resume_attempts INTEGER DEFAULT 0`, `final_status TEXT NOT NULL CHECK(final_status IN ('RESOLVED','EXHAUSTED'))`, `timestamp TEXT NOT NULL DEFAULT (datetime('now'))`.
- [ ] In `src/orchestrator/agentLoop.ts`, after receiving the raw LLM response and BEFORE calling `MalformedResponseHandler.validate`, call `PartialCompletionResumeProtocol.resumeIfTruncated(llmClient, raw)`. Use the returned (potentially merged) string as input to `MalformedResponseHandler`. Log resume attempts to `partial_completion_log`.
- [ ] On `PartialCompletionResumeExhaustedError`, escalate to `MalformedResponseHandler.correctWithRetry` as a fallback (the merged-but-invalid payload may still be recoverable via a Formatting Correction turn).

## 3. Code Review

- [ ] Verify `detectTruncation` handles edge cases: empty string, string with only `{`, deeply nested JSON, JSON with escaped quotes in string values.
- [ ] Confirm `mergeChunks` does not blindly concatenate — it must validate the merged result is parseable before returning, and throw `TypeError` if the merged result is still invalid JSON.
- [ ] Verify `buildResumePrompt` does NOT include the full initial chunk in the prompt (only the `lastValidToken` substring) to minimize token usage.
- [ ] Confirm `maxResumeAttempts` is a named constant `MAX_RESUME_ATTEMPTS = 2` in `src/orchestrator/constants.ts`.
- [ ] Verify the ordering in `agentLoop.ts`: truncation resume → schema validation → formatting correction. This ordering must be documented inline with a comment referencing the three requirement IDs: `[3_MCP-TAS-072]`, `[3_MCP-TAS-071]`, `[3_MCP-TAS-071]`.
- [ ] Confirm `partial_completion_log` migration is idempotent.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/orchestrator/__tests__/partialCompletionResumeProtocol.test.ts --coverage` and confirm all unit tests pass with 100% branch coverage on `PartialCompletionResumeProtocol`.
- [ ] Run `npx jest src/orchestrator/__tests__/partialCompletionResumeProtocol.integration.test.ts` and confirm integration tests pass.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors.
- [ ] Run `npx jest --passWithNoTests` to confirm no regressions in the full suite.

## 5. Update Documentation

- [ ] Create `src/orchestrator/partialCompletionResumeProtocol.agent.md` documenting: how truncation is detected (bracket depth tracking), the resume prompt strategy (only last valid token), the merge validation step, the escalation path on `EXHAUSTED`, and the `partial_completion_log` schema.
- [ ] Update `src/orchestrator/agentLoop.agent.md` to document the three-stage response processing pipeline: `[3_MCP-TAS-072] truncation resume → [3_MCP-TAS-071] schema validation → [3_MCP-TAS-071] formatting correction`.
- [ ] Add `MAX_RESUME_ATTEMPTS = 2` to the project-wide constants documentation.
- [ ] Note in `docs/phase_13_progress.md` that the full token-limit recovery pipeline is now implemented.

## 6. Automated Verification

- [ ] Run `npx jest --testPathPattern="partialCompletionResumeProtocol" --json --outputFile=/tmp/partial_results.json && node -e "const r=require('/tmp/partial_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Verify truncation detection: `npx ts-node -e "import { PartialCompletionResumeProtocol as P } from './src/orchestrator/partialCompletionResumeProtocol'; const r=P.detectTruncation('{\"a\":\"incomplete'); console.assert(r.truncated===true);"`.
- [ ] Verify non-truncation: `npx ts-node -e "import { PartialCompletionResumeProtocol as P } from './src/orchestrator/partialCompletionResumeProtocol'; const r=P.detectTruncation('{\"a\":\"complete\"}'); console.assert(r.truncated===false);"`.
- [ ] Run migration and verify: `sqlite3 /tmp/test.db '.read migrations/017_partial_completion_log.sql' && sqlite3 /tmp/test.db "PRAGMA table_info(partial_completion_log);" | grep -c "truncation_index"` asserts `1`.
- [ ] Run `npx tsc --noEmit 2>&1 | grep -c "ERROR"` and assert `0`.
