# Task: Initialize @devs/sandbox Package in Monorepo (Sub-Epic: 01_Module Foundation & Directory Structure)

## Covered Requirements
- [9_ROADMAP-PHASE-002], [TAS-099]

## 1. Initial Test Written
- [ ] Create `packages/sandbox/tests/unit/package-integrity.test.ts` that asserts:
  - The `package.json` name is exactly `@devs/sandbox`.
  - The `package.json` contains a `main` field pointing to `dist/index.js`.
  - The `package.json` contains a `types` field pointing to `dist/index.d.ts`.
  - `exports["."]` is defined with `import` and `require` sub-conditions.
  - The `engines` field requires Node.js `>=22`.
  - The package has `@devs/core` listed as a peer dependency.
- [ ] Create `packages/sandbox/tests/unit/tsconfig-integrity.test.ts` that asserts:
  - `tsconfig.json` extends from the root `tsconfig.base.json`.
  - `compilerOptions.strict` is `true`.
  - `compilerOptions.outDir` is `./dist`.
  - `compilerOptions.rootDir` is `./src`.
  - `compilerOptions.declaration` is `true`.

## 2. Task Implementation
- [ ] Inside `packages/sandbox/`, create `package.json`:
  ```json
  {
    "name": "@devs/sandbox",
    "version": "0.0.1",
    "private": true,
    "description": "Isolated execution abstraction for shell commands and file I/O.",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "exports": {
      ".": {
        "import": "./dist/index.js",
        "require": "./dist/index.cjs"
      }
    },
    "engines": { "node": ">=22" },
    "scripts": {
      "build": "tsc -p tsconfig.json",
      "test": "vitest run",
      "lint": "eslint src tests --ext .ts",
      "typecheck": "tsc --noEmit"
    },
    "peerDependencies": {
      "@devs/core": "workspace:*"
    },
    "devDependencies": {
      "typescript": "^5.4.0",
      "vitest": "^1.6.0"
    }
  }
  ```
- [ ] Create `packages/sandbox/tsconfig.json` extending the root config:
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src",
      "declaration": true,
      "declarationMap": true,
      "strict": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests"]
  }
  ```
- [ ] Add the `packages/sandbox` entry to the root `pnpm-workspace.yaml` if not already present.
- [ ] Run `pnpm install` from the monorepo root to register the package.

## 3. Code Review
- [ ] Confirm the package name `@devs/sandbox` matches the monorepo convention used by other packages (e.g., `@devs/core`, `@devs/agents`).
- [ ] Verify no absolute path references exist in `tsconfig.json`; all paths must be relative.
- [ ] Confirm `strict: true` is set and not overridden downstream.
- [ ] Confirm there are no extraneous runtime dependencies; this package must not bundle Docker SDK or WebContainer SDK at this stage (those belong in the driver implementations in a later sub-epic).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` from the monorepo root and confirm all package-integrity tests pass.
- [ ] Run `pnpm --filter @devs/sandbox typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/sandbox/README.md` documenting:
  - The purpose of `@devs/sandbox` (isolated execution abstraction).
  - The planned internal architecture (SandboxProvider interface, DockerDriver, WebContainerDriver).
  - How to build and test the package locally.
- [ ] Update the root `README.md` package listing to include `@devs/sandbox` with a one-line description.

## 6. Automated Verification
- [ ] Execute `node -e "const p = require('./packages/sandbox/package.json'); console.assert(p.name === '@devs/sandbox'); console.assert(p.engines.node === '>=22');"` and verify it exits with code 0.
- [ ] Run `pnpm ls --filter @devs/sandbox` and confirm the package is listed as a workspace member.
