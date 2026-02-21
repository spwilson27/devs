# Task: SecretMasker Module Setup & Interface Definition (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [TAS-023], [3_MCP-TAS-023]

## 1. Initial Test Written

- [ ] Create `packages/secret-masker/src/__tests__/interfaces.test.ts`. Verify that `ISecretMasker` can be imported and that a concrete stub implementation satisfies its contract (i.e., it exposes `mask(input: string): IRedactionResult` and `maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream`).
- [ ] Write a test that constructs an `IRedactionResult` object with fields `{ masked: string; hits: IRedactionHit[]; hitCount: number }` and asserts all properties are accessible with the correct types.
- [ ] Write a test that an `IRedactionHit` object contains `{ pattern: string; matchedValue: string; replacedWith: string; position: number }`.
- [ ] Write an integration test that the `SecretMaskerFactory.create()` method returns an object satisfying `ISecretMasker`.
- [ ] All tests MUST fail initially (red phase).

## 2. Task Implementation

- [ ] Scaffold the `@devs/secret-masker` package at `packages/secret-masker/` using `pnpm init` (or the workspace equivalent). Ensure `package.json` sets `"name": "@devs/secret-masker"`, `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`.
- [ ] Create `packages/secret-masker/src/types.ts` defining:
  ```typescript
  export interface IRedactionHit {
    pattern: string;
    matchedValue: string;
    replacedWith: string;
    position: number;
  }
  export interface IRedactionResult {
    masked: string;
    hits: IRedactionHit[];
    hitCount: number;
  }
  export interface ISecretMasker {
    mask(input: string): IRedactionResult;
    maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream;
  }
  ```
- [ ] Create `packages/secret-masker/src/SecretMasker.ts` with a class `SecretMasker implements ISecretMasker`. Stub `mask()` to return `{ masked: input, hits: [], hitCount: 0 }` and `maskStream()` to return a pass-through `Transform` stream. This skeleton will be fleshed out in subsequent tasks.
- [ ] Create `packages/secret-masker/src/SecretMaskerFactory.ts` with `SecretMaskerFactory.create(): ISecretMasker` returning a `new SecretMasker()`.
- [ ] Create `packages/secret-masker/src/index.ts` exporting `ISecretMasker`, `IRedactionResult`, `IRedactionHit`, `SecretMasker`, and `SecretMaskerFactory`.
- [ ] Add `tsconfig.json` extending the root workspace config with `"outDir": "dist"` and `"rootDir": "src"`.
- [ ] Add `jest.config.ts` for the package using `ts-jest`.
- [ ] Register the package in the pnpm workspace `pnpm-workspace.yaml` if not already present.

## 3. Code Review

- [ ] Verify `ISecretMasker` is defined in `types.ts`, not co-located with the implementation—ensuring the interface is stable and importable without pulling in implementation details.
- [ ] Verify the `SecretMasker` class and `SecretMaskerFactory` are in separate files, following the Single Responsibility Principle.
- [ ] Confirm `index.ts` only re-exports public API symbols; no internal helpers are exposed.
- [ ] Confirm the package has zero runtime dependencies at this stage (only dev dependencies like `typescript`, `ts-jest`).
- [ ] Ensure no secrets, credentials, or hardcoded values are present in any file.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/secret-masker test` and confirm all interface tests pass (green phase).
- [ ] Run `pnpm --filter @devs/secret-masker build` and confirm `dist/index.d.ts` and `dist/index.js` are emitted without TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/secret-masker/.agent.md` documenting:
  - Module purpose: mandatory middleware filter that redacts secrets from all sandbox I/O streams before they are stored or returned to the LLM.
  - Exported public API: `ISecretMasker`, `IRedactionResult`, `IRedactionHit`, `SecretMasker`, `SecretMaskerFactory`.
  - Agentic Hooks: entry point is `SecretMaskerFactory.create()`; integrate via `maskStream()` for streaming pipelines or `mask()` for discrete string redaction.
  - Extension points: future tasks will inject regex patterns and entropy engine via constructor injection.
- [ ] Update `packages/secret-masker/README.md` with a brief description, install instructions, and a minimal usage example showing `SecretMaskerFactory.create().mask("token=abc123")`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/secret-masker test --coverage` and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/secret-masker build` and assert `dist/index.d.ts` exists: `test -f packages/secret-masker/dist/index.d.ts && echo PASS || echo FAIL`.
- [ ] Run `grep -r "ISecretMasker" packages/secret-masker/dist/index.d.ts` and confirm the type is exported in the compiled output.
