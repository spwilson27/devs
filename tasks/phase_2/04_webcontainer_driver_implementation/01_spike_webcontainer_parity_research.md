# Task: WebContainer Parity Spike – Syscall & Non-JS Language Compatibility Research (Sub-Epic: 04_WebContainer Driver Implementation)

## Covered Requirements
- [9_ROADMAP-SPIKE-001], [9_ROADMAP-RISK-SEC-01], [UNKNOWN-401]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/compatibility.spike.test.ts`, write a test suite that:
  - Boots a real `@webcontainer/api` instance in a Jest JSDOM environment (or Playwright browser context if JSDOM is insufficient).
  - Asserts that `webcontainer.spawn('node', ['--version'])` resolves with exit code `0` and stdout matching `/^v\d+/`.
  - Asserts that attempting `webcontainer.spawn('python3', ['--version'])` either succeeds (capturing version string) or rejects with a structured `UnsupportedRuntimeError` (not an unhandled exception).
  - Asserts that attempting `webcontainer.spawn('go', ['version'])` either succeeds or rejects with `UnsupportedRuntimeError`.
  - Asserts that attempting `webcontainer.spawn('rustc', ['--version'])` either succeeds or rejects with `UnsupportedRuntimeError`.
  - Asserts that `webcontainer.fs.writeFile('/test.txt', 'hello')` followed by `webcontainer.fs.readFile('/test.txt', 'utf-8')` returns `'hello'` (basic FS parity check).
  - Asserts that a native npm package requiring node-gyp compilation (e.g., `better-sqlite3`) either installs successfully or produces a `NativeDependencyError` with `packageName` and `reason` fields.
- [ ] Write a Jest test in the same file that validates the shape of the `CompatibilityReport` interface: it must have fields `nodeSupported: boolean`, `pythonSupported: boolean`, `goSupported: boolean`, `rustSupported: boolean`, `nativeNpmSupported: boolean`, `unsupportedReasons: Record<string, string>`.

## 2. Task Implementation
- [ ] Add `@webcontainer/api` as a dependency in `packages/sandbox/package.json`. Pin to a specific version (e.g., `^1.3.0`) and document the version in `packages/sandbox/README.md`.
- [ ] Create `packages/sandbox/src/drivers/webcontainer/compatibility-probe.ts` that exports:
  ```ts
  export interface CompatibilityReport {
    nodeSupported: boolean;
    pythonSupported: boolean;
    goSupported: boolean;
    rustSupported: boolean;
    nativeNpmSupported: boolean;
    unsupportedReasons: Record<string, string>;
  }

  export async function runCompatibilityProbe(wc: WebContainer): Promise<CompatibilityReport>
  ```
  The function must:
  1. Spawn `node --version`; set `nodeSupported = true` on exit code `0`.
  2. Spawn `python3 --version`; catch any error/non-zero exit and record in `unsupportedReasons.python`.
  3. Spawn `go version`; same pattern.
  4. Spawn `rustc --version`; same pattern.
  5. Attempt `npm install better-sqlite3 --prefer-offline` in an isolated temp directory inside the WebContainer; record native npm result.
- [ ] Create `packages/sandbox/src/drivers/webcontainer/errors.ts` exporting:
  - `UnsupportedRuntimeError extends Error` with fields `runtime: string` and `reason: string`.
  - `NativeDependencyError extends Error` with fields `packageName: string` and `reason: string`.
- [ ] Create `packages/sandbox/src/drivers/webcontainer/spike-runner.ts` — a runnable Node.js script (not part of production bundle) that boots a WebContainer in a headless Playwright browser, calls `runCompatibilityProbe`, and writes the resulting `CompatibilityReport` as JSON to `spike-results/webcontainer-compat-$(date +%s).json`. This enables the spike to be re-run against future versions of `@webcontainer/api`.
- [ ] Create `packages/sandbox/docs/webcontainer-compatibility.md` documenting:
  - Findings from the probe (initially a template with `<!-- run spike-runner.ts to populate -->`).
  - Decision matrix: for each runtime (Python, Go, Rust), document whether to (a) support via WASM shim, (b) refuse with user-facing error, or (c) defer to DockerDriver.
  - List of known-incompatible native npm packages and recommended alternatives.

## 3. Code Review
- [ ] Verify `CompatibilityReport` interface is exported from `packages/sandbox/src/index.ts` so consumers can import it without reaching into internal paths.
- [ ] Verify `UnsupportedRuntimeError` and `NativeDependencyError` extend `Error` correctly (prototype chain set via `Object.setPrototypeOf` in constructor for ES5 compat).
- [ ] Verify `spike-runner.ts` is excluded from the production TypeScript build via `tsconfig.json` `exclude` list.
- [ ] Verify no `any` types are used in `compatibility-probe.ts`; all WebContainer API calls are typed using `@webcontainer/api` typings.
- [ ] Confirm all public exports have JSDoc comments including `@param`, `@returns`, and `@throws` annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=compatibility.spike` and confirm all assertions pass.
- [ ] Run `pnpm --filter @devs/sandbox tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/sandbox lint` and confirm zero lint violations.

## 5. Update Documentation
- [ ] Update `packages/sandbox/docs/webcontainer-compatibility.md` with the actual probe results from running `spike-runner.ts` (in CI or locally).
- [ ] Add a `## WebContainer Compatibility` section to `packages/sandbox/README.md` summarising the supported runtimes and linking to `docs/webcontainer-compatibility.md`.
- [ ] Update the Phase 2 architecture decision log at `docs/decisions/phase_2_adr.md` with a new ADR entry: "ADR-WC-001: WebContainer Runtime Support Strategy" recording which non-JS runtimes are supported and the fallback policy.

## 6. Automated Verification
- [ ] In CI (`.github/workflows/phase2.yml`), add a step: `pnpm --filter @devs/sandbox test -- --testPathPattern=compatibility.spike --ci` and assert exit code `0`.
- [ ] Add a step that runs `pnpm --filter @devs/sandbox tsc --noEmit` and asserts exit code `0`.
- [ ] Verify `spike-results/` directory is listed in `.gitignore` so probe output artefacts are not committed.
