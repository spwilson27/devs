# Task: Document Production Data Migration Out-of-Scope Declaration & Guard (Sub-Epic: 01_Out-of-Scope Manifest - Infrastructure & Deployment)

## Covered Requirements
- [1_PRD-REQ-OOS-009]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/manifest.test.ts`, add an assertion that `OUT_OF_SCOPE_ITEMS` contains an entry with:
  - `id: "1_PRD-REQ-OOS-009"`
  - `category: "Infrastructure & Deployment"`
  - `title: "Production Data Migration"`
  - A non-empty `rationale` string.
  - `enforcement` array containing at least `"ScopeGuard"` and `"data_pipeline_guard"`.
- [ ] In `src/oos/__tests__/data-pipeline-guard.test.ts`, write unit tests for `DataPipelineGuard` from `src/oos/data-pipeline-guard.ts`:
  - `DataPipelineGuard.isProhibited({ intent: "migrate_production_db" })` returns `true`.
  - `DataPipelineGuard.isProhibited({ intent: "etl_existing_data" })` returns `true`.
  - `DataPipelineGuard.isProhibited({ intent: "clean_existing_records" })` returns `true`.
  - `DataPipelineGuard.isProhibited({ intent: "generate_seed_data" })` returns `false` (seed/fixture data for greenfield projects is allowed).
  - `DataPipelineGuard.isProhibited({ intent: "schema_definition" })` returns `false`.
  - `DataPipelineGuard.getRejectionMessage()` returns a string containing `"1_PRD-REQ-OOS-009"` and `"data migration"`.
- [ ] In `src/oos/__tests__/data-pipeline-guard.test.ts`, write an integration test asserting that if the task planner generates a task with description containing "migrate production data" or "ETL from existing database", `DataPipelineGuard` intercepts and the task is rejected before entering the development loop.

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-009` entry to `OUT_OF_SCOPE_ITEMS` in `src/oos/manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-009",
    category: "Infrastructure & Deployment",
    title: "Production Data Migration",
    rationale: "devs does not perform production data migration, cleaning, or complex ETL pipelines against existing live databases. This requires domain knowledge of the source data, legal considerations around data handling (GDPR, HIPAA), and production access that devs intentionally does not have. devs can generate migration script templates and schema definitions for greenfield schemas, but will not execute or design migrations for pre-existing data.",
    enforcement: ["ScopeGuard", "data_pipeline_guard", "task_planner_preflight"]
  }
  ```
- [ ] Create `src/oos/data-pipeline-guard.ts`:
  - Define `PROHIBITED_DATA_INTENTS: string[]` = `["migrate_production_db", "etl_existing_data", "clean_existing_records", "transform_legacy_data", "import_production_dump", "production_db_sync"]`.
  - Define `PROHIBITED_DESCRIPTION_KEYWORDS: string[]` = `["migrate production data", "ETL from existing", "clean existing records", "import production dump", "transform legacy", "production database migration"]`.
  - Export `DataPipelineGuard` object with:
    - `isProhibited(task: { intent?: string; description?: string }): boolean` — returns `true` if `task.intent` is in `PROHIBITED_DATA_INTENTS` OR if `task.description` matches any `PROHIBITED_DESCRIPTION_KEYWORDS` (case-insensitive).
    - `getRejectionMessage(): string` — returns `"[OOS: 1_PRD-REQ-OOS-009] Production data migration and ETL are out of scope. devs generates greenfield schemas and seed data templates only."`.
- [ ] Update `src/orchestrator/task-planner.ts`:
  - Before inserting any generated task into the task queue, run it through `DataPipelineGuard.isProhibited`.
  - If prohibited, do not insert the task; log the rejection to `logs/oos-violations.log` with `{ timestamp, oos_id: "1_PRD-REQ-OOS-009", task_description }` and emit a user-facing warning via the CLI status channel.
- [ ] Update `src/oos/scope-guard.ts`:
  - Add `isOutOfScope` handling for request types `"data_migration"` and `"etl"` that maps to `1_PRD-REQ-OOS-009`.

## 3. Code Review
- [ ] Confirm `DataPipelineGuard` distinguishes correctly between prohibited ETL (against existing data) and allowed seed data generation (for greenfield). Add a comment in the code clarifying this boundary.
- [ ] Verify that the task-planner preflight check does not reject tasks with descriptions like "create database schema" or "generate seed fixtures" — run the unit tests to confirm.
- [ ] Confirm the rejection is logged with sufficient detail (OOS ID, task description, timestamp) for auditability.
- [ ] Verify the user-facing warning message is human-readable and actionable (tells the user what devs CAN do as an alternative).
- [ ] Check that `DataPipelineGuard` is exported from `src/oos/index.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/data-pipeline-guard"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="src/orchestrator/task-planner"` and confirm the preflight check integration tests pass.
- [ ] Run `npm test -- --testPathPattern="src/oos/__tests__/manifest"` to confirm the new entry is present.
- [ ] Run `npm run lint` on all new and modified files.

## 5. Update Documentation
- [ ] Create `src/oos/data-pipeline-guard.agent.md`: Document prohibited intents, prohibited keywords, the allowed-vs-prohibited boundary (ETL vs. seed data), and how to extend the lists.
- [ ] Update `docs/architecture/out-of-scope.md`: Add `1_PRD-REQ-OOS-009` with rationale and a note explaining what devs WILL generate (schema templates, seed data scripts) vs. what it will not do (migrate/transform live data).
- [ ] Update `docs/agent-memory/phase_15_decisions.md`: Record the decision to intercept at the task-planner level for data-related OOS violations.

## 6. Automated Verification
- [ ] Run `node scripts/verify-oos-manifest.js --req-id="1_PRD-REQ-OOS-009"` and assert exit code `0`.
- [ ] Run `node scripts/verify-data-pipeline-guard.js` (create if absent): Script calls `DataPipelineGuard.isProhibited` with `{ intent: "migrate_production_db" }` and `{ intent: "generate_seed_data" }`, asserting first returns `true` and second returns `false`. Exit code `0` on success.
- [ ] In CI, assert `grep -r "1_PRD-REQ-OOS-009" src/oos/manifest.ts` exits with code `0`.
- [ ] Run `npm test -- --coverage --testPathPattern="src/oos/data-pipeline-guard"` and assert coverage ≥ 90%.
