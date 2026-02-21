# Task: Implement AFS Dependency Graph Comparator Benchmark (Sub-Epic: 26_Benchmarking Suite Operational Metrics)

## Covered Requirements
- [1_PRD-REQ-MET-004]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/afs-dependency-graph-comparator.test.ts`.
- [ ] Write a unit test `compareDependencyGraph returns variance=0 when all TAS-specified package dependencies are present in package.json` using a mocked TAS dependency spec and a mocked `package.json` that contains all of them.
- [ ] Write a unit test `compareDependencyGraph returns variance>0 when packages specified in TAS are absent from package.json` where 2 of 20 TAS-specified packages are missing; assert `result.missingPackages.length === 2` and `result.variancePercent === 10`.
- [ ] Write a unit test `compareDependencyGraph.passesTarget is true when variancePercent < 5`.
- [ ] Write a unit test `compareDependencyGraph.passesTarget is false when variancePercent >= 5`.
- [ ] Write a unit test `parseTasDependencySpec extracts packages from a TAS markdown string with a "## Dependencies" or "## Technology Stack" section`.
- [ ] Use `vitest` with `vi.mock` for `fs/promises` and `JSON.parse` stubs where needed.

## 2. Task Implementation
- [ ] Create `src/benchmarks/afs-dependency-graph-comparator.ts`.
- [ ] Define and export interfaces:
  ```ts
  export interface AfsDependencySpec {
    /** Package names the TAS mandates (e.g. ["typescript", "vitest", "lancedb"]) */
    requiredPackages: string[];
  }

  export interface AfsDependencyResult {
    expectedCount: number;
    matchedCount: number;
    missingPackages: string[];   // in TAS spec but absent from package.json (deps + devDeps)
    variancePercent: number;     // (missingPackages.length / expectedCount) * 100
    passesTarget: boolean;       // variancePercent < 5
  }
  ```
- [ ] Implement `async function compareDependencyGraph(projectRoot: string, spec: AfsDependencySpec): Promise<AfsDependencyResult>`:
  1. Read and parse `{projectRoot}/package.json` using `fs.readFile` + `JSON.parse`.
  2. Collect the union of keys from `dependencies`, `devDependencies`, and `peerDependencies`.
  3. Compute `missingPackages` as `spec.requiredPackages.filter(p => !installedSet.has(p))`.
  4. Compute `variancePercent` and `passesTarget` using the same formula as the folder structure comparator (`< 5` threshold).
  5. Return `AfsDependencyResult`.
- [ ] Implement `function parseTasDependencySpec(tasContent: string): AfsDependencySpec`:
  - Extract package names listed in a markdown code block under a heading matching `## Dependencies`, `## Technology Stack`, or `## Package Manifest` in the TAS document.
  - Return them as `{ requiredPackages: [...] }`.
- [ ] Export both as named exports and register in `src/benchmarks/index.ts`.
- [ ] Add `// [1_PRD-REQ-MET-004]` traceability comment at top of file below imports.

## 3. Code Review
- [ ] Confirm the combined dependency set covers `dependencies`, `devDependencies`, and `peerDependencies` to avoid false negatives for dev-only tools like `vitest`.
- [ ] Confirm `parseTasDependencySpec` is pure (string in, object out) with no I/O.
- [ ] Confirm `variancePercent` is `(missingPackages.length / expectedCount) * 100` and handles `expectedCount === 0` by returning `variancePercent = 0` and `passesTarget = true`.
- [ ] Confirm the `[1_PRD-REQ-MET-004]` traceability comment is present.
- [ ] Verify no duplicate logic with `afs-folder-structure-comparator.ts`; shared threshold logic (`< 5`) should not be duplicated into a shared utility yet (keep this task self-contained).

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/benchmarks/__tests__/afs-dependency-graph-comparator.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript compiler errors.

## 5. Update Documentation
- [ ] Create `src/benchmarks/afs-dependency-graph-comparator.agent.md` documenting:
  - Purpose: measures variance between TAS-mandated package dependencies and packages present in `package.json`.
  - Target: `variancePercent < 5` per `[1_PRD-REQ-MET-004]`.
  - Inputs: `projectRoot` (string), `spec` (`AfsDependencySpec`).
  - Outputs: `AfsDependencyResult`.
  - Note: `parseTasDependencySpec` reads the TAS markdown to derive the required package list.
- [ ] Update `docs/benchmarks/README.md` under "Operational Metrics" with an entry for this comparator.

## 6. Automated Verification
- [ ] Run `npx vitest run src/benchmarks/__tests__/afs-dependency-graph-comparator.test.ts --reporter=verbose 2>&1 | grep -E "PASS|FAIL"` and assert contains `PASS` and not `FAIL`.
- [ ] Run `grep -c "variancePercent" src/benchmarks/afs-dependency-graph-comparator.ts` and assert output `>= 1`.
