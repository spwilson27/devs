# Task: Establish src/ Directory Structure for @devs/sandbox (Sub-Epic: 01_Module Foundation & Directory Structure)

## Covered Requirements
- [TAS-099], [TAS-045]

## 1. Initial Test Written
- [ ] Create `packages/sandbox/tests/unit/src-structure.test.ts` that uses Node.js `fs` to assert the following paths exist relative to `packages/sandbox/src/`:
  - `index.ts` — public barrel export file.
  - `providers/index.ts` — barrel for SandboxProvider abstraction.
  - `drivers/index.ts` — barrel for concrete driver implementations.
  - `filesystem/index.ts` — barrel for FilesystemManager.
  - `network/index.ts` — barrel for Network Egress components.
  - `types/index.ts` — barrel for shared TypeScript types and interfaces.
  - `utils/index.ts` — barrel for internal utility functions.
- [ ] Assert that `packages/sandbox/src/index.ts` re-exports everything from each sub-barrel (providers, drivers, filesystem, network, types, utils) using named exports, so downstream consumers have a single import entry point.
- [ ] Assert that each barrel file (`providers/index.ts`, `drivers/index.ts`, etc.) is non-empty (i.e., contains at least a placeholder comment or a `// TODO` export stub) so tree-shaking tools can resolve the module graph.

## 2. Task Implementation
- [ ] Create the following directory tree under `packages/sandbox/src/`:
  ```
  src/
  ├── index.ts
  ├── providers/
  │   └── index.ts
  ├── drivers/
  │   └── index.ts
  ├── filesystem/
  │   └── index.ts
  ├── network/
  │   └── index.ts
  ├── types/
  │   └── index.ts
  └── utils/
      └── index.ts
  ```
- [ ] Populate `src/types/index.ts` with the foundational TypeScript interface stubs to be implemented in later sub-epics:
  ```ts
  /** Represents the result of a sandbox command execution. */
  export interface SandboxExecResult {
    stdout: string;
    stderr: string;
    exitCode: number;
  }

  /** Options used to provision a sandbox environment. */
  export interface SandboxProvisionOptions {
    workdir: string;
    env?: Record<string, string>;
    timeoutMs?: number;
  }
  ```
- [ ] Populate `src/index.ts` with re-exports:
  ```ts
  export * from './types';
  export * from './providers';
  export * from './drivers';
  export * from './filesystem';
  export * from './network';
  export * from './utils';
  ```
- [ ] Add placeholder comments to the remaining barrels (`providers/index.ts`, `drivers/index.ts`, `filesystem/index.ts`, `network/index.ts`, `utils/index.ts`) noting what will be implemented in subsequent sub-epics.

## 3. Code Review
- [ ] Confirm that `src/index.ts` does not contain any implementation logic — it is a barrel only.
- [ ] Verify that all type definitions in `src/types/index.ts` use `interface` for object shapes and `type` for unions/aliases, following the project's TypeScript conventions.
- [ ] Confirm that no directory contains circular re-exports (e.g., `providers/index.ts` must not re-import from `src/index.ts`).
- [ ] Verify the directory structure matches the TAS module map for `@devs/sandbox` exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm `src-structure.test.ts` passes.
- [ ] Run `pnpm --filter @devs/sandbox build` and confirm TypeScript compiles the `src/` tree to `dist/` without errors.
- [ ] Inspect `dist/` output to confirm `dist/index.d.ts` is generated and exports `SandboxExecResult` and `SandboxProvisionOptions`.

## 5. Update Documentation
- [ ] Update `packages/sandbox/README.md` with a source tree diagram (Markdown code block) reflecting the newly created structure and a one-line description for each directory.
- [ ] Add a JSDoc comment to every exported interface in `src/types/index.ts` explaining its purpose and which driver/component will implement it.

## 6. Automated Verification
- [ ] Run the following assertion script from the monorepo root:
  ```bash
  node -e "
  const fs = require('fs');
  const base = 'packages/sandbox/src';
  const required = ['index.ts','providers/index.ts','drivers/index.ts','filesystem/index.ts','network/index.ts','types/index.ts','utils/index.ts'];
  required.forEach(p => { if (!fs.existsSync(base + '/' + p)) throw new Error('Missing: ' + p); });
  console.log('src structure OK');
  "
  ```
  and verify exit code is 0.
