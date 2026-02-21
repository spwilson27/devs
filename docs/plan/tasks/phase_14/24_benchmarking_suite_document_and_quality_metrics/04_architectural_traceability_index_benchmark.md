# Task: Implement Architectural Traceability Index Benchmark (Sub-Epic: 24_Benchmarking Suite Document and Quality Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-029]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/architecturalTraceability.bench.ts` with the following test cases:
  - **Unit test — fully traced**: Create two in-memory mock documents: a PRD mock with requirements `["PRD-REQ-001", "PRD-REQ-002"]` and a TAS mock with interface contracts referencing both IDs. Assert that `ArchitecturalTraceabilityChecker.check()` returns `{ rti: 1.0, unlinkedRequirements: [] }`.
  - **Unit test — partially traced**: Create mocks where `PRD-REQ-002` is NOT referenced in the TAS. Assert `{ rti: 0.5, unlinkedRequirements: ["PRD-REQ-002"] }`.
  - **Unit test — empty PRD**: Assert that when the PRD has zero requirements, the RTI returns `1.0` (vacuously true) and no error is thrown.
  - **Integration test**: Load `specs/1_prd.md` and `specs/2_tas.md` from disk. Extract all requirement IDs matching the pattern `\[([A-Z0-9_\-]+)\]` from the PRD. For each, search for the ID in the TAS file. Assert that the computed RTI equals `1.0` (i.e., no unlinked requirements).
  - **Regression test**: Write a test fixture with a known set of PRD requirement IDs and a TAS that references all of them plus extras; assert RTI is still `1.0` and `unlinkedRequirements` is empty.

## 2. Task Implementation
- [ ] Create `src/benchmarks/architecturalTraceabilityChecker.ts` exporting `ArchitecturalTraceabilityChecker` class with:
  - `check(prdContent: string, tasContent: string): { rti: number; unlinkedRequirements: string[] }` method.
  - Extracts all requirement IDs from `prdContent` using regex `/\[([1-9A-Z][A-Z0-9_\-]*-REQ-[A-Z0-9\-]+)\]/g` (captures IDs matching the project's naming convention).
  - For each extracted ID, checks whether it appears verbatim anywhere in `tasContent`.
  - Computes `rti = linked / total` (returns `1.0` when `total === 0`).
  - Returns typed result with `unlinkedRequirements` listing any IDs not found in the TAS.
- [ ] Create `src/benchmarks/scripts/runArchitecturalTraceabilityBench.ts` that:
  1. Reads `specs/1_prd.md` and `specs/2_tas.md` from disk.
  2. Runs `ArchitecturalTraceabilityChecker.check()`.
  3. Prints JSON: `{ rti: number, totalRequirements: number, linkedRequirements: number, unlinkedRequirements: string[] }`.
  4. Exits with code `1` if `rti < 1.0`.
- [ ] Add npm script: `"bench:arch-traceability": "ts-node src/benchmarks/scripts/runArchitecturalTraceabilityBench.ts"`.

## 3. Code Review
- [ ] Verify the requirement ID extraction regex does not produce false positives (e.g., does not match `[string]` type annotations in TypeScript code blocks within Markdown).
  - Add a preprocessing step to strip ` ```ts ` / ` ```typescript ` fenced code blocks from the PRD before extracting IDs.
- [ ] Confirm the `rti` value is rounded to 4 decimal places to avoid floating-point noise in assertions.
- [ ] Ensure `ArchitecturalTraceabilityChecker` is stateless and side-effect free — all file I/O is done by the caller/script.
- [ ] Verify that the regex handles multi-line Markdown correctly (the `g` flag is used, not `m` or `s` exclusively).
- [ ] Confirm all types are explicit — no implicit `any` from `Array.from()` on `matchAll` results.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="architecturalTraceability"` and confirm all unit, integration, and regression tests pass with exit code 0.
- [ ] Run `npm run bench:arch-traceability` and confirm it exits with code `0` and prints `rti: 1`.

## 5. Update Documentation
- [ ] Update `docs/benchmarks/README.md` with a section "Architectural Traceability Index" describing the RTI metric, how requirement IDs are extracted, how to run the benchmark, and the pass criterion (RTI = 1.0, maps to `[9_ROADMAP-REQ-029]`).
- [ ] Add `// [9_ROADMAP-REQ-029]` comment above the `check()` method signature in `architecturalTraceabilityChecker.ts`.
- [ ] Create `src/benchmarks/architecturalTraceabilityChecker.agent.md` documenting the module, the regex pattern used, the RTI formula, and instructions for keeping the TAS in sync when new PRD requirements are added.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="architecturalTraceability" --coverage` and assert coverage ≥ 90% for `src/benchmarks/architecturalTraceabilityChecker.ts`.
- [ ] Run `npm run bench:arch-traceability`; assert exit code is `0` using `echo $?` in CI.
- [ ] Add `bench:arch-traceability` to CI pipeline gating pull requests to `main`; any PR that adds a PRD requirement without a corresponding TAS interface contract must fail CI.
