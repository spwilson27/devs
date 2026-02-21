# Task: Implement `.devs` Folder State Reconstruction from Code Comments and Documentation (Sub-Epic: 06_Crash Recovery and Resume)

## Covered Requirements
- [TAS-069]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/StateReconstructor.test.ts`, write unit and integration tests for a `StateReconstructor` class:
  - **Unit — comment extraction**: given a mock TypeScript source file containing `// @devs task_id: task_42` and `// @devs req: 1_PRD-REQ-SYS-002`, assert `extractAnnotations(fileContent)` returns `[{ taskId: 'task_42', reqIds: ['1_PRD-REQ-SYS-002'] }]`.
  - **Unit — `.agent.md` doc parsing**: given a mock `.agent.md` file with a `## Requirements` section listing requirement IDs, assert `parseAgentDoc(content)` extracts them into a `string[]`.
  - **Unit — `reconstruct()` with no source files**: assert the method returns an empty `RequirementMap` (no tasks, no requirements) without throwing.
  - **Unit — `reconstruct()` with two annotated files**: mock `glob('**/*.ts')` returning two files with inline annotations; assert the resulting `RequirementMap` contains both `task_id` entries with their associated requirements.
  - **Unit — duplicate annotation handling**: same `task_id` appears in two files; assert the `RequirementMap` merges their `reqIds` into a deduplicated set.
  - **Integration**: create a real temp directory with two `.ts` files containing `// @devs` annotations and one `.agent.md` doc; delete the `.devs` folder; call `StateReconstructor.reconstruct(projectRoot)`; assert the returned `RequirementMap` correctly reflects all annotations.

## 2. Task Implementation
- [ ] Create `src/orchestrator/StateReconstructor.ts`:
  - Define the `@devs` inline annotation format:
    - `// @devs task_id: <id>` — marks the file as belonging to a task.
    - `// @devs req: <REQ_ID>` — marks the file as implementing a specific requirement.
  - Implement `StateReconstructor` with constructor accepting `projectRoot: string` and `logger: Logger`.
  - Implement `async reconstruct(): Promise<RequirementMap>`:
    1. Glob for `**/*.ts`, `**/*.js`, `**/*.py`, `**/*.md` under `projectRoot`, excluding `node_modules`, `dist`, `.git`.
    2. For each file, read its content and call `extractAnnotations(content)` to parse all `// @devs` lines.
    3. Additionally, glob for `**/*.agent.md` and call `parseAgentDoc(content)` on each to extract requirement IDs from `## Requirements` or `## Covered Requirements` sections.
    4. Merge all findings into a `RequirementMap` (`Map<taskId, Set<reqId>>`).
    5. Return the map.
  - Implement private `extractAnnotations(content: string): Annotation[]`.
  - Implement private `parseAgentDoc(content: string): string[]` using a regex to match `- \[([A-Z0-9_-]+)\]` lines under a `## Requirements` or `## Covered Requirements` heading.
  - Export `RequirementMap` type alias.
- [ ] In `src/startup/bootstrap.ts`, after Git-DB consistency check:
  - Check if `<projectRoot>/.devs/` directory exists.
  - If it is **missing**, instantiate `StateReconstructor` and call `await reconstructor.reconstruct()`.
  - Log a structured `warn` entry: `".devs folder missing — reconstructed requirement map from source annotations"` and include summary counts (files scanned, tasks found, requirements found).
  - Persist the reconstructed map to a new `state.sqlite` database via a `RequirementMapRepository` (write each `task_id` → `req_id` pair to a `reconstructed_requirements` table so the orchestrator can proceed).

## 3. Code Review
- [ ] Verify the glob excludes `node_modules`, `dist`, `.git`, and any path containing `.devs` itself (to avoid recursion).
- [ ] Confirm `extractAnnotations` handles both `// @devs` (single-line) and `/* @devs */` block comment forms for robustness.
- [ ] Verify file reads use `utf-8` encoding with error handling — unreadable binary files must be skipped (log `debug`, continue).
- [ ] Confirm `RequirementMap` is returned (not mutated further) so callers own the data.
- [ ] Verify `parseAgentDoc` only extracts IDs under a recognized heading and does not accidentally pick up IDs from code blocks.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=StateReconstructor` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add `src/orchestrator/StateReconstructor.agent.md` documenting: the `// @devs` annotation format, the `.agent.md` parsing strategy, the `RequirementMap` type, and the reconstruction algorithm.
- [ ] Add a section to `docs/architecture/state-recovery.md` explaining the `.devs`-folder-missing recovery path and referencing `TAS-069`.
- [ ] Update `docs/contributing/annotations.md` (create if absent) to document the `// @devs task_id:` and `// @devs req:` annotation conventions for developers.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=StateReconstructor --coverage` and assert line coverage ≥ 90% for `StateReconstructor.ts`.
- [ ] Add a CI smoke test: delete `.devs/` from the test fixture project, run `devs resume`, and assert the process logs the reconstruction warning and exits 0 (or prompts correctly) rather than crashing with "missing folder" error.
