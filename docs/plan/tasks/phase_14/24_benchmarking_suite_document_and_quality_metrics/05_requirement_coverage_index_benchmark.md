# Task: Implement Requirement Coverage Index (RTI) Benchmark (Sub-Epic: 24_Benchmarking Suite Document and Quality Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-030]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/requirementCoverageIndex.bench.ts` with the following test cases:
  - **Unit test — full coverage**: Create an in-memory mock `requirements.md` with three requirement IDs and a mock task manifest (array of task file contents) that each reference all three IDs. Assert `RequirementCoverageChecker.check()` returns `{ rti: 1.0, unmappedRequirements: [] }`.
  - **Unit test — partial coverage**: Mock two requirements where only one is referenced in any task file. Assert `{ rti: 0.5, unmappedRequirements: ["<the-missing-ID>"] }`.
  - **Unit test — empty requirements**: Assert that when there are zero requirements, RTI returns `1.0` without error.
  - **Unit test — duplicate mapping**: Assert that a requirement referenced in multiple task files is still counted once (not double-counted in the denominator).
  - **Integration test**: Load `requirements.md` from disk. Recursively load all `.md` files under `tasks/`. Run `RequirementCoverageChecker.check()`. Assert `rti === 1.0` and `unmappedRequirements` is empty.
  - **Regression test**: Snapshot the list of requirement IDs extracted from `requirements.md` and assert the count matches an expected minimum (e.g., total requirements count must be ≥ 100 to guard against accidental truncation of the requirements file).

## 2. Task Implementation
- [ ] Create `src/benchmarks/requirementCoverageChecker.ts` exporting `RequirementCoverageChecker` class with:
  - `check(requirementsContent: string, taskFileContents: string[]): { rti: number; unmappedRequirements: string[]; totalRequirements: number; mappedRequirements: number }` method.
  - Extracts all requirement IDs from `requirementsContent` using the canonical project regex: `/###\s+\*\*\[([^\]]+)\]\*\*/g` (matches the `### **[ID]**` heading format used in `requirements.md`).
  - For each extracted ID, checks whether the string `[<ID>]` or `[<ID>]` appears in ANY of the `taskFileContents` strings.
  - Computes `rti = mappedCount / totalCount` (returns `1.0` when `totalCount === 0`).
  - Returns full typed result.
- [ ] Create `src/benchmarks/scripts/runRequirementCoverageBench.ts` that:
  1. Reads `requirements.md` from project root using `fs.readFileSync`.
  2. Recursively finds all `.md` files under `tasks/` using `glob` (install `glob` if not present: `npm install glob`).
  3. Reads each task file content.
  4. Runs `RequirementCoverageChecker.check()`.
  5. Prints JSON: `{ rti: number, totalRequirements: number, mappedRequirements: number, unmappedRequirements: string[] }`.
  6. Exits with code `1` if `rti < 1.0`, printing each unmapped requirement to stderr.
- [ ] Add npm script: `"bench:requirement-coverage": "ts-node src/benchmarks/scripts/runRequirementCoverageBench.ts"`.
- [ ] Add a combined script: `"bench:all": "npm run bench:content-extractor && npm run bench:document-validity && npm run bench:mermaid && npm run bench:arch-traceability && npm run bench:requirement-coverage"` to run the full benchmarking suite in sequence.

## 3. Code Review
- [ ] Verify the requirement ID extraction regex correctly handles the `requirements.md` format — test it against the actual first 20 lines of `requirements.md` to confirm it captures real IDs.
- [ ] Confirm the task file scanning is recursive (handles subdirectories like `tasks/phase_14/24_.../`) and does NOT scan `node_modules/` or `.git/`.
- [ ] Ensure `RequirementCoverageChecker` is stateless — no module-level state or mutable closures.
- [ ] Verify `rti` is rounded to 4 decimal places.
- [ ] Confirm the `unmappedRequirements` list is sorted alphabetically for deterministic output.
- [ ] Ensure the `bench:all` script propagates non-zero exit codes correctly (uses `&&` chaining so the first failure stops the chain).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="requirementCoverageIndex"` and confirm all unit, integration, and regression tests pass with exit code 0.
- [ ] Run `npm run bench:requirement-coverage` and confirm it prints `rti: 1` and exits with code `0`.
- [ ] Run `npm run bench:all` to confirm the full suite passes end-to-end.

## 5. Update Documentation
- [ ] Update `docs/benchmarks/README.md` with a section "Requirement Coverage Index (RTI)" describing the RTI metric, the extraction pattern, how to run the benchmark, how to resolve unmapped requirements, and the pass criterion (RTI = 1.0 means 100% of requirements mapped to task IDs, maps to `[9_ROADMAP-REQ-030]`).
- [ ] Add a "Running the Full Benchmark Suite" section to `docs/benchmarks/README.md` documenting `npm run bench:all`.
- [ ] Add `// [9_ROADMAP-REQ-030]` comment above the `check()` method in `requirementCoverageChecker.ts`.
- [ ] Create `src/benchmarks/requirementCoverageChecker.agent.md` documenting the module, the RTI formula, the regex pattern, and the rule that every new requirement added to `requirements.md` MUST be referenced in at least one task file before merging.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="requirementCoverageIndex" --coverage` and assert coverage ≥ 90% for `src/benchmarks/requirementCoverageChecker.ts`.
- [ ] Run `npm run bench:requirement-coverage` and assert exit code `0` using `echo $?` in CI.
- [ ] Run `npm run bench:all` in CI as a final gate step; assert all five benchmark scripts exit with code `0`.
- [ ] Add a GitHub Actions (or equivalent CI) step named `"Quality Metrics Gate"` that runs `npm run bench:all` and fails the build on any non-zero exit, ensuring RTI = 1.0 is enforced on every merge to `main`.
