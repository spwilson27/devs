# Task: Establish tests/ Directory Structure for @devs/sandbox (Sub-Epic: 01_Module Foundation & Directory Structure)

## Covered Requirements
- [TAS-045]

## 1. Initial Test Written
- [ ] Create `packages/sandbox/tests/unit/test-structure.test.ts` that uses Node.js `fs` to assert the following paths exist relative to `packages/sandbox/tests/`:
  - `unit/` — directory for unit tests mirroring `src/` sub-modules.
  - `integration/` — directory for integration tests exercising driver interactions.
  - `agent/` — directory for agent-specific end-to-end behavioural tests.
  - `unit/providers/` — mirrors `src/providers/`.
  - `unit/drivers/` — mirrors `src/drivers/`.
  - `unit/filesystem/` — mirrors `src/filesystem/`.
  - `unit/network/` — mirrors `src/network/`.
  - `unit/utils/` — mirrors `src/utils/`.
  - `integration/docker/` — placeholder for Docker driver integration tests.
  - `integration/webcontainer/` — placeholder for WebContainer driver integration tests.
  - `agent/sandbox-lifecycle/` — placeholder for agent-driven sandbox lifecycle tests.
- [ ] Assert that a `vitest.config.ts` file exists at `packages/sandbox/` root and configures separate test projects (or include globs) for `unit`, `integration`, and `agent` tiers.
- [ ] Assert that the `vitest.config.ts` sets `coverage.provider` to `v8` and `coverage.thresholds.lines` to at least `80`.

## 2. Task Implementation
- [ ] Create the following directory tree under `packages/sandbox/tests/`:
  ```
  tests/
  ├── unit/
  │   ├── package-integrity.test.ts      (created in task 01)
  │   ├── tsconfig-integrity.test.ts     (created in task 01)
  │   ├── src-structure.test.ts          (created in task 02)
  │   ├── test-structure.test.ts         (this task)
  │   ├── providers/
  │   │   └── .gitkeep
  │   ├── drivers/
  │   │   └── .gitkeep
  │   ├── filesystem/
  │   │   └── .gitkeep
  │   ├── network/
  │   │   └── .gitkeep
  │   └── utils/
  │       └── .gitkeep
  ├── integration/
  │   ├── docker/
  │   │   └── .gitkeep
  │   └── webcontainer/
  │       └── .gitkeep
  └── agent/
      └── sandbox-lifecycle/
          └── .gitkeep
  ```
- [ ] Create `packages/sandbox/vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      projects: [
        {
          test: {
            name: 'unit',
            include: ['tests/unit/**/*.test.ts'],
            environment: 'node',
          },
        },
        {
          test: {
            name: 'integration',
            include: ['tests/integration/**/*.test.ts'],
            environment: 'node',
            testTimeout: 60_000,
          },
        },
        {
          test: {
            name: 'agent',
            include: ['tests/agent/**/*.test.ts'],
            environment: 'node',
            testTimeout: 300_000,
          },
        },
      ],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.d.ts'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
        },
      },
    },
  });
  ```
- [ ] Add `vitest` and `@vitest/coverage-v8` as `devDependencies` in `packages/sandbox/package.json` if not already present.
- [ ] Add a `"test:coverage"` script to `packages/sandbox/package.json`: `"vitest run --coverage"`.

## 3. Code Review
- [ ] Verify that `tests/` mirrors the `src/` directory tree — every `src/` sub-directory has a corresponding `tests/unit/<sub-dir>/` directory.
- [ ] Confirm that `integration/` and `agent/` directories are distinct from `unit/` — no unit tests should be placed inside `integration/` or `agent/`.
- [ ] Verify that `vitest.config.ts` uses named projects so CI can run each tier independently (e.g., `vitest --project unit`).
- [ ] Confirm that coverage thresholds are enforced only over `src/**/*.ts` and not over test files.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test --project unit` and confirm `test-structure.test.ts` passes.
- [ ] Run `pnpm --filter @devs/sandbox test --project integration` and confirm it completes (even if no tests are collected yet — collection with 0 tests should not fail).
- [ ] Run `pnpm --filter @devs/sandbox test --project agent` and confirm it completes similarly.

## 5. Update Documentation
- [ ] Update `packages/sandbox/README.md` with a **Testing** section describing:
  - The three test tiers (unit, integration, agent) and their purpose.
  - Commands to run each tier individually and all together.
  - Coverage threshold targets.
- [ ] Create `packages/sandbox/tests/README.md` with a brief description of the directory conventions and naming rules for test files.

## 6. Automated Verification
- [ ] Run the following assertion script from the monorepo root:
  ```bash
  node -e "
  const fs = require('fs');
  const base = 'packages/sandbox/tests';
  const dirs = ['unit','unit/providers','unit/drivers','unit/filesystem','unit/network','unit/utils','integration','integration/docker','integration/webcontainer','agent','agent/sandbox-lifecycle'];
  dirs.forEach(d => { if (!fs.existsSync(base + '/' + d)) throw new Error('Missing dir: ' + d); });
  if (!fs.existsSync('packages/sandbox/vitest.config.ts')) throw new Error('Missing vitest.config.ts');
  console.log('test structure OK');
  "
  ```
  and verify exit code is 0.
