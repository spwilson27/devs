# Task: Implement Malformed Response JSON Schema Validator with Formatting Correction Turn (Sub-Epic: 10_Retry and Tool Error Protocol)

## Covered Requirements
- [3_MCP-TAS-071]

## 1. Initial Test Written

- [ ] Create `src/orchestrator/__tests__/malformedResponseHandler.test.ts`. Import `MalformedResponseHandler` from `src/orchestrator/malformedResponseHandler.ts`.
- [ ] Write a unit test: given a valid JSON string conforming to the `AgentResponse` schema, assert `MalformedResponseHandler.validate(raw)` returns `{ valid: true, parsed: AgentResponse }`.
- [ ] Write a unit test: given a raw string that is syntactically invalid JSON (e.g., `"{ action: 'write_file' }"`), assert `MalformedResponseHandler.validate(raw)` returns `{ valid: false, error: 'INVALID_JSON', raw }`.
- [ ] Write a unit test: given a syntactically valid JSON string that fails the `AgentResponse` JSON schema (e.g., missing required field `action`), assert `MalformedResponseHandler.validate(raw)` returns `{ valid: false, error: 'SCHEMA_VIOLATION', violations: string[], raw }`.
- [ ] Write a unit test for `MalformedResponseHandler.correctWithRetry(llmClient, rawResponse, maxRetries=2)`: given a mock `llmClient` that returns invalid JSON on the first call and valid JSON on the second call, assert the method returns the valid parsed response and the LLM was called exactly twice (initial correction turn + 1 retry).
- [ ] Write a unit test: given a mock `llmClient` that always returns invalid JSON, assert `correctWithRetry` throws `FormattingCorrectionExhaustedError` after exactly 3 total LLM calls (initial + 2 retries).
- [ ] Write a unit test confirming the "Formatting Correction" prompt injected into the LLM contains the original raw response, the schema violation details, and explicit instructions to output only valid JSON.
- [ ] Write an integration test in `src/orchestrator/__tests__/malformedResponseHandler.integration.test.ts`: wire `MalformedResponseHandler` into the `AgentLoop`. Mock the LLM to return invalid JSON twice, then valid JSON on the third attempt. Assert the orchestrator continues normally, and the `agent_response_log` SQLite table records all three attempts with `status` of `MALFORMED`, `MALFORMED`, and `SUCCESS`.
- [ ] Write an integration test: if `correctWithRetry` exhausts retries (3 invalid responses), assert the orchestrator emits `HUMAN_INTERVENTION_REQUIRED` event with `reason: 'FORMATTING_CORRECTION_EXHAUSTED'` and halts.

## 2. Task Implementation

- [ ] Create `src/orchestrator/malformedResponseHandler.ts`. Export `MalformedResponseHandler` with:
  - `static validate(raw: string): ValidationResult` — parses JSON and validates against `AgentResponseSchema` (using AJV or Zod).
  - `static async correctWithRetry(llmClient: LLMClient, raw: string, maxRetries: number = 2): Promise<AgentResponse>` — issues a "Formatting Correction" turn and retries up to `maxRetries` times.
- [ ] Define `ValidationResult` as a discriminated union: `{ valid: true; parsed: AgentResponse } | { valid: false; error: 'INVALID_JSON' | 'SCHEMA_VIOLATION'; violations?: string[]; raw: string }`.
- [ ] Define `AgentResponseSchema` using the project's existing Zod schema library (or AJV JSON schema). The schema must enforce: `action: string` (required), `parameters: object` (required), `reasoning: string` (optional). Place schema at `src/orchestrator/schemas/agentResponse.schema.ts`.
- [ ] Implement the "Formatting Correction" prompt template in `src/orchestrator/prompts/formattingCorrectionPrompt.ts`. The prompt must include: `{original_raw_response}` placeholder, `{schema_violations}` placeholder, and a directive: `"Return ONLY a valid JSON object conforming to the schema. Do not include markdown fences or prose."`.
- [ ] Export `FormattingCorrectionExhaustedError` (extends `Error`) with fields: `attempts: number`, `lastRaw: string`, `violations: string[]`.
- [ ] Add a SQLite migration (e.g., `migrations/016_agent_response_log.sql`) creating `agent_response_log` with columns: `id INTEGER PRIMARY KEY`, `task_id TEXT NOT NULL`, `turn_number INTEGER NOT NULL`, `raw_response TEXT`, `status TEXT NOT NULL CHECK(status IN ('SUCCESS','MALFORMED','SCHEMA_VIOLATION'))`, `violations TEXT` (JSON array), `correction_attempt INTEGER DEFAULT 0`, `timestamp TEXT NOT NULL DEFAULT (datetime('now'))`.
- [ ] In `src/orchestrator/agentLoop.ts`, after receiving each LLM response, call `MalformedResponseHandler.validate(raw)`. On failure, call `correctWithRetry`. On `FormattingCorrectionExhaustedError`, emit `HUMAN_INTERVENTION_REQUIRED` via `EventBus`. Log every attempt to `agent_response_log` via `DatabaseService`.
- [ ] Ensure `MalformedResponseHandler` never calls `process.exit()` or uses `console.*` directly.

## 3. Code Review

- [ ] Verify `AgentResponseSchema` covers all fields the orchestrator actually reads from the agent response — no undocumented fields silently pass validation.
- [ ] Confirm the Formatting Correction prompt does NOT include any content from the previous LLM reasoning trace (only the raw invalid output and schema errors) to minimize token waste.
- [ ] Verify `FormattingCorrectionExhaustedError` carries enough info for `HumanInTheLoopManager` to display a useful message to the user.
- [ ] Confirm `agent_response_log` migration is idempotent.
- [ ] Verify `correctWithRetry` correctly increments `correction_attempt` counter in the DB log on each retry.
- [ ] Ensure the `maxRetries` default of 2 is defined as a named constant `MAX_FORMATTING_RETRIES = 2` in `src/orchestrator/constants.ts` rather than hard-coded.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/orchestrator/__tests__/malformedResponseHandler.test.ts --coverage` and confirm all unit tests pass with 100% branch coverage.
- [ ] Run `npx jest src/orchestrator/__tests__/malformedResponseHandler.integration.test.ts` and confirm integration tests pass.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript type errors.
- [ ] Run `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation

- [ ] Create `src/orchestrator/malformedResponseHandler.agent.md` documenting: the validation pipeline (JSON parse → schema check), the 2-retry Formatting Correction turn, the `FormattingCorrectionExhaustedError` escalation path, and the `agent_response_log` schema.
- [ ] Create `src/orchestrator/schemas/agentResponse.schema.agent.md` documenting the required and optional fields in `AgentResponseSchema` with examples.
- [ ] Update `src/orchestrator/agentLoop.agent.md` to note that every LLM response is validated through `MalformedResponseHandler` before processing.
- [ ] Add `MAX_FORMATTING_RETRIES = 2` to the project-wide constants documentation.

## 6. Automated Verification

- [ ] Run `npx jest --testPathPattern="malformedResponseHandler" --json --outputFile=/tmp/malformed_results.json && node -e "const r=require('/tmp/malformed_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Verify schema is enforced: `npx ts-node -e "import { MalformedResponseHandler } from './src/orchestrator/malformedResponseHandler'; const r=MalformedResponseHandler.validate('{\"bad\":true}'); console.assert(!r.valid);"`.
- [ ] Run migration and verify: `sqlite3 /tmp/test.db '.read migrations/016_agent_response_log.sql' && sqlite3 /tmp/test.db "PRAGMA table_info(agent_response_log);" | grep -c "correction_attempt"` asserts `1`.
- [ ] Run `npx tsc --noEmit 2>&1 | grep -c "ERROR"` and assert `0`.
