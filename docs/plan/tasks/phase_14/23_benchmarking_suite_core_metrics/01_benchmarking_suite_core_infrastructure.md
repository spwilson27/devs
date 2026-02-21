# Task: Benchmarking Suite Core Infrastructure Setup (Sub-Epic: 23_Benchmarking Suite Core Metrics)

## Covered Requirements
- [9_ROADMAP-TAS-803]

## 1. Initial Test Written
- [ ] Create `src/benchmarking/__tests__/BenchmarkRunner.test.ts`.
- [ ] Write a unit test asserting that `BenchmarkRunner` can be instantiated with a `BenchmarkConfig` object specifying `name`, `version`, and an array of `BenchmarkSuite` references.
- [ ] Write a unit test asserting that `BenchmarkRunner.run()` returns a `BenchmarkReport` object containing `runId` (UUIDv4), `startedAt` (ISO timestamp), `completedAt` (ISO timestamp), `durationMs` (number), and a `results` array.
- [ ] Write a unit test asserting that `BenchmarkRunner.run()` calls each registered suite's `execute()` method exactly once.
- [ ] Write a unit test asserting that `BenchmarkReport` can be serialized to JSON and written to a path specified in `BenchmarkConfig.outputPath`.
- [ ] Write a unit test asserting that if any suite throws an unhandled error, `BenchmarkRunner` catches it, marks that suite's result as `{ status: 'error', error: string }`, and continues running remaining suites.
- [ ] Create `src/benchmarking/__tests__/BenchmarkRegistry.test.ts` and write tests asserting that `BenchmarkRegistry.register(suite)` adds a suite, `BenchmarkRegistry.getAll()` returns all registered suites, and `BenchmarkRegistry.get(name)` returns a suite by name or `undefined`.

## 2. Task Implementation
- [ ] Create `src/benchmarking/types.ts` and define the following exported interfaces:
  - `BenchmarkConfig`: `{ name: string; version: string; outputPath: string; suites?: string[] }` (optional `suites` whitelist by name).
  - `SuiteResult`: `{ suiteName: string; status: 'pass' | 'fail' | 'error'; metrics: Record<string, number | string | boolean>; details?: string; error?: string }`.
  - `BenchmarkReport`: `{ runId: string; config: BenchmarkConfig; startedAt: string; completedAt: string; durationMs: number; results: SuiteResult[]; overallStatus: 'pass' | 'fail' | 'error' }`.
  - `IBenchmarkSuite`: `{ name: string; requirmentIds: string[]; execute(): Promise<SuiteResult> }`.
- [ ] Create `src/benchmarking/BenchmarkRegistry.ts` implementing a singleton `BenchmarkRegistry` class with `register(suite: IBenchmarkSuite): void`, `getAll(): IBenchmarkSuite[]`, and `get(name: string): IBenchmarkSuite | undefined`.
- [ ] Create `src/benchmarking/BenchmarkRunner.ts` implementing:
  - Constructor accepts `BenchmarkConfig`.
  - `run(): Promise<BenchmarkReport>`:
    - Generates a `runId` via `crypto.randomUUID()`.
    - Records `startedAt`.
    - Retrieves suites from `BenchmarkRegistry`; if `config.suites` is provided, filters to matching names.
    - Calls `suite.execute()` for each suite sequentially, wrapping in try/catch.
    - Records `completedAt` and computes `durationMs`.
    - Derives `overallStatus` (`'pass'` if all pass, `'fail'` if any fail, `'error'` if any errored).
    - Writes the JSON report to `config.outputPath` using `fs.promises.writeFile`.
    - Returns the `BenchmarkReport`.
- [ ] Create `src/benchmarking/index.ts` that re-exports `BenchmarkRunner`, `BenchmarkRegistry`, and all types from `types.ts`.
- [ ] Add `"benchmarking:run": "ts-node src/benchmarking/cli.ts"` to `package.json` scripts.
- [ ] Create `src/benchmarking/cli.ts` as a simple CLI entry point that instantiates `BenchmarkRunner` with a config loaded from `devs.config.json` (or CLI args) and calls `runner.run()`, printing the summary to stdout.

## 3. Code Review
- [ ] Verify `BenchmarkRunner` uses `async/await` throughout and never blocks the event loop.
- [ ] Verify `BenchmarkRegistry` is a true singleton (module-level instance, not a class with a `getInstance()` that could be circumvented in tests — use a module export pattern).
- [ ] Verify all interfaces are in `types.ts` with no duplication across files.
- [ ] Verify `outputPath` is validated to be a writable path before the run starts; throw a descriptive `Error` if not.
- [ ] Verify that the `requirmentIds` field on `IBenchmarkSuite` correctly maps to the requirement IDs this suite covers (used for traceability reports).
- [ ] Verify TypeScript strict mode is satisfied (`"strict": true` in `tsconfig.json`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/BenchmarkRunner"` and confirm all assertions pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/BenchmarkRegistry"` and confirm all assertions pass with zero failures.
- [ ] Run `npm run build` and confirm TypeScript compilation succeeds with zero errors.

## 5. Update Documentation
- [ ] Create `src/benchmarking/benchmarking.agent.md` documenting: purpose of the benchmarking module, the `IBenchmarkSuite` contract, how to register a new suite, the structure of `BenchmarkReport`, and where reports are written.
- [ ] Update the project-level `README.md` (or `docs/architecture.md`) to include a "Benchmarking" section referencing this module and the `benchmarking:run` script.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/benchmarking" --coverage` and confirm line coverage ≥ 90% for all files in `src/benchmarking/`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Confirm the file `src/benchmarking/benchmarking.agent.md` exists (1:1 AOD ratio requirement).
