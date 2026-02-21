# Task: Package Setup and LanceDB Dependency Installation (Sub-Epic: 01_LanceDB_Vector_Store_Infrastructure)

## Covered Requirements
- [TAS-011], [2_TAS-REQ-015]

## 1. Initial Test Written

- [ ] In `packages/memory/`, create a test file at `src/__tests__/package-setup.test.ts`.
- [ ] Write a test that imports `lancedb` (`@lancedb/lancedb`) and asserts the module resolves without error.
- [ ] Write a test that imports `@google/generative-ai` and asserts the `GoogleGenerativeAI` class is exported.
- [ ] Write a test that verifies the package name in `packages/memory/package.json` is `@devs/memory`.
- [ ] Write a test that verifies `packages/memory/tsconfig.json` exists and contains `"moduleResolution": "bundler"` or `"node16"` (required for ESM LanceDB compatibility).
- [ ] Confirm all tests **fail** before implementation (Red Phase Gate).

## 2. Task Implementation

- [ ] Create the `packages/memory/` directory within the monorepo workspace if it does not already exist.
- [ ] Create `packages/memory/package.json` with the following structure:
  ```json
  {
    "name": "@devs/memory",
    "version": "0.1.0",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "scripts": {
      "build": "tsc",
      "test": "vitest run",
      "dev": "tsc --watch"
    },
    "dependencies": {
      "@lancedb/lancedb": "^0.12.0",
      "@google/generative-ai": "^0.21.0",
      "uuid": "^10.0.0"
    },
    "devDependencies": {
      "typescript": "^5.5.0",
      "vitest": "^2.0.0",
      "@types/uuid": "^10.0.0"
    }
  }
  ```
- [ ] Create `packages/memory/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true,
      "esModuleInterop": true
    },
    "include": ["src"],
    "exclude": ["node_modules", "dist"]
  }
  ```
- [ ] Create `packages/memory/src/index.ts` as a barrel file that re-exports nothing yet (empty module placeholder): `export {};`
- [ ] Run `pnpm install` (or `npm install`) from the monorepo root to install the new package and its dependencies.
- [ ] Ensure the `packages/memory` package is registered in the root `pnpm-workspace.yaml` (or equivalent) under the `packages:` list.

## 3. Code Review

- [ ] Verify `package.json` uses `"type": "module"` because `@lancedb/lancedb` is an ESM-first package.
- [ ] Verify `tsconfig.json` uses `"moduleResolution": "NodeNext"` — **not** `"node"` — to correctly resolve `.js` extension imports required by LanceDB.
- [ ] Confirm no CommonJS `require()` calls exist anywhere in the new package source.
- [ ] Confirm the `@devs/memory` package is listed in the monorepo workspace so other packages can reference it via `workspace:*`.
- [ ] Verify no secrets or API keys are hardcoded in any configuration file.

## 4. Run Automated Tests to Verify

- [ ] From `packages/memory/`, run: `pnpm test`
- [ ] All tests in `src/__tests__/package-setup.test.ts` must pass (Green Phase).
- [ ] Confirm zero TypeScript compilation errors: `pnpm build`

## 5. Update Documentation

- [ ] Update the root `README.md` (or `docs/architecture.md`) to list `@devs/memory` as a new internal package with a one-line description: "Long-term vector memory layer backed by LanceDB."
- [ ] Add an entry in `packages/memory/README.md` documenting the package purpose, installation steps, and key dependencies (`@lancedb/lancedb`, `@google/generative-ai`).
- [ ] Record in agent memory: "`@devs/memory` is the canonical package for LanceDB vector storage. All embedding and retrieval logic must live here."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/memory-pkg-test-results.json` and assert exit code is `0`.
- [ ] Run `node -e "import('@lancedb/lancedb').then(() => process.exit(0)).catch(() => process.exit(1))"` from `packages/memory/` and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/memory build` and assert `packages/memory/dist/index.js` exists.
