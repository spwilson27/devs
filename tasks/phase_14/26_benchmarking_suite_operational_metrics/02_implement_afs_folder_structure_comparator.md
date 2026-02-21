# Task: Implement AFS Folder Structure Comparator Benchmark (Sub-Epic: 26_Benchmarking Suite Operational Metrics)

## Covered Requirements
- [1_PRD-REQ-MET-004]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/afs-folder-structure-comparator.test.ts`.
- [ ] Write a unit test `compareFolderStructure returns variance=0 when implementation exactly matches TAS spec` using a mocked TAS folder spec (a plain JS object mapping expected paths to booleans) and a mocked real directory tree that is identical.
- [ ] Write a unit test `compareFolderStructure returns variance>0 when directories are missing` using a TAS spec with 10 expected top-level directories and a real tree missing 1; assert `result.missingDirectories.length === 1` and `result.variancePercent === 10`.
- [ ] Write a unit test `compareFolderStructure returns variance>0 when extra directories exist that are not in TAS` where the real tree has 2 directories absent from the TAS spec; assert `result.extraDirectories.length === 2`.
- [ ] Write a unit test `compareFolderStructure.passesTarget is true when variancePercent < 5` asserting `passesTarget === true` for a result with `variancePercent = 4`.
- [ ] Write a unit test `compareFolderStructure.passesTarget is false when variancePercent >= 5` asserting `passesTarget === false` for a result with `variancePercent = 5`.
- [ ] Use `vitest` and `vi.mock('fs/promises')` for all filesystem calls.

## 2. Task Implementation
- [ ] Create `src/benchmarks/afs-folder-structure-comparator.ts`.
- [ ] Define and export interfaces:
  ```ts
  export interface AfsFolderSpec {
    /** Set of expected directory paths relative to project root (e.g. "src/agents", "src/benchmarks") */
    expectedDirectories: string[];
  }

  export interface AfsFolderResult {
    expectedCount: number;
    matchedCount: number;
    missingDirectories: string[];  // in spec but not on disk
    extraDirectories: string[];    // on disk but not in spec
    variancePercent: number;       // (missingDirectories.length / expectedCount) * 100
    passesTarget: boolean;         // variancePercent < 5
  }
  ```
- [ ] Implement `async function compareFolderStructure(projectRoot: string, spec: AfsFolderSpec): Promise<AfsFolderResult>`:
  1. For each path in `spec.expectedDirectories`, use `fs.stat` to check if it exists and is a directory under `projectRoot`.
  2. Use `glob('*/', { cwd: projectRoot, deep: Infinity })` to enumerate all real directories under `projectRoot` (excluding `node_modules`, `.git`, `dist`, `.devs`).
  3. Compute `missingDirectories` (in spec, not on disk) and `extraDirectories` (on disk, not in spec).
  4. Compute `variancePercent = (missingDirectories.length / spec.expectedDirectories.length) * 100`.
  5. Set `passesTarget = variancePercent < 5`.
  6. Return the `AfsFolderResult`.
- [ ] Parse the authoritative TAS folder spec from `specs/2_tas.md` using a dedicated helper `parseTasFolderSpec(tasContent: string): AfsFolderSpec` that extracts directory paths listed under a `## Folder Structure` or `## Directory Layout` heading.
- [ ] Export both `compareFolderStructure` and `parseTasFolderSpec` as named exports.
- [ ] Add `export { compareFolderStructure, parseTasFolderSpec } from './afs-folder-structure-comparator';` to `src/benchmarks/index.ts`.
- [ ] Add `// [1_PRD-REQ-MET-004]` traceability comment at top of file below imports.

## 3. Code Review
- [ ] Verify that `variancePercent` uses only `missingDirectories` (not extra), since extra directories represent implementation additions not violations of TAS structure (the AFS definition is variance from spec, not bijection).
- [ ] Confirm `node_modules`, `.git`, `dist`, `.devs` are excluded from the real-directory enumeration to prevent false positives.
- [ ] Confirm `passesTarget` threshold is strictly `< 5` (not `<= 5`) per `[1_PRD-REQ-MET-004]` (`<5% variance`).
- [ ] Confirm `parseTasFolderSpec` is pure (no I/O), takes a string, and is independently unit-testable.
- [ ] Confirm the `[1_PRD-REQ-MET-004]` traceability comment is present.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/benchmarks/__tests__/afs-folder-structure-comparator.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript compiler errors.

## 5. Update Documentation
- [ ] Create `src/benchmarks/afs-folder-structure-comparator.agent.md` documenting:
  - Purpose: measures variance between TAS-specified folder structure and actual implementation directory layout.
  - Target: `variancePercent < 5` (i.e., fewer than 5% of TAS-expected directories are missing).
  - Inputs: `projectRoot` (string), `spec` (`AfsFolderSpec`).
  - Outputs: `AfsFolderResult` with `variancePercent` and `passesTarget` fields.
  - How `parseTasFolderSpec` is used to derive the spec from `specs/2_tas.md`.
- [ ] Add an entry to `docs/benchmarks/README.md` under "Operational Metrics" referencing this comparator.

## 6. Automated Verification
- [ ] Run `npx vitest run src/benchmarks/__tests__/afs-folder-structure-comparator.test.ts --reporter=verbose 2>&1 | grep -E "PASS|FAIL"` and assert the output contains `PASS` and does not contain `FAIL`.
- [ ] Run `grep -c "passesTarget" src/benchmarks/afs-folder-structure-comparator.ts` and assert output `>= 1`.
