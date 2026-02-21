# Task: Implement Contextual Ingestion via diff_analysis After User Intervention Resume (Sub-Epic: 13_Human-in-the-Loop Recovery)

## Covered Requirements
- [8_RISKS-REQ-076]

## 1. Initial Test Written
- [ ] Create `src/recovery/__tests__/ContextualIngestionService.test.ts` with the following test coverage:
  - **Unit: `analyzeAndIngest(sessionId)` calls `diff_analysis` tool with correct args** — Mock `DiffAnalysisTool.run(taskId, suspendedCommitSha, 'HEAD')` and assert it is called exactly once with the task ID from the resumed HITL session and the correct base commit SHA stored in the session.
  - **Unit: `analyzeAndIngest()` updates Medium-term Memory with diff summary** — After the mocked `diff_analysis` returns a `DiffSummary`, assert `MediumTermMemoryStore.upsert({ taskId, diffSummary })` is called with the full summary payload.
  - **Unit: `analyzeAndIngest()` returns a structured `IngestionReport`** — Assert the returned object has shape `{ taskId, filesAnalyzed: string[], summaryEmbeddingId: string }`.
  - **Unit: `analyzeAndIngest()` throws `IngestionError` if `diff_analysis` fails** — Mock `DiffAnalysisTool.run` to throw; assert `ContextualIngestionService.analyzeAndIngest()` re-throws as `IngestionError` with the original message attached.
  - **Unit: `analyzeAndIngest()` is a no-op when `InterventionReport.hasIntervention === false`** — Assert neither `DiffAnalysisTool` nor `MediumTermMemoryStore` is called; `IngestionReport.filesAnalyzed` is empty.
  - **Integration: full resume pipeline ingests changes into vector memory** — Create a temp Git repo with a committed change to `src/component.ts`, store a fake HITL session pointing to the pre-change commit, call `ContextualIngestionService.analyzeAndIngest(sessionId)`, and assert a non-empty embedding ID is returned from a real (or in-process stub) LanceDB instance.

## 2. Task Implementation
- [ ] Create `src/recovery/ContextualIngestionService.ts`:
  - Export interface `IngestionReport { taskId: string; filesAnalyzed: string[]; summaryEmbeddingId: string; }`.
  - Export `IngestionError extends Error`.
  - Export class `ContextualIngestionService` accepting `{ db: Database, diffAnalysisTool: DiffAnalysisTool, memoryStore: MediumTermMemoryStore }` in constructor.
  - Implement `async analyzeAndIngest(sessionId: string): Promise<IngestionReport>`:
    1. Load `SuspendedSession` from `hitl_sessions` WHERE `id = sessionId`; throw `HitlSessionNotFoundError` if missing.
    2. Deserialize `intervention_report_json`; if `!report.hasIntervention`, return early with empty `IngestionReport`.
    3. Call `this.diffAnalysisTool.run(session.task_id, session.suspended_commit_sha, 'HEAD')` (catch and re-throw as `IngestionError`).
    4. Call `this.memoryStore.upsert({ taskId: session.task_id, diffSummary, timestamp: Date.now() })` to persist into Medium-term Memory (LanceDB vector store).
    5. Return `{ taskId: session.task_id, filesAnalyzed: diffSummary.files, summaryEmbeddingId: embeddingId }`.
- [ ] Create `src/tools/DiffAnalysisTool.ts`:
  - Export interface `DiffSummary { files: string[]; additions: number; deletions: number; semanticSummary: string; }`.
  - Implement `async run(taskId: string, baseSha: string, headRef: string): Promise<DiffSummary>`:
    - Run `git diff <baseSha> <headRef> -- src/` via `execa` to get the raw diff.
    - Call the configured LLM (Flash model, cheap/fast) with a prompt to produce a concise semantic summary of the diff.
    - Parse and return `DiffSummary`.
- [ ] Add `suspended_commit_sha TEXT` column to `hitl_sessions` (store the Git HEAD SHA at the moment `pause()` is called; use `git rev-parse HEAD` at pause time).
- [ ] Wire `ContextualIngestionService.analyzeAndIngest()` into `HumanInTheLoopManager.resume()`: after restoring graph state and before returning, call `ingestionService.analyzeAndIngest(sessionId)` and attach the resulting `IngestionReport` to the returned object.
- [ ] Export `ContextualIngestionService` and `DiffAnalysisTool` from `src/recovery/index.ts`.

## 3. Code Review
- [ ] Verify the LLM call in `DiffAnalysisTool` uses the Flash model (not the full reasoning model) to minimize latency and cost at resume time.
- [ ] Confirm `suspended_commit_sha` is stored as part of the `pause()` transaction so there is no TOCTOU race between capturing the SHA and writing the session.
- [ ] Verify `MediumTermMemoryStore.upsert` is idempotent on `taskId` to prevent duplicate embeddings if `analyzeAndIngest` is retried.
- [ ] Confirm `IngestionError` wraps the original error cause for full stack trace visibility in logs.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=ContextualIngestionService` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern=DiffAnalysisTool` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --coverage --testPathPattern="ContextualIngestionService|DiffAnalysisTool"` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Create `src/recovery/ContextualIngestionService.agent.md` documenting: purpose, full `analyzeAndIngest()` contract, the early-exit behavior when there is no intervention, and the dependency on `DiffAnalysisTool` and `MediumTermMemoryStore`.
- [ ] Create `src/tools/DiffAnalysisTool.agent.md` documenting: purpose, input/output contract, the Flash model usage rationale, and the `DiffSummary` schema.
- [ ] Update `src/orchestration/HumanInTheLoopManager.agent.md` to note that `resume()` now triggers contextual ingestion automatically.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="ContextualIngestionService|DiffAnalysisTool" --reporter=json > /tmp/ingestion_results.json` and assert `numFailedTests === 0` by running `node -e "const r=require('/tmp/ingestion_results.json'); process.exit(r.numFailedTests)"`.
- [ ] Run `npm run build` and confirm TypeScript compilation emits zero errors for the new files.
