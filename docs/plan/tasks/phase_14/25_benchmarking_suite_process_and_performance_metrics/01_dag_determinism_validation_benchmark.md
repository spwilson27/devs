# Task: DAG Determinism Validation Benchmark (Sub-Epic: 25_Benchmarking Suite Process and Performance Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-031]

## 1. Initial Test Written
- [ ] Create test file at `src/orchestrator/__tests__/dag-determinism.bench.test.ts`.
- [ ] Write a unit test `dagHasNoCycles_emptyGraph` that constructs an empty `TaskDAG` and asserts `validateDAG(dag).hasCycles === false`.
- [ ] Write a unit test `dagHasNoCycles_linearChain` that constructs a 5-node linear dependency chain (A→B→C→D→E) and asserts `validateDAG(dag).hasCycles === false` and `validateDAG(dag).dependencyPaths` contains all edges.
- [ ] Write a unit test `dagDetectsCycle_simpleCycle` that constructs a graph with a direct cycle (A→B→A) and asserts `validateDAG(dag).hasCycles === true` and `validateDAG(dag).cycleNodes` contains `['A', 'B']` (or equivalent).
- [ ] Write a unit test `dagDetectsCycle_indirectCycle` that constructs a graph with an indirect cycle (A→B→C→A) and asserts `validateDAG(dag).hasCycles === true`.
- [ ] Write an integration test `benchmarkDAGValidation_realPhaseGraph` that loads the actual phase task graph from `tasks/phase_14/` directory, runs `validateDAG`, and asserts zero cycles and that all dependency paths are non-empty.
- [ ] Write a benchmark test using `vitest bench` or `jest-bench` that measures `validateDAG` execution time on graphs of 10, 100, and 1000 nodes, asserting p95 latency < 50ms for 1000 nodes.
- [ ] All tests must FAIL before implementation begins (Red-Phase Gate confirmed).

## 2. Task Implementation
- [ ] Create `src/orchestrator/dag-validator.ts` exporting:
  - `interface TaskNode { id: string; dependsOn: string[] }`.
  - `interface DAGValidationResult { hasCycles: boolean; cycleNodes: string[]; dependencyPaths: Map<string, string[]> }`.
  - `function validateDAG(nodes: TaskNode[]): DAGValidationResult` implementing Kahn's Algorithm (BFS-based topological sort) to detect cycles and build dependency path map.
- [ ] Use a `Map<string, Set<string>>` adjacency list internally; compute in-degree for all nodes.
- [ ] If topological sort cannot complete (remaining nodes with in-degree > 0 after BFS), mark `hasCycles = true` and populate `cycleNodes` by finding the remaining unprocessed nodes.
- [ ] Build `dependencyPaths` by recording the BFS traversal order as the canonical dependency path for each node.
- [ ] Export `function buildDAGFromTaskFiles(tasksDir: string): Promise<TaskNode[]>` that reads all `*.md` files in a directory, parses `## Covered Requirements` and any explicit `dependsOn:` YAML front-matter, and returns `TaskNode[]`.
- [ ] Register the benchmark as a script in `package.json` under `devs.benchmarks`: `"dag-determinism": "vitest bench src/orchestrator/__tests__/dag-determinism.bench.test.ts"`.

## 3. Code Review
- [ ] Verify Kahn's Algorithm is implemented correctly — no mutation of the original input array.
- [ ] Confirm `validateDAG` is a pure function (no side effects, no I/O).
- [ ] Confirm `buildDAGFromTaskFiles` handles missing `dependsOn` front-matter gracefully (defaults to empty array).
- [ ] Verify all exported types are in a shared `types/dag.ts` if other modules already define `TaskNode`; avoid duplicate type declarations.
- [ ] Confirm the benchmark script is listed under the `devs` section of `package.json` per [TAS-006].
- [ ] Ensure cyclomatic complexity of `validateDAG` is ≤ 10.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/orchestrator/__tests__/dag-determinism.bench.test.ts` and confirm all unit and integration tests pass.
- [ ] Run `npx vitest bench src/orchestrator/__tests__/dag-determinism.bench.test.ts` and confirm p95 latency for 1000-node graph is < 50ms.
- [ ] Run `npm run lint` and confirm zero TypeScript strict-mode errors (per [TAS-005]).

## 5. Update Documentation
- [ ] Create `src/orchestrator/dag-validator.agent.md` documenting: purpose, algorithm used (Kahn's), exported API, and the benchmark result baseline (p95 for 1000 nodes).
- [ ] Update `docs/benchmarks/README.md` to add a row for `dag-determinism` benchmark with threshold `hasCycles = false` and p95 < 50ms.
- [ ] Add a `# [9_ROADMAP-REQ-031]` comment above the `validateDAG` function in source.

## 6. Automated Verification
- [ ] Run `node scripts/validate-all.js --benchmark dag-determinism` and confirm exit code 0.
- [ ] Confirm the output JSON report at `reports/benchmarks/dag-determinism.json` contains `{ "hasCycles": false, "p95Ms": <number> }` with `p95Ms < 50`.
- [ ] Run `grep -r "9_ROADMAP-REQ-031" src/orchestrator/dag-validator.ts` and confirm the requirement ID appears in a source comment.
