# Task: Define Tiered Memory Interfaces and Module Scaffold (Sub-Epic: 04_Short_and_Medium_Term_Memory)

## Covered Requirements
- [TAS-016], [TAS-017], [TAS-018]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/interfaces.test.ts`, write unit tests that:
  - Import `IShortTermMemory`, `IMediumTermMemory`, `ILongTermMemory` from `@devs/memory/interfaces`.
  - Assert that a concrete stub implementation of `IShortTermMemory` satisfies the required method signatures: `append(entry: ContextEntry): void`, `getWindow(lastN?: number): ContextEntry[]`, `clear(): void`, `tokenCount(): number`.
  - Assert that a concrete stub implementation of `IMediumTermMemory` satisfies: `logTask(summary: TaskSummary): Promise<void>`, `getEpicSummaries(epicId: string): Promise<TaskSummary[]>`, `logFailedStrategy(record: StrategyFailure): Promise<void>`, `getFailedStrategies(epicId: string): Promise<StrategyFailure[]>`.
  - Assert that a concrete stub implementation of `ILongTermMemory` satisfies: `upsert(doc: MemoryDocument): Promise<void>`, `search(query: string, topK?: number): Promise<MemoryDocument[]>`, `prune(beforeTimestamp: number): Promise<void>`.
  - Use TypeScript's structural typing; tests should fail to compile if a method signature is incorrect.
- [ ] Write a test in `packages/memory/src/__tests__/types.test.ts` that validates the shape of `ContextEntry`, `TaskSummary`, `StrategyFailure`, and `MemoryDocument` type objects using `zod` schemas.

## 2. Task Implementation
- [ ] Create `packages/memory/` as a new workspace package with `package.json` (`name: "@devs/memory"`, `main: "dist/index.js"`, `types: "dist/index.d.ts"`).
- [ ] Create `packages/memory/tsconfig.json` extending the root tsconfig with `composite: true` and `outDir: "dist"`.
- [ ] Create `packages/memory/src/types.ts` defining and exporting:
  ```ts
  export type ContextEntry = {
    id: string;          // UUID
    timestamp: number;   // Unix ms
    role: 'user' | 'assistant' | 'tool';
    content: string;
    toolName?: string;
    tokenEstimate: number;
  };

  export type TaskSummary = {
    taskId: string;
    epicId: string;
    timestamp: number;
    summary: string;
    outcome: 'success' | 'failure' | 'skipped';
    tokenCost: number;
  };

  export type StrategyFailure = {
    id: string;
    epicId: string;
    taskId: string;
    timestamp: number;
    strategy: string;
    reason: string;
  };

  export type MemoryDocument = {
    id: string;
    content: string;
    embedding?: number[];
    metadata: Record<string, string | number | boolean>;
    timestamp: number;
  };
  ```
- [ ] Create `packages/memory/src/schemas.ts` with `zod` schemas that mirror each type above: `ContextEntrySchema`, `TaskSummarySchema`, `StrategyFailureSchema`, `MemoryDocumentSchema`.
- [ ] Create `packages/memory/src/interfaces.ts` defining and exporting the three TypeScript interfaces: `IShortTermMemory`, `IMediumTermMemory`, `ILongTermMemory` with the exact method signatures specified in the test step above.
- [ ] Create `packages/memory/src/index.ts` that re-exports everything from `types`, `schemas`, and `interfaces`.
- [ ] Add `@devs/memory` to the root `pnpm-workspace.yaml` or equivalent monorepo configuration.
- [ ] Install `zod` as a dependency in `packages/memory/package.json`.

## 3. Code Review
- [ ] Verify that all three interfaces (`IShortTermMemory`, `IMediumTermMemory`, `ILongTermMemory`) are exported from the package root and accessible via `import { IShortTermMemory } from '@devs/memory'`.
- [ ] Verify that `ContextEntry`, `TaskSummary`, `StrategyFailure`, and `MemoryDocument` have no `any` types and are fully typed.
- [ ] Verify that `zod` schemas in `schemas.ts` exactly match the TypeScript types in `types.ts` (no missing fields).
- [ ] Verify that no implementation logic exists in this task's files—only interface/type/schema definitions.
- [ ] Verify the `tsconfig.json` uses `strict: true`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` and confirm all tests in `interfaces.test.ts` and `types.test.ts` pass.
- [ ] Run `pnpm --filter @devs/memory build` (TypeScript compilation) and confirm zero type errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/interfaces.agent.md` documenting:
  - The purpose of each interface.
  - The contract each method must fulfill.
  - The data flow between tiers (short → medium promotion, medium → long promotion).
- [ ] Update the root `README.md` to reference `@devs/memory` as a workspace package under "Packages".

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/memory_interfaces_test_results.json` and assert that the JSON output contains `"numFailedTests": 0`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` and assert exit code is `0`.
