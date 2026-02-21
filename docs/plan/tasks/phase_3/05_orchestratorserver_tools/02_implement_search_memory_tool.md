# Task: Implement `search_memory` Tool on OrchestratorServer (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [3_MCP-TAS-077]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/search_memory.test.ts`, write unit tests for the `search_memory` MCP tool handler:
  - Test: calling the tool with `{ query: "authentication", limit: 5 }` returns an array of up to 5 `MemoryResult` objects, each containing `{ id: string, content: string, score: number, type: MemoryType }`.
  - Test: `limit` defaults to 10 when omitted.
  - Test: the `type` filter (`"decision"`, `"requirement"`, `"observation"`) correctly restricts results to only that memory type.
  - Test: an empty query string returns a structured MCP validation error.
  - Test: when the vector store returns zero results, the handler returns an empty array (not an error).
  - Test: the tool is registered with name `"search_memory"`, with JSON Schema `{ query: string, limit?: number, type?: MemoryType }`.
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/search_memory.integration.test.ts`, write integration tests:
  - Seed a mock LanceDB vector store (use `@devs/memory` test harness) with 20 known entries of mixed types.
  - Call `search_memory` via MCP SDK client with various queries and type filters.
  - Assert semantic similarity scores are between 0 and 1 and results are sorted by descending score.
  - Assert sub-second response latency (<1000 ms) for a 20-entry store.

## 2. Task Implementation
- [ ] Define `MemoryType` and `MemoryResult` in `packages/core/src/mcp/orchestrator/types.ts`:
  ```typescript
  export type MemoryType = "decision" | "requirement" | "observation" | "task";
  export interface MemoryResult {
    id: string;
    content: string;
    score: number;
    type: MemoryType;
    metadata?: Record<string, unknown>;
  }
  ```
- [ ] Create `packages/core/src/mcp/orchestrator/tools/search_memory.ts`:
  - Export `registerSearchMemoryTool(server: McpServer, vectorStore: VectorStore)`.
  - Zod schema: `z.object({ query: z.string().min(1), limit: z.number().int().positive().optional().default(10), type: z.enum(["decision","requirement","observation","task"]).optional() })`.
  - Handler:
    1. Calls `vectorStore.search(query, { limit, filter: type ? { type } : undefined })` from the `@devs/memory` package.
    2. Maps results to `MemoryResult[]` sorted by descending `score`.
    3. Returns the array directly (empty array on no results).
    4. Throws an `McpError` with code `VECTOR_STORE_UNAVAILABLE` if the vector store throws a connection error.
- [ ] Register `search_memory` in `packages/core/src/mcp/orchestrator/tools/index.ts`.

## 3. Code Review
- [ ] Confirm Zod `.min(1)` on `query` prevents empty-string searches from reaching the vector store.
- [ ] Confirm the `VectorStore` dependency is injected (not imported as a singleton) so it can be mocked in tests.
- [ ] Confirm `MemoryResult` shape exactly matches the spec table in `[3_MCP-TAS-077]`.
- [ ] Confirm the `type` filter is applied at the vector store query level (not post-filtered in JS) to avoid unnecessary data transfer.
- [ ] Confirm no secrets or API keys are hardcoded; vector store connection config comes from the injected `VectorStore` instance.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=search_memory` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=search_memory.integration` and confirm all integration tests pass.
- [ ] Run the full `@devs/core` test suite and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/search_memory.agent.md` documenting:
  - Purpose, `MemoryType` enum values and their semantics.
  - Vector store interface contract (`VectorStore` from `@devs/memory`).
  - Error codes (`VECTOR_STORE_UNAVAILABLE`).
  - Example MCP call and response JSON.
- [ ] Update `packages/core/src/mcp/orchestrator/tools/index.agent.md` with an entry for `search_memory`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=search_memory` and assert statement coverage ≥ 90% for `search_memory.ts`.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Assert `search_memory` appears in the orchestrator server's tool manifest at runtime.
