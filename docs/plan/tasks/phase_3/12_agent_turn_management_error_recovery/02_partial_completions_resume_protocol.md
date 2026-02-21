# Task: Partial Completions Resume Protocol (Sub-Epic: 12_Agent Turn Management & Error Recovery)

## Covered Requirements
- [3_MCP-TAS-072]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/partial-completion-resume.test.ts`, write unit tests covering:
  - `PartialCompletionDetector.detect(rawResponse)` returns `{ partial: true, lastValidToken: string }` when `rawResponse` is truncated mid-JSON (e.g., ends mid-string, mid-array, or missing closing braces).
  - `PartialCompletionDetector.detect(rawResponse)` returns `{ partial: false }` for a complete, valid JSON string.
  - `PartialCompletionResumeHandler.resume()` builds a resume prompt containing the exact prefix up to `lastValidToken` and the instruction to complete from that point.
  - `PartialCompletionResumeHandler.resume()` successfully reconstructs a full `SAOP_Envelope` by concatenating the prefix with the LLM-supplied completion.
  - Reconstruction fails gracefully (throws `ResumeFailedError`) when the combined prefix + completion still cannot be parsed as valid JSON after one retry.
- [ ] Write integration tests in `packages/core/src/__tests__/orchestrator-partial.integration.test.ts`:
  - Stub LLM to return a response truncated at a known token boundary; verify the orchestrator transparently resumes and returns the full envelope.
  - Stub LLM to return truncated output on resume attempt too; verify the orchestrator escalates to `USER_ESCALATION` state and logs a `RESUME_FAILED` event.

## 2. Task Implementation
- [ ] Create `packages/core/src/protocol/partial-completion-detector.ts`:
  - Export function `detect(rawResponse: string): { partial: false } | { partial: true; lastValidToken: string }`.
  - Use a streaming JSON tokenizer (e.g., `@streamparser/json`) to walk the token stream; if the stream ends in an incomplete state, return the string up to the last successfully emitted token as `lastValidToken`.
  - Handle edge cases: empty string, response that is only whitespace, response with BOM prefix.
  - Add `// REQ: 3_MCP-TAS-072` comment at the function definition.
- [ ] Create `packages/core/src/protocol/partial-completion-resume-handler.ts`:
  - Export class `PartialCompletionResumeHandler` with constructor `{ llmClient: ILlmClient; logger: ILogger }`.
  - Implement `async resume(prefix: string, turnContext: TurnContext): Promise<SAOP_Envelope>`:
    1. Build resume prompt: `"Complete the following SAOP JSON starting exactly where it left off. Do not repeat or modify what has already been output. JSON so far:\n<prefix>"`.
    2. Call `llmClient.complete(resumePrompt)`.
    3. Concatenate `prefix + completion` and attempt `SAOPEnvelopeSchema.safeParse(JSON.parse(...))`.
    4. On success return parsed envelope; on failure throw `new ResumeFailedError({ prefix, completion })`.
  - Export `ResumeFailedError extends Error` with fields `prefix: string` and `completion: string`.
- [ ] In `packages/core/src/orchestrator/turn-executor.ts`, after receiving raw LLM output, call `PartialCompletionDetector.detect()` before `MalformedResponseHandler.handle()`; if `partial === true`, delegate to `PartialCompletionResumeHandler.resume()` first.
- [ ] Emit structured log events `{ event: 'PARTIAL_COMPLETION_DETECTED', lastValidToken }` and `{ event: 'RESUME_SUCCEEDED' | 'RESUME_FAILED' }` via `ILogger`.

## 3. Code Review
- [ ] Verify the tokenizer-based detection does not buffer entire large responses in memory — confirm it uses a streaming approach compatible with the project's memory constraints.
- [ ] Confirm the resume prompt does not include any instruction that could cause the LLM to re-emit the prefix (which would create a duplicate JSON key issue upon concatenation).
- [ ] Ensure `ResumeFailedError` propagates up the call stack and is handled at the orchestrator state-machine level, transitioning to `USER_ESCALATION`.
- [ ] Verify `detect()` and `resume()` both have `// REQ: 3_MCP-TAS-072` annotations.
- [ ] Confirm no direct `fs` or side-effect imports — this module must be pure (I/O only via injected `llmClient`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="partial-completion-resume|orchestrator-partial"` and confirm all tests pass.
- [ ] Run the full `pnpm --filter @devs/core test` suite and confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/protocol/partial-completion-detector.agent.md` and `partial-completion-resume-handler.agent.md` documenting:
  - Detection algorithm and tokenizer dependency.
  - Resume prompt template and concatenation strategy.
  - Introspection points: `PARTIAL_COMPLETION_DETECTED`, `RESUME_SUCCEEDED`, `RESUME_FAILED` log events.
- [ ] Update `docs/architecture/error-recovery.md` with a section on partial-completion resume protocol.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `partial-completion-detector.ts` and `partial-completion-resume-handler.ts` each have ≥ 90% branch coverage.
- [ ] Run `grep -r "REQ: 3_MCP-TAS-072" packages/core/src/protocol/` and assert at least 2 matches.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript compilation errors.
