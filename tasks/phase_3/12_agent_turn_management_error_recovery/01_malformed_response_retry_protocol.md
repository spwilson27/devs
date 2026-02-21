# Task: Malformed Response Retry Protocol (Sub-Epic: 12_Agent Turn Management & Error Recovery)

## Covered Requirements
- [3_MCP-TAS-071]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/malformed-response-retry.test.ts`, write unit tests covering:
  - `MalformedResponseHandler.handle()` returns a `FormattingCorrectionTurn` when given a response that fails JSON.parse.
  - `MalformedResponseHandler.handle()` returns a `FormattingCorrectionTurn` when JSON parses but `SAOPEnvelopeSchema.safeParse()` fails.
  - After exactly 2 retries have been exhausted, `MalformedResponseHandler.handle()` throws (or resolves with) a `MaxRetriesExceededError` with `{ attempts: 2, lastError: <ZodError | SyntaxError> }`.
  - A valid SAOP envelope on the first or second retry short-circuits further retries and resolves with the parsed envelope.
  - The `FormattingCorrectionTurn` injected prompt contains the original raw response string and the specific validation errors.
- [ ] Write integration tests in `packages/core/src/__tests__/orchestrator-malformed.integration.test.ts`:
  - Stub the LLM client to return invalid JSON on call 1, invalid-schema JSON on call 2, then a valid envelope on call 3 — verify the orchestrator recovers transparently.
  - Stub the LLM client to return invalid JSON three times — verify `MaxRetriesExceededError` is surfaced and the run enters the `USER_ESCALATION` state.

## 2. Task Implementation
- [ ] Create `packages/core/src/protocol/malformed-response-handler.ts`:
  - Export class `MalformedResponseHandler` with constructor accepting `{ maxRetries: number; llmClient: ILlmClient; logger: ILogger }`.
  - Implement `async handle(rawResponse: string, envelope: SAOP_Envelope | null, turnContext: TurnContext): Promise<SAOP_Envelope>`:
    1. Attempt `JSON.parse(rawResponse)`; on `SyntaxError` record error and increment retry counter.
    2. Attempt `SAOPEnvelopeSchema.safeParse(parsed)`; on failure record Zod errors and increment retry counter.
    3. If `retries >= maxRetries`, throw `new MaxRetriesExceededError({ attempts: retries, lastError })`.
    4. Construct a `FormattingCorrectionTurn` message: `"Your previous response was not valid SAOP JSON. Errors: <errors>. Please restate your complete response starting from '{'."`
    5. Call `llmClient.complete(correctionPrompt)` and recurse.
  - Export class `MaxRetriesExceededError extends Error` with fields `attempts: number` and `lastError: unknown`.
- [ ] Register `MalformedResponseHandler` in the DI container in `packages/core/src/container.ts` with `maxRetries: 2` from config.
- [ ] In `packages/core/src/orchestrator/turn-executor.ts`, wrap the raw LLM response through `MalformedResponseHandler.handle()` before any further processing.
- [ ] Emit a structured log event `{ event: 'MALFORMED_RESPONSE', attempt, errors }` via the injected `ILogger` on each retry.
- [ ] Add `REQ: 3_MCP-TAS-071` comment above the retry loop logic.

## 3. Code Review
- [ ] Verify `MalformedResponseHandler` is stateless per invocation (retry counter scoped to a single `handle()` call, not the class instance).
- [ ] Confirm no raw `console.log` calls — all output goes through the injected `ILogger`.
- [ ] Verify `FormattingCorrectionTurn` prompt includes both the raw response and the structured validation errors to give the LLM maximum context.
- [ ] Ensure `MaxRetriesExceededError` extends `Error` properly (calls `super(message)`, sets `this.name`).
- [ ] Confirm the integration point in `turn-executor.ts` does not swallow `MaxRetriesExceededError` — it must propagate to the orchestrator's state machine.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="malformed-response-retry|orchestrator-malformed"` and confirm all tests pass with zero failures.
- [ ] Run the full core test suite `pnpm --filter @devs/core test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/protocol/malformed-response-handler.agent.md` documenting:
  - Purpose, retry logic (max 2), escalation behavior.
  - The `FormattingCorrectionTurn` prompt template.
  - Introspection points: log event `MALFORMED_RESPONSE`.
- [ ] Append to `packages/core/src/protocol/index.agent.md` an entry for `MalformedResponseHandler` and `MaxRetriesExceededError`.
- [ ] Update `docs/architecture/error-recovery.md` with a section on malformed-response handling.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `malformed-response-handler.ts` has ≥ 90% branch coverage (fail CI if below).
- [ ] Run `grep -r "REQ: 3_MCP-TAS-071" packages/core/src/protocol/malformed-response-handler.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
