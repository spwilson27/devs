# Task: Implement AOD Density Scanner Benchmark (Sub-Epic: 26_Benchmarking Suite Operational Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-041]

## 1. Initial Test Written
- [ ] Create test file `src/benchmarks/__tests__/aod-density-scanner.test.ts`.
- [ ] Write a unit test `aodDensityScanner returns ratio=1 when every .ts module has a matching .agent.md` using a mocked virtual file tree where every `src/**/*.ts` file (excluding `*.test.ts`, `*.d.ts`, `index.ts` barrel files) has a sibling `.agent.md`.
- [ ] Write a unit test `aodDensityScanner returns ratio<1 when some modules lack .agent.md` using a mocked file tree missing two `.agent.md` files; assert returned `ratio === coveredCount / totalModules`.
- [ ] Write a unit test `aodDensityScanner returns ratio=0 when no .agent.md files exist` using a mocked tree with zero `.agent.md` files.
- [ ] Write an integration test `aodDensityScanner scans the real devs source tree and returns a numeric ratio between 0 and 1` that runs against the actual `src/` directory (not mocked), asserting `result.ratio >= 0 && result.ratio <= 1`.
- [ ] Write a unit test `aodDensityScanner emits a WARN log when ratio < 1` asserting the logger receives a call with severity `WARN` and a message containing `"AOD Density below 1:1"`.
- [ ] Ensure all tests are written using `vitest` with `vi.mock` for filesystem operations (`fs/promises` glob).

## 2. Task Implementation
- [ ] Create `src/benchmarks/aod-density-scanner.ts`.
- [ ] Define and export the interface:
  ```ts
  export interface AodDensityResult {
    totalProductionModules: number;
    coveredModules: number;
    missingAgentMd: string[]; // relative paths of modules lacking .agent.md
    ratio: number;             // coveredModules / totalProductionModules
    passesTarget: boolean;     // ratio === 1
  }
  ```
- [ ] Implement `async function scanAodDensity(srcRoot: string): Promise<AodDensityResult>`:
  1. Use `glob` (the `glob` npm package, already in project dependencies) to collect all `**/*.ts` files under `srcRoot`, excluding `**/*.test.ts`, `**/*.spec.ts`, `**/*.d.ts`, and `**/index.ts`.
  2. For each found module path, derive the expected `.agent.md` sibling path by replacing the `.ts` extension with `.agent.md`.
  3. Use `fs.access` to check existence of each expected `.agent.md`.
  4. Build and return the `AodDensityResult` object.
  5. If `ratio < 1`, call `logger.warn('AOD Density below 1:1', { missingCount: totalProductionModules - coveredModules })`.
- [ ] Export `scanAodDensity` as a named export.
- [ ] Register the scanner in `src/benchmarks/index.ts` so it is included in the benchmark suite runner (add `export { scanAodDensity } from './aod-density-scanner';`).
- [ ] Add a `// [9_ROADMAP-REQ-041]` requirement traceability comment at the top of the file, directly below the import block.

## 3. Code Review
- [ ] Verify the scanner has **no side effects** other than logging: it must not write any files.
- [ ] Confirm the glob pattern explicitly excludes test, spec, declaration, and barrel index files to prevent inflating `totalProductionModules`.
- [ ] Confirm `fs.access` is used (not `fs.exists`) for POSIX compatibility.
- [ ] Confirm the `ratio` field is computed as `coveredModules / totalProductionModules` and safely handles `totalProductionModules === 0` by returning `ratio = 1` (vacuously true) and `passesTarget = true`.
- [ ] Confirm the `[9_ROADMAP-REQ-041]` traceability comment is present.
- [ ] Confirm the function is `async` and all I/O is awaited (no fire-and-forget promises).

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/benchmarks/__tests__/aod-density-scanner.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript compiler errors.

## 5. Update Documentation
- [ ] Create `src/benchmarks/aod-density-scanner.agent.md` documenting:
  - Purpose: measures 1:1 AOD ratio between production `.ts` modules and `.agent.md` files.
  - Inputs: `srcRoot` string (absolute path to the `src/` directory).
  - Outputs: `AodDensityResult` object (fields and their meanings).
  - Target threshold: `ratio === 1` (every module must have an `.agent.md`).
  - How to interpret `missingAgentMd`: list of modules requiring documentation.
- [ ] Add an entry to `docs/benchmarks/README.md` under the "Operational Metrics" section linking to this scanner with a one-line description.

## 6. Automated Verification
- [ ] Run `node -e "const {scanAodDensity} = require('./dist/benchmarks/aod-density-scanner'); scanAodDensity('./src').then(r => { if (typeof r.ratio !== 'number') process.exit(1); console.log('AOD ratio:', r.ratio); });"` after `npm run build` and confirm it exits with code `0` and prints `AOD ratio:` followed by a number.
- [ ] Confirm `src/benchmarks/__tests__/aod-density-scanner.test.ts` contains at least 5 `it(` or `test(` blocks by running `grep -c "it(\|test(" src/benchmarks/__tests__/aod-density-scanner.test.ts` and asserting output `>= 5`.
