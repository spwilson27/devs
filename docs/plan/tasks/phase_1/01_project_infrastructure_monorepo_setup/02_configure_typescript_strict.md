# Task: Configure Strict TypeScript & Project-wide Meta-config (Sub-Epic: 01_Project Infrastructure & Monorepo Setup)

## Covered Requirements
- [TAS-005], [1_PRD-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create a test script `tests/infrastructure/verify_typescript_strict.sh` that:
  - Checks if `tsconfig.json` exists in the root.
  - Verifies that `"strict": true` is enabled in the root `tsconfig.json`.
  - Verifies that `"strictNullChecks": true` and `"noImplicitAny": true` are enabled.
  - Verifies each package has its own `tsconfig.json` extending the root config.
  - Verifies that `tsc --version` is >= 5.4.

## 2. Task Implementation
- [ ] Create root `tsconfig.json` with the following:
  - `compilerOptions`: `strict: true`, `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `esModuleInterop: true`, `forceConsistentCasingInFileNames: true`, `skipLibCheck: true`.
  - `include: ["packages/**/*", "src/**/*"]`.
  - `exclude: ["node_modules", "dist"]`.
- [ ] For each package (`core`, `agents`, `sandbox`, `memory`, `mcp`, `cli`, `vscode`), create a `tsconfig.json` that:
  - `extends: "../../tsconfig.json"`.
  - `compilerOptions`: `outDir: "./dist"`, `rootDir: "./src"`.
- [ ] Ensure that architectural debt is minimized by enforcing strict typing from the very beginning.

## 3. Code Review
- [ ] Review each package's `tsconfig.json` to ensure there are no overrides that weaken the strictness.
- [ ] Confirm that `dist/` directories are excluded from version control in `.gitignore`.
- [ ] Ensure `1_PRD-REQ-GOAL-002` is met by having a clean, well-defined TS configuration that prevents common pitfalls.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm exec tsc --build` from the root and ensure it completes without errors (assuming minimal src files).
- [ ] Run `bash tests/infrastructure/verify_typescript_strict.sh`.

## 5. Update Documentation
- [ ] Update `docs/infrastructure/typescript_standard.md` with the strictness requirements and instructions on how to extend the base config.

## 6. Automated Verification
- [ ] Run a small script to parse all `tsconfig.json` files and verify `"strict": true` is present in the root and correctly inherited (or not overridden).
