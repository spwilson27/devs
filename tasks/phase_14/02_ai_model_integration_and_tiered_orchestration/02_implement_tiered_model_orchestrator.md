# Task: Implement Tiered Model Orchestration Router (Sub-Epic: 02_AI Model Integration and Tiered Orchestration)

## Covered Requirements
- [TAS-007], [TAS-008], [1_PRD-REQ-PERF-002]

## 1. Initial Test Written
- [ ] Create `src/ai/orchestrator/__tests__/model-orchestrator.test.ts`.
- [ ] Write a unit test that asserts `ModelOrchestrator.resolveModel('research')` returns a `GeminiClient` configured with `gemini-3-pro`.
- [ ] Write a unit test that asserts `ModelOrchestrator.resolveModel('architecture')` returns a `GeminiClient` configured with `gemini-3-pro`.
- [ ] Write a unit test that asserts `ModelOrchestrator.resolveModel('linting')` returns a `GeminiClient` configured with `gemini-3-flash`.
- [ ] Write a unit test that asserts `ModelOrchestrator.resolveModel('unit-test-generation')` returns a `GeminiClient` configured with `gemini-3-flash`.
- [ ] Write a unit test that asserts `ModelOrchestrator.resolveModel('log-summarization')` returns a `GeminiClient` configured with `gemini-3-flash`.
- [ ] Write a unit test that asserts `ModelOrchestrator.resolveModel('code-review')` returns a `GeminiClient` configured with `gemini-3-flash`.
- [ ] Write a unit test that asserts an unknown task type throws an `UnknownTaskTypeError`.
- [ ] Write an integration test that calls `orchestrator.complete('research', 'Summarize X')` with the mocked `GeminiClient` and verifies the correct model's `complete` method was invoked.
- [ ] Write a test confirming that calling `resolveModel` twice with the same task type returns the **same cached** client instance (singleton-per-model behavior).

## 2. Task Implementation
- [ ] Create `src/ai/orchestrator/model-orchestrator.ts` exporting a `ModelOrchestrator` class.
- [ ] Define a `TaskType` union type covering all task categories: `'research' | 'architecture' | 'linting' | 'unit-test-generation' | 'log-summarization' | 'code-review' | 'implementation'`.
- [ ] Define a static `TASK_MODEL_MAP: Record<TaskType, 'gemini-3-pro' | 'gemini-3-flash'>` mapping:
  - `research` → `gemini-3-pro`
  - `architecture` → `gemini-3-pro`
  - `implementation` → `gemini-3-pro`
  - `linting` → `gemini-3-flash`
  - `unit-test-generation` → `gemini-3-flash`
  - `log-summarization` → `gemini-3-flash`
  - `code-review` → `gemini-3-flash`
- [ ] Implement `resolveModel(taskType: TaskType): GeminiClient` that looks up the model name in `TASK_MODEL_MAP`, returns a cached `GeminiClient` singleton per model name (lazily instantiated on first call).
- [ ] Implement `complete(taskType: TaskType, prompt: string, options?: GenerateOptions): Promise<string>` which calls `resolveModel(taskType).complete(prompt, options)`.
- [ ] Implement `stream(taskType: TaskType, prompt: string, options?: GenerateOptions): AsyncIterable<string>` which delegates to `resolveModel(taskType).stream(prompt, options)`.
- [ ] Create `src/ai/orchestrator/errors.ts` defining `UnknownTaskTypeError extends Error` with a `taskType` field.
- [ ] Create `src/ai/orchestrator/index.ts` re-exporting `ModelOrchestrator`, `TaskType`, and `UnknownTaskTypeError`.
- [ ] Annotate the class with JSDoc referencing `[TAS-007]`, `[TAS-008]`, and `[1_PRD-REQ-PERF-002]`.

## 3. Code Review
- [ ] Verify that model selection logic is **entirely contained** within `TASK_MODEL_MAP` — no `if/else` chains for model names.
- [ ] Verify that `GeminiClient` instances are cached per model name, not per task type, to minimize SDK object creation.
- [ ] Confirm `TaskType` is an exhaustive union and that adding a new value causes a TypeScript compile error at the `TASK_MODEL_MAP` definition (exhaustiveness check).
- [ ] Confirm no direct calls to `@google/generative-ai` exist in the orchestrator — all calls go through `GeminiClient`.
- [ ] Confirm requirement IDs `[TAS-007]`, `[TAS-008]`, `[1_PRD-REQ-PERF-002]` appear in JSDoc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/ai/orchestrator/__tests__/model-orchestrator.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `model-orchestrator.ts`.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.

## 5. Update Documentation
- [ ] Update `docs/ai/models.md` with a new section "Tiered Model Orchestration" describing the `TASK_MODEL_MAP`, `TaskType` values, and the rationale for each model assignment, referencing `[1_PRD-REQ-PERF-002]`.
- [ ] Add a sequence diagram (Mermaid) to `docs/ai/models.md` showing the flow: `Caller → ModelOrchestrator.complete() → resolveModel() → GeminiClient.complete() → Gemini API`.

## 6. Automated Verification
- [ ] Run `npx jest src/ai/orchestrator/__tests__/model-orchestrator.test.ts --json --outputFile=test-results/model-orchestrator.json` and assert `"numFailedTests": 0`.
- [ ] Run `npx tsc --noEmit` and assert exit code `0`.
- [ ] Run `grep -r "1_PRD-REQ-PERF-002" src/ai/orchestrator/model-orchestrator.ts` and assert a match exists, confirming requirement traceability in source.
