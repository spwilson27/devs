# Task: Define `SandboxProvider` Abstract Interface and `@devs/sandbox` Package Scaffold (Sub-Epic: 02_Sandbox Abstraction Layer)

## Covered Requirements
- [TAS-080], [2_TAS-REQ-024], [TAS-013]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/__tests__/SandboxProvider.spec.ts`, write unit tests that:
  - Verify that a concrete subclass of `SandboxProvider` **must** implement the following abstract methods or TypeScript will throw a compile error: `provision(): Promise<SandboxContext>`, `exec(ctx: SandboxContext, cmd: string, args: string[], opts?: ExecOptions): Promise<ExecResult>`, `destroy(ctx: SandboxContext): Promise<void>`.
  - Verify that instantiating `SandboxProvider` directly (without subclassing) is not possible (abstract class enforcement — test via TypeScript `tsc --noEmit` compilation check).
  - Write a test using a `MockSandboxProvider` (a minimal concrete implementation) that:
    - Calls `provision()` and receives a `SandboxContext` with `id: string`, `workdir: string`, `status: 'running' | 'stopped' | 'error'`.
    - Calls `exec(ctx, 'echo', ['hello'])` and receives `ExecResult` with `stdout: string`, `stderr: string`, `exitCode: number`.
    - Calls `destroy(ctx)` and verifies the promise resolves without error.
  - Write a test verifying that `SandboxContext.status` transitions are valid (only `'running'`, `'stopped'`, `'error'` are accepted values — use a Zod schema or similar runtime validation).

- [ ] In `packages/sandbox/src/__tests__/types.spec.ts`, write compile-time type tests using `tsd` (or `expect-type`) verifying:
  - `SandboxContext` has fields: `id: string`, `workdir: string`, `status: SandboxStatus`, `createdAt: Date`.
  - `ExecOptions` has optional fields: `timeoutMs?: number`, `env?: Record<string, string>`, `cwd?: string`.
  - `ExecResult` has fields: `stdout: string`, `stderr: string`, `exitCode: number`, `durationMs: number`.

## 2. Task Implementation

- [ ] Bootstrap the `@devs/sandbox` package:
  - Create `packages/sandbox/package.json` with `name: "@devs/sandbox"`, `version: "0.1.0"`, `main: "dist/index.js"`, `types: "dist/index.d.ts"`, and dev/peer dependencies on `typescript`, `zod`.
  - Create `packages/sandbox/tsconfig.json` extending the root `tsconfig.base.json` with `strict: true`, `declaration: true`, `outDir: "dist"`, `rootDir: "src"`.
  - Create `packages/sandbox/src/index.ts` as the public barrel export.

- [ ] Define shared types in `packages/sandbox/src/types.ts`:
  ```typescript
  export type SandboxStatus = 'running' | 'stopped' | 'error';

  export interface SandboxContext {
    id: string;
    workdir: string;
    status: SandboxStatus;
    createdAt: Date;
  }

  export interface ExecOptions {
    timeoutMs?: number;
    env?: Record<string, string>;
    cwd?: string;
  }

  export interface ExecResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    durationMs: number;
  }
  ```

- [ ] Implement `SandboxProvider` abstract class in `packages/sandbox/src/SandboxProvider.ts`:
  ```typescript
  import type { SandboxContext, ExecOptions, ExecResult } from './types';

  export abstract class SandboxProvider {
    abstract provision(): Promise<SandboxContext>;
    abstract exec(ctx: SandboxContext, cmd: string, args: string[], opts?: ExecOptions): Promise<ExecResult>;
    abstract destroy(ctx: SandboxContext): Promise<void>;
  }
  ```

- [ ] Create Zod schema for runtime validation of `SandboxContext` in `packages/sandbox/src/schemas.ts`, with a `sandboxStatusSchema` and `sandboxContextSchema` exported for use by drivers.

- [ ] Export all public types and the `SandboxProvider` class from `packages/sandbox/src/index.ts`.

- [ ] Add `@devs/sandbox` to the monorepo workspace configuration (e.g., `pnpm-workspace.yaml` or `package.json` workspaces array).

## 3. Code Review

- [ ] Verify that `SandboxProvider` is declared `abstract` and cannot be instantiated directly.
- [ ] Verify that all method signatures use `Promise`-based async contracts (no synchronous methods that could block the event loop).
- [ ] Verify that `SandboxContext.id` is suitable for use as a unique key across concurrent sandbox instances (string UUID format is acceptable but must be documented).
- [ ] Verify that `ExecOptions.timeoutMs` is consistently optional with a documented default (e.g., 300,000 ms = 5 minutes per `[1_PRD-REQ-SEC-010]` — even though that requirement is not in scope, the timeout field must be present and documented for future enforcement).
- [ ] Verify that the `packages/sandbox` package has no circular imports and exports only what is listed in `src/index.ts`.
- [ ] Confirm TypeScript `strict` mode is enabled and all types compile without `any` or `unknown` escape hatches.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all tests in `src/__tests__/SandboxProvider.spec.ts` and `src/__tests__/types.spec.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox build` and confirm `dist/` is generated with `.js` and `.d.ts` files.
- [ ] Run `tsc --noEmit` within `packages/sandbox` to confirm no TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/sandbox/README.md` documenting:
  - The purpose of `@devs/sandbox`: the multi-platform sandbox abstraction.
  - The `SandboxProvider` interface contract (each method, its parameters, return types, and expected behavior).
  - The `SandboxContext`, `ExecOptions`, and `ExecResult` types with field descriptions.
  - Instructions for creating a new driver by extending `SandboxProvider`.
- [ ] Update the monorepo root `README.md` (or `docs/architecture.md` if it exists) to reference `@devs/sandbox` as the sandbox abstraction package.
- [ ] Update `.agent/memory.md` (agent memory file) to record: "The `SandboxProvider` abstract class is the single extension point for all sandbox drivers. New execution environments MUST subclass `SandboxProvider`. The package is `@devs/sandbox`."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage` and verify that line coverage for `src/SandboxProvider.ts` and `src/types.ts` is ≥ 90%.
- [ ] Run `node -e "const s = require('./packages/sandbox/dist/index.js'); console.assert(typeof s.SandboxProvider === 'function', 'SandboxProvider must be exported')"` from the repo root and confirm it exits 0.
- [ ] Confirm the compiled `dist/SandboxProvider.d.ts` contains the abstract keyword by running: `grep -q 'abstract' packages/sandbox/dist/SandboxProvider.d.ts && echo OK`.
