# Task: WebContainer Syscall Compatibility Layer & Non-JS Runtime Handling (Sub-Epic: 04_WebContainer Driver Implementation)

## Covered Requirements
- [9_ROADMAP-RISK-SEC-01], [UNKNOWN-401]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/syscall-compat.unit.test.ts`, write unit tests for `RuntimeCompatibilityChecker`:
  - `isRuntimeSupported('node')` returns `true`.
  - `isRuntimeSupported('python3')` returns `false` (based on current compatibility matrix fixture).
  - `isRuntimeSupported('go')` returns `false`.
  - `isRuntimeSupported('rustc')` returns `false`.
  - `getUnsupportedReason('python3')` returns a non-empty string explaining the limitation.
  - `getFallbackDriver('python3')` returns `'docker'`.
  - `getFallbackDriver('node')` returns `null` (no fallback needed).
- [ ] In the same file, test `NativeDependencyChecker`:
  - `requiresNativeCompilation('better-sqlite3')` returns `true`.
  - `requiresNativeCompilation('lodash')` returns `false`.
  - `requiresNativeCompilation('sharp')` returns `true`.
  - `getAlternative('better-sqlite3')` returns `'sql.js'`.
  - `getAlternative('sharp')` returns `null` (no known alternative).
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/syscall-compat.integration.test.ts` (skipped in unit CI), test that `WebContainerDriver.exec('python3', ['--version'])` rejects with `UnsupportedRuntimeError` having `runtime === 'python3'` and a non-empty `reason` string.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/drivers/webcontainer/runtime-compat-matrix.ts` — a static JSON-backed compatibility matrix:
  ```ts
  // Sourced from docs/webcontainer-compatibility.md findings (spike task 01)
  export const RUNTIME_COMPAT_MATRIX: Record<string, { supported: boolean; reason?: string; fallbackDriver?: 'docker' | null }> = {
    node:    { supported: true },
    npm:     { supported: true },
    npx:     { supported: true },
    python3: { supported: false, reason: 'WebContainers lack POSIX syscalls required by CPython interpreter (clone, execve, fork). Use DockerDriver for Python workloads.', fallbackDriver: 'docker' },
    python:  { supported: false, reason: 'Alias of python3. Same limitation applies.', fallbackDriver: 'docker' },
    go:      { supported: false, reason: 'Go runtime requires Linux syscalls (clone3, mmap) unavailable in browser sandbox.', fallbackDriver: 'docker' },
    rustc:   { supported: false, reason: 'Rust compiler requires fork/exec and filesystem mounts unavailable in WebContainers.', fallbackDriver: 'docker' },
    cargo:   { supported: false, reason: 'Cargo depends on rustc. Same limitation applies.', fallbackDriver: 'docker' },
  };
  ```
- [ ] Create `packages/sandbox/src/drivers/webcontainer/runtime-compat-checker.ts` exporting:
  ```ts
  export class RuntimeCompatibilityChecker {
    isRuntimeSupported(runtime: string): boolean
    getUnsupportedReason(runtime: string): string | null
    getFallbackDriver(runtime: string): 'docker' | null
  }
  ```
  Using `RUNTIME_COMPAT_MATRIX` as the data source.
- [ ] Create `packages/sandbox/src/drivers/webcontainer/native-dependency-checker.ts` exporting:
  ```ts
  export const NATIVE_PACKAGES: Record<string, { alternative: string | null }> = {
    'better-sqlite3': { alternative: 'sql.js' },
    'sharp':          { alternative: null },
    'bcrypt':         { alternative: 'bcryptjs' },
    'canvas':         { alternative: null },
    'node-sass':      { alternative: 'sass' },
    'sqlite3':        { alternative: 'sql.js' },
  };

  export class NativeDependencyChecker {
    requiresNativeCompilation(packageName: string): boolean
    getAlternative(packageName: string): string | null
  }
  ```
- [ ] Integrate `RuntimeCompatibilityChecker` into `WebContainerDriver.exec()` (from task 02): before calling `this._wc!.spawn(command, args)`, call `checker.isRuntimeSupported(command)`. If `false`, throw `UnsupportedRuntimeError` with the `reason` from `getUnsupportedReason(command)`.
- [ ] Export `RuntimeCompatibilityChecker`, `NativeDependencyChecker`, `RUNTIME_COMPAT_MATRIX`, and `NATIVE_PACKAGES` from `packages/sandbox/src/index.ts`.

## 3. Code Review
- [ ] Verify `RUNTIME_COMPAT_MATRIX` is defined as a `const` (not reconstructed on every call) to avoid performance overhead on hot `exec()` path.
- [ ] Verify `RuntimeCompatibilityChecker` and `NativeDependencyChecker` are stateless (no mutable instance state) so they can be shared safely across concurrent driver instances.
- [ ] Verify `UnsupportedRuntimeError.reason` always contains a human-readable explanation that can be surfaced to the user in the devs UI (no internal/opaque codes).
- [ ] Confirm that the `RUNTIME_COMPAT_MATRIX` and `NATIVE_PACKAGES` tables are easy to extend via a single-file edit — adding a new entry should require no other code changes.
- [ ] Verify the integration of the compat check in `WebContainerDriver.exec()` occurs **before** the WebContainer spawn call — not in a catch block — so no WebContainer API call is attempted for unsupported runtimes.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=syscall-compat.unit` and confirm all assertions pass.
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=webcontainer-driver.unit` (regression) and confirm all previously-passing tests still pass.
- [ ] Run `pnpm --filter @devs/sandbox tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/sandbox/docs/webcontainer-compatibility.md`:
  - Add a `## Supported Runtimes` table with columns: Runtime, Supported, Reason (if not supported), Fallback Driver.
  - Populate from `RUNTIME_COMPAT_MATRIX`.
  - Add a `## Native npm Packages` table with columns: Package, Native, Recommended Alternative.
  - Populate from `NATIVE_PACKAGES`.
- [ ] Update `packages/sandbox/README.md` with a `### Runtime Limitations` subsection under `## Drivers → WebContainerDriver` explaining which runtimes are unsupported and that DockerDriver is the fallback.
- [ ] Update `.agent/phase_2_decisions.md` with: "Non-JS runtimes (Python, Go, Rust) are not supported in WebContainerDriver. RuntimeCompatibilityChecker gates exec() calls and throws UnsupportedRuntimeError. Fallback to DockerDriver is the recommended path."

## 6. Automated Verification
- [ ] CI step: `pnpm --filter @devs/sandbox test -- --testPathPattern=syscall-compat.unit --ci` exits `0`.
- [ ] CI step: `pnpm --filter @devs/sandbox test -- --testPathPattern=webcontainer-driver.unit --ci` exits `0` (regression gate).
- [ ] Verify `RUNTIME_COMPAT_MATRIX` keys include at minimum `['node', 'python3', 'go', 'rustc', 'cargo']` by running: `node -e "const {RUNTIME_COMPAT_MATRIX} = require('./packages/sandbox/dist'); const req = ['node','python3','go','rustc','cargo']; req.forEach(k => { if (!RUNTIME_COMPAT_MATRIX[k]) { console.error('missing:', k); process.exit(1); } });"` after build.
