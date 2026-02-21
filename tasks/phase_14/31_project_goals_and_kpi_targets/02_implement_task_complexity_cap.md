# Task: Implement Task Complexity Cap with Recursive Decomposition in the Distiller (Sub-Epic: 31_Project Goals and KPI Targets)

## Covered Requirements
- [9_ROADMAP-REQ-045]

## 1. Initial Test Written
- [ ] Write a unit test in `src/distiller/__tests__/complexity-cap.test.ts` verifying that `ComplexityEstimator.estimate(task: TaskSpec): number` returns a value between 1–20 for a set of fixture task specs with known expected turn counts.
- [ ] Write a unit test verifying that `Distiller.distillPhase(phase)` calls `ComplexityEstimator.estimate()` for every generated task.
- [ ] Write a unit test verifying that when `ComplexityEstimator.estimate()` returns a value > 10, `Distiller.distillPhase()` recursively calls `Distiller.decomposeTask(task)` for that task and the resulting sub-tasks each have `estimate() <= 10`.
- [ ] Write a unit test verifying that recursive decomposition has a maximum recursion depth of 3, after which a `MaxDecompositionDepthError` is thrown rather than decomposing further (to prevent infinite loops).
- [ ] Write a unit test verifying that a task with `estimate() <= 10` is returned as-is (no decomposition).
- [ ] Write an integration test in `src/distiller/__tests__/complexity-cap.integration.test.ts` that feeds a realistic phase spec (loaded from `fixtures/phase_complex.json`) through `Distiller.distillPhase()` and asserts every task in the output has `estimate() <= 10`.
- [ ] Write an E2E test in `e2e/complexity-cap.test.ts` that invokes `devs distill --phase fixtures/phase_complex.json --output /tmp/tasks-out` and checks that no output task file contains `estimated_turns > 10`.

## 2. Task Implementation
- [ ] Create `src/distiller/complexity-estimator.ts` exporting class `ComplexityEstimator`:
  - `estimate(task: TaskSpec): number` – heuristic scorer that sums:
    - Number of files to create/modify × 1.5
    - Number of dependencies declared × 0.5
    - Number of acceptance criteria × 0.8
    - Number of integration test requirements × 1.0
    - Returns a float rounded to 1 decimal place; floor-clamped to 1, cap-clamped to 20.
  - Static factory `ComplexityEstimator.withDefaults()` returning a pre-configured instance.
- [ ] Create `src/distiller/decomposer.ts` exporting `decomposeTask(task: TaskSpec, depth: number, estimator: ComplexityEstimator): TaskSpec[]`:
  - Calls the LLM via `AgentService.call({ role: 'distiller', prompt: buildDecompositionPrompt(task) })`.
  - Parses the LLM response as JSON array of `TaskSpec`.
  - Validates each returned sub-task against `TaskSpecSchema` (zod).
  - For each sub-task with `estimate() > 10`, recurses with `depth + 1`.
  - Throws `MaxDecompositionDepthError` when `depth > 3`.
- [ ] Update `src/distiller/distiller.ts`:
  - After generating each `TaskSpec`, call `ComplexityEstimator.withDefaults().estimate(task)`.
  - If `> 10`, call `decomposeTask(task, 0, estimator)` and replace the original task with the returned sub-tasks.
  - Append field `estimated_turns: number` to each persisted `TaskSpec` record in the `tasks` DB table.
- [ ] Add column migration `migrations/0XX_add_estimated_turns_to_tasks.sql`:
  ```sql
  ALTER TABLE tasks ADD COLUMN estimated_turns REAL;
  ALTER TABLE tasks ADD COLUMN decomposition_depth INTEGER DEFAULT 0;
  ```
- [ ] Define `MaxDecompositionDepthError` in `src/distiller/errors.ts` with fields `taskId: string` and `depth: number`.

## 3. Code Review
- [ ] Confirm `ComplexityEstimator.estimate()` is a pure function (no side effects, deterministic for same input).
- [ ] Verify `decomposeTask()` guards against LLM returning an empty array (throw `DecompositionFailedError`) or returning non-array JSON (throw `DecompositionParseError`).
- [ ] Confirm the `MAX_DECOMPOSITION_DEPTH = 3` constant is defined once in `src/distiller/constants.ts` and not hard-coded inline.
- [ ] Ensure the LLM decomposition prompt (`buildDecompositionPrompt`) is logged at DEBUG level for traceability.
- [ ] Verify that `estimated_turns` is written to the DB for every task, including leaf tasks that were never decomposed.
- [ ] Confirm no circular imports between `distiller.ts`, `decomposer.ts`, and `complexity-estimator.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/distiller/__tests__/complexity-cap.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/distiller/__tests__/complexity-cap.integration.test.ts` and confirm all integration tests pass.
- [ ] Run `pnpm test e2e/complexity-cap.test.ts` and confirm the E2E test passes.
- [ ] Run `pnpm test --coverage` and verify `src/distiller/complexity-estimator.ts` and `src/distiller/decomposer.ts` each report ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add a `## Task Complexity Cap` section to `docs/distiller.md` describing the 10-turn cap, the heuristic scoring formula, and the recursive decomposition strategy.
- [ ] Update `memory/phase_14_decisions.md`: "Task Complexity Cap enforced at 10 turns via `ComplexityEstimator`; recursive decomposition via `decomposeTask()` up to depth 3."
- [ ] Add an ADR `docs/architecture/adr/ADR-XXX-task-complexity-cap.md` documenting the rationale for the 10-turn cap and the heuristic scoring approach.

## 6. Automated Verification
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Run `node scripts/verify-task-complexity.mjs` which reads all rows from the `tasks` table in the test DB and asserts that `estimated_turns IS NOT NULL` and all values are `<= 10` (post-decomposition).
- [ ] Confirm no `estimated_turns > 10` rows exist after a full distillation run of `fixtures/phase_complex.json`.
