# Task: Define `@devs/memory` Package Structure and Tiered Memory Interfaces (Sub-Epic: 03_Tiered_Memory_Architecture)

## Covered Requirements
- [TAS-100], [TAS-081], [1_PRD-REQ-GOAL-007], [4_USER_FEATURES-REQ-017]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/interfaces.test.ts`.
- [ ] Write unit tests that verify the exported TypeScript interfaces and types compile correctly and have the expected shape:
  - `IShortTermMemory`: must expose `get(key: string): unknown`, `set(key: string, value: unknown): void`, `clear(): void`, and `snapshot(): Record<string, unknown>`.
  - `IMediumTermMemory`: must expose `append(entry: MemoryEntry): Promise<void>`, `query(filter: MemoryFilter): Promise<MemoryEntry[]>`, and `prune(olderThan: Date): Promise<number>`.
  - `ILongTermMemory`: must expose `upsert(doc: MemoryDocument): Promise<void>`, `search(query: string, topK: number): Promise<MemoryDocument[]>`, and `delete(id: string): Promise<void>`.
  - `ITieredMemoryManager`: must expose `shortTerm: IShortTermMemory`, `mediumTerm: IMediumTermMemory`, `longTerm: ILongTermMemory`, `promote(entry: MemoryEntry, tier: 'medium' | 'long'): Promise<void>`, and `flush(): Promise<void>`.
- [ ] Write tests confirming that `MemoryEntry`, `MemoryFilter`, and `MemoryDocument` types contain the expected mandatory fields (`id`, `content`, `createdAt`, `tags`).
- [ ] All tests must fail (red) at this stage because no implementation exists yet.

## 2. Task Implementation
- [ ] Scaffold the `packages/memory` package in the TypeScript monorepo:
  - Run `mkdir -p packages/memory/src/{short-term,medium-term,long-term,__tests__}`.
  - Add `packages/memory/package.json` with `name: "@devs/memory"`, `version: "0.1.0"`, `main: "dist/index.js"`, `types: "dist/index.d.ts"`, and scripts for `build` and `test`.
  - Add `packages/memory/tsconfig.json` extending the root tsconfig, outputting to `dist/`.
- [ ] Create `packages/memory/src/types.ts` defining:
  ```typescript
  export interface MemoryEntry {
    id: string;
    content: string;
    createdAt: Date;
    tags: string[];
    metadata?: Record<string, unknown>;
  }

  export interface MemoryFilter {
    tags?: string[];
    since?: Date;
    until?: Date;
    limit?: number;
  }

  export interface MemoryDocument {
    id: string;
    content: string;
    embedding?: number[];
    createdAt: Date;
    tags: string[];
    metadata?: Record<string, unknown>;
  }
  ```
- [ ] Create `packages/memory/src/interfaces.ts` exporting `IShortTermMemory`, `IMediumTermMemory`, `ILongTermMemory`, and `ITieredMemoryManager` as described in the test phase.
- [ ] Create `packages/memory/src/index.ts` re-exporting everything from `types.ts` and `interfaces.ts`.
- [ ] Wire the package into the monorepo root `package.json` workspaces array.

## 3. Code Review
- [ ] Verify that all interfaces are pure TypeScript (no concrete implementations in this file).
- [ ] Confirm there are no circular imports between `types.ts` and `interfaces.ts`.
- [ ] Confirm `ITieredMemoryManager` depends only on the other three interfaces, not on concrete classes.
- [ ] Verify `tsconfig.json` uses `"strict": true` and `"noImplicitAny": true`.
- [ ] Ensure the package can be imported as `import { ITieredMemoryManager } from '@devs/memory'` from other packages.

## 4. Run Automated Tests to Verify
- [ ] From the monorepo root, run: `npm run test --workspace=packages/memory`
- [ ] Confirm all interface shape tests pass (green).
- [ ] Run `npm run build --workspace=packages/memory` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/memory.agent.md` documenting:
  - The purpose of the `@devs/memory` package.
  - A description of all three memory tiers (short, medium, long) and their use cases.
  - The `ITieredMemoryManager` contract and its `promote` / `flush` semantics.
- [ ] Update the root `README.md` (or monorepo architecture doc) to list `@devs/memory` as a new package.

## 6. Automated Verification
- [ ] Run `npm run build --workspace=packages/memory 2>&1 | grep -c "error TS"` and assert the output is `0`.
- [ ] Run `npm run test --workspace=packages/memory -- --reporter=json` and assert `numFailedTests` is `0` in the JSON output.
- [ ] Run `ls packages/memory/src/memory.agent.md` and assert the file exists.
