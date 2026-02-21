# Task: Configure TypeScript 5.4+ with Strict Mode (Sub-Epic: 01_Core TypeScript Configuration)

## Covered Requirements
- [TAS-005]

## 1. Initial Test Written
- [ ] Write a Jest test (`src/__tests__/tsconfig.test.ts`) that:
  - Reads `tsconfig.json` from the project root and asserts `compilerOptions.strict` is `true`.
  - Asserts `compilerOptions.target` is `"ES2022"` or later.
  - Asserts `compilerOptions.module` is `"NodeNext"` or `"ESNext"`.
  - Asserts `compilerOptions.moduleResolution` is `"NodeNext"` or `"Bundler"`.
  - Asserts `compilerOptions.exactOptionalPropertyTypes` is `true`.
  - Asserts `compilerOptions.noUncheckedIndexedAccess` is `true`.
  - Asserts `compilerOptions.noImplicitOverride` is `true`.
  - Asserts `compilerOptions.useUnknownInCatchVariables` is `true`.
- [ ] Write a shell-based integration test (or use `execa` in Jest) that:
  - Runs `tsc --noEmit` on the workspace root and asserts exit code is `0` (no type errors in the baseline).
  - Introduces a deliberate type error in a temp file and asserts `tsc --noEmit` exits non-zero, proving strict mode is enforced.

## 2. Task Implementation
- [ ] Install TypeScript 5.4+ as a dev dependency in the root workspace:
  ```bash
  pnpm add -D typescript@^5.4.0 -w
  ```
- [ ] Create or update the root `tsconfig.json` with the following `compilerOptions`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "lib": ["ES2022"],
      "outDir": "dist",
      "rootDir": "src",
      "strict": true,
      "exactOptionalPropertyTypes": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitOverride": true,
      "useUnknownInCatchVariables": true,
      "forceConsistentCasingInFileNames": true,
      "skipLibCheck": false,
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true,
      "esModuleInterop": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "**/*.test.ts"]
  }
  ```
- [ ] Create a `tsconfig.build.json` (extends root) that excludes test files, used for production builds.
- [ ] Create a `tsconfig.test.json` (extends root) that includes test files and sets `"outDir": "dist-test"`.
- [ ] Add a `"build:typecheck"` script to the root `package.json`:
  ```json
  "typecheck": "tsc --noEmit -p tsconfig.json"
  ```
- [ ] Ensure every existing `.ts` source file under `src/` compiles without errors under the new strict config; fix any pre-existing type errors surfaced by the stricter settings.

## 3. Code Review
- [ ] Verify `tsconfig.json` does NOT contain any `// @ts-ignore` suppressions or `"skipLibCheck": true` that would mask strict-mode violations.
- [ ] Confirm that `strict: true` is the top-level flag (not a subset of individual flags), meaning all sub-flags (`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `alwaysStrict`) are implicitly enabled.
- [ ] Confirm `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are explicitly set (they are NOT covered by `strict: true`).
- [ ] Ensure no workspace package overrides the root tsconfig in a way that weakens strict settings.
- [ ] Verify the `typecheck` script is wired into the CI pipeline (e.g., referenced in `.github/workflows/ci.yml` or equivalent).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for tsconfig structure:
  ```bash
  pnpm test -- --testPathPattern="tsconfig.test"
  ```
- [ ] Run the full typecheck:
  ```bash
  pnpm typecheck
  ```
- [ ] Confirm both commands exit with code `0`.

## 5. Update Documentation
- [ ] Update `src/tsconfig.agent.md` (create if absent) with a section:
  - Document that TypeScript 5.4+ strict mode is mandatory.
  - List all enabled extra-strict flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`).
  - Explain the rationale: compile-time safety prevents an entire class of runtime bugs in long-running agentic loops.
- [ ] Update the root `README.md` "Development Prerequisites" section to list `TypeScript ^5.4` as a required toolchain version.

## 6. Automated Verification
- [ ] Add a CI step that runs `pnpm typecheck` and fails the pipeline on non-zero exit:
  ```yaml
  - name: Typecheck
    run: pnpm typecheck
  ```
- [ ] Add a separate CI validation script `scripts/validate-tsconfig.ts` (or `.js`) that:
  - Parses `tsconfig.json` programmatically.
  - Asserts `strict === true`, `exactOptionalPropertyTypes === true`, `noUncheckedIndexedAccess === true`.
  - Exits non-zero with a descriptive error message if any assertion fails.
  - Is referenced in the `validate-all` script required by `[2_TAS-REQ-014]`.
