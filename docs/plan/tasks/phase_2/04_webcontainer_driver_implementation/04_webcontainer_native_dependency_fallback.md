# Task: WebContainer Native Dependency Detection & Fallback Strategy (Sub-Epic: 04_WebContainer Driver Implementation)

## Covered Requirements
- [UNKNOWN-401], [9_ROADMAP-SPIKE-001]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/native-dependency-install.unit.test.ts`, write unit tests (mocking `WebContainer.spawn`):
  - `WebContainerPackageInstaller.install(['lodash'])` calls `npm install lodash` and resolves with `{ installed: ['lodash'], failed: [], warnings: [] }`.
  - `WebContainerPackageInstaller.install(['better-sqlite3'])` — without attempting install — resolves with `{ installed: [], failed: [{ packageName: 'better-sqlite3', reason: '...', alternative: 'sql.js' }], warnings: [] }`.
  - `WebContainerPackageInstaller.install(['lodash', 'sharp'])` resolves with `lodash` installed and `sharp` in `failed` with `alternative: null`.
  - `WebContainerPackageInstaller.install(['bcrypt'])` resolves with `bcrypt` in `failed` with `alternative: 'bcryptjs'` and `warnings` containing a user-facing message recommending the alternative.
  - Calling `install([])` resolves immediately with empty arrays (no npm spawn).
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/native-dependency-install.integration.test.ts` (skipped in unit CI):
  - Boot a real WebContainer.
  - Call `WebContainerPackageInstaller.install(['lodash'])` and assert `lodash` appears in `/node_modules/lodash/package.json`.
  - Call `WebContainerPackageInstaller.install(['sql.js'])` as the recommended alternative for `better-sqlite3` and assert it installs successfully.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/drivers/webcontainer/package-installer.ts` exporting:
  ```ts
  export interface PackageInstallResult {
    installed: string[];
    failed: Array<{ packageName: string; reason: string; alternative: string | null }>;
    warnings: string[];
  }

  export class WebContainerPackageInstaller {
    constructor(private readonly wc: WebContainer, private readonly checker: NativeDependencyChecker) {}

    async install(packages: string[]): Promise<PackageInstallResult>
  }
  ```
  Implementation details:
  1. Partition `packages` into `safe` (not native) and `blocked` (native) using `NativeDependencyChecker.requiresNativeCompilation()`.
  2. For each `blocked` package, populate `failed` entry with `reason` and `alternative`.
  3. If `alternative` is non-null, add a `warnings` entry: `"Package '{name}' is not supported in WebContainers. Consider using '{alternative}' instead."`.
  4. For `safe` packages (if any), spawn `npm install --prefer-offline --no-audit --no-fund {safe.join(' ')}` inside the WebContainer.
  5. Capture stdout/stderr of the npm process; on non-zero exit code, move all `safe` packages to `failed` with `reason: 'npm install failed: {stderr}'`.
  6. Return the `PackageInstallResult`.
- [ ] Integrate `WebContainerPackageInstaller` into `WebContainerDriver`: add an optional `installPackages(packages: string[]): Promise<PackageInstallResult>` method to the driver that delegates to `WebContainerPackageInstaller`.
- [ ] Export `WebContainerPackageInstaller` and `PackageInstallResult` from `packages/sandbox/src/index.ts`.
- [ ] Add `PackageInstallResult` type to the driver registry type map so callers can type-check the result of `installPackages()`.

## 3. Code Review
- [ ] Verify the native-package check happens **before** any npm spawn — no network traffic should be initiated for known-blocked packages.
- [ ] Verify `warnings` are structured for display in the devs UI (strings, not Error objects) so they can be rendered directly.
- [ ] Verify `npm install` is invoked with `--prefer-offline --no-audit --no-fund` flags to reduce noise and network usage inside WebContainer.
- [ ] Verify `PackageInstallResult.failed` entries always have a non-empty `reason` string — never an empty string or `undefined`.
- [ ] Confirm `WebContainerPackageInstaller` accepts `NativeDependencyChecker` via constructor injection (not direct import) to enable unit testing without file system access.
- [ ] Confirm the implementation handles an empty `packages` array without spawning any process (fast path).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=native-dependency-install.unit` and confirm all assertions pass.
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=webcontainer-driver.unit` (regression) and confirm no previously-passing tests broke.
- [ ] Run `pnpm --filter @devs/sandbox tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/sandbox lint` and confirm zero violations.

## 5. Update Documentation
- [ ] Update `packages/sandbox/docs/webcontainer-compatibility.md`:
  - Add a `## Package Installation` section explaining the pre-flight native-dependency check.
  - Add a `### Known Blocked Packages` table sourced from `NATIVE_PACKAGES` (populated by task 03).
  - Document the `PackageInstallResult` type with field descriptions.
- [ ] Update `packages/sandbox/README.md` with a `### Package Installation` subsection under `## Drivers → WebContainerDriver` showing a code example of `driver.installPackages(['lodash', 'sql.js'])`.
- [ ] Update `.agent/phase_2_decisions.md` with: "WebContainerPackageInstaller gates native npm packages before install. Blocked packages surface user-facing warnings with alternative recommendations. No network traffic is initiated for known-blocked packages."

## 6. Automated Verification
- [ ] CI step: `pnpm --filter @devs/sandbox test -- --testPathPattern=native-dependency-install.unit --ci` exits `0`.
- [ ] CI step: `pnpm --filter @devs/sandbox test -- --testPathPattern=webcontainer-driver.unit --ci` exits `0` (regression).
- [ ] Verify `WebContainerPackageInstaller` is exported from the package by running: `node -e "const {WebContainerPackageInstaller} = require('./packages/sandbox/dist'); if (!WebContainerPackageInstaller) process.exit(1);"` after build.
- [ ] Verify that `install(['better-sqlite3'])` never calls `npm install` by running the unit test with a spy assertion on `wc.spawn` call count (already part of unit test suite above).
