# TypeScript Standard

## Overview

All packages in the `devs` monorepo use TypeScript 5.4+ with strict mode fully enabled. This document describes the configuration conventions and requirements for extending the base config.

## Base Configuration (`tsconfig.json`)

The root `tsconfig.json` is the single source of truth for compiler options. It is **not** used to build packages directly — it defines shared strictness rules that all packages inherit.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["packages/**/*", "src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Decisions

- **`strict: true`** — Enables the full TypeScript strictness suite, including `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, and more. This cannot be weakened in any package config.
- **`target: ES2022`** — Node.js >= 22 fully supports ES2022. Using a modern target avoids unnecessary polyfills.
- **`module: NodeNext` / `moduleResolution: NodeNext`** — Correct settings for ESM-first Node.js projects. Requires explicit `.js` extensions in relative `import` statements (even for `.ts` source files, the import path must use `.js` per the Node.js ESM spec).
- **`esModuleInterop: true`** — Required for clean interop with CommonJS packages.
- **`forceConsistentCasingInFileNames: true`** — Prevents cross-platform issues caused by case-insensitive file systems.
- **`skipLibCheck: true`** — Skips type checking of `.d.ts` files in `node_modules` for faster builds.

## Per-Package Configuration

Each package extends the root config and adds only package-specific output settings:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

The `packages/<name>/tsconfig.json` is used when building or type-checking an individual package.

### Rules for Package Configs

1. **Must extend `../../tsconfig.json`** — No exceptions.
2. **Must NOT set `strict: false`** — Weakening strict mode is forbidden.
3. **Must NOT set `strictNullChecks: false`** or **`noImplicitAny: false`** — These are included in `strict: true` and cannot be individually disabled.
4. **`outDir`** should be `./dist` and is gitignored.
5. **`rootDir`** should be `./src` to enforce clean source structure.

## Module Import Convention

With `module: NodeNext`, all relative imports require explicit `.js` extensions:

```typescript
// Correct
import { foo } from './utils.js';

// Wrong (will fail)
import { foo } from './utils';
```

This matches Node.js ESM resolution and prevents runtime errors on `.mjs`/`.cjs` interop.

## Verification

The configuration is verified by `tests/infrastructure/verify_typescript_strict.sh`, which checks:

- TypeScript >= 5.4 is installed.
- Root `tsconfig.json` has `strict: true` and does not disable `strictNullChecks` or `noImplicitAny`.
- Every package has a `tsconfig.json` that extends the root config and does not override strict settings.

Run via the project task runner:

```bash
./do test     # Includes TypeScript strict verification
./do build    # Type-checks the entire monorepo (pnpm exec tsc --noEmit)
```

## Adding a New Package

1. Create `packages/<name>/tsconfig.json` with the standard template above.
2. Create `packages/<name>/src/index.ts` as the package entry point.
3. Add the package name to the `PACKAGES` array in `tests/infrastructure/verify_typescript_strict.sh`. The package list is hardcoded — it does not auto-discover from `pnpm-workspace.yaml`.
4. Also add the package to `pnpm-workspace.yaml` and `tests/infrastructure/verify_monorepo.sh` (see `docs/infrastructure/monorepo_setup.md`).
