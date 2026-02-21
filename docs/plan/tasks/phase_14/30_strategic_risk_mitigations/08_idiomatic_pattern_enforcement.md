# Task: Implement Idiomatic Pattern Enforcement in the Reviewer Agent (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-136]

## 1. Initial Test Written
- [ ] In `src/agents/__tests__/reviewer_agent.test.ts`, write unit tests covering:
  - `buildCleanCodeReviewPrompt(code: string, language: string, requirements: string[]): string` — assert the returned prompt string includes mandatory sections: `<clean_code_principles>`, `<solid_principles>`, `<code_to_review>`, `<requirement_ids>`, and `<output_format>` delimiters.
  - `parseReviewResult(llmResponse: string): ReviewResult` — assert parsing of structured LLM output into `{ passed: boolean; violations: Violation[]; suggestions: string[] }`; assert `passed: false` when `violations` array is non-empty.
  - `runCleanCodeReview(code, language, requirements, llmClient): Promise<ReviewResult>` — mock LLM returning a violation; assert `ReviewResult.passed === false`; mock LLM returning clean result; assert `ReviewResult.passed === true`.
  - Assert that `runCleanCodeReview` throws `ReviewAgentError` when the LLM returns malformed output (non-parseable JSON).
  - Write an integration test: feed a real snippet of code with a known SOLID violation (e.g., a God Class) and assert the reviewer correctly identifies it.

## 2. Task Implementation
- [ ] Create `src/agents/reviewer_agent.ts` exporting:
  - `Violation` interface: `{ principle: string; location: string; description: string; severity: 'CRITICAL' | 'WARNING' | 'INFO' }`.
  - `ReviewResult` type.
  - `buildCleanCodeReviewPrompt(code, language, requirements)` — builds a structured prompt enforcing: SOLID principles, Clean Architecture separation, idiomatic community patterns for the given language, no "God Objects", max function length 50 lines, max cyclomatic complexity 10; uses structured XML-style delimiters per `[1_PRD-REQ-SEC-012]`.
  - `parseReviewResult(llmResponse)` — parses the LLM's structured JSON output; uses Zod for validation.
  - `runCleanCodeReview(code, language, requirements, llmClient)` — orchestrates prompt → LLM call → parse → return; retries once on parse failure.
- [ ] Integrate `runCleanCodeReview` into the TDD loop in `src/orchestrator/task_runner.ts` at the **Code Review** step (step 3 of the TDD loop):
  - If `ReviewResult.passed === false` AND any violation has `severity === 'CRITICAL'`, fail the task and return it to the **Implementation** step with the violations appended to the agent context.
  - If only `WARNING`/`INFO` violations, log them to `agent_logs` but allow the task to proceed.
- [ ] Store each `ReviewResult` in a new `code_reviews` SQLite table (add to migration `018_code_reviews.sql`) with columns: `id`, `task_id`, `passed`, `violations_json`, `reviewed_at`.
- [ ] Add a `devs review --task <taskId>` CLI subcommand in `src/cli/commands/review.ts` that re-runs the clean code review on the committed code for a given task and prints the result.

## 3. Code Review
- [ ] Verify that `buildCleanCodeReviewPrompt` includes the active `requirement_ids` so the reviewer can assess requirement conformance, not just code style.
- [ ] Confirm that the retry logic in `runCleanCodeReview` on parse failure does NOT re-submit the same prompt — it must append a `<parse_error>` context block to guide the LLM to fix its output format.
- [ ] Ensure `CRITICAL` violations correctly block task progression — add a test that confirms the `IMPLEMENTATION` step is re-entered when `CRITICAL` violations are present.
- [ ] Confirm the `code_reviews` migration is idempotent and the `violations_json` column stores valid JSON.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="reviewer_agent"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="task_runner"` to confirm TDD loop integration tests pass with the new review step.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add `docs/reviewer_agent.md` describing:
  - The Clean Code principles enforced (SOLID, Clean Architecture, cyclomatic complexity limits).
  - How CRITICAL vs. WARNING violations affect the TDD loop.
  - How to manually trigger a review: `devs review --task <taskId>`.
- [ ] Update `src/agents/agents.agent.md` with the `reviewer_agent.ts` API.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Implemented idiomatic pattern enforcement in Reviewer Agent (SOLID, Clean Architecture, cyclomatic complexity)".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-136` and confirm `covered`.
- [ ] Run `devs review --task <any-completed-task-id>` and confirm the command exits with code `0` and prints a `ReviewResult` summary with `passed: true` for clean code.
