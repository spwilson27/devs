# Task: Initialize pnpm Monorepo & Node.js Environment (Sub-Epic: 01_Project Infrastructure & Monorepo Setup)

## Covered Requirements
- [TAS-060], [TAS-006], [TAS-096]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/infrastructure/verify_monorepo.sh` that checks:
  - Node.js version is 22.x.
  - `pnpm` version is 9.x.
  - `pnpm-workspace.yaml` exists and defines the core modules: `core`, `agents`, `sandbox`, `memory`, `mcp`, `cli`, `vscode`.
  - Each module directory exists under a `packages/` or similar structure as defined in the TAS.

## 2. Task Implementation
- [ ] Create `.nvmrc` with content `22`.
- [ ] Create `.npmrc` with `shamefully-hoist=false` and other monorepo-friendly settings.
- [ ] Initialize root `package.json` with `private: true` and `engines: { "node": ">=22" }`.
- [ ] Create `pnpm-workspace.yaml` with the following packages:
  - `packages/core`
  - `packages/agents`
  - `packages/sandbox`
  - `packages/memory`
  - `packages/mcp`
  - `packages/cli`
  - `packages/vscode`
- [ ] Initialize each package with a minimal `package.json` following the naming convention `@devs/<pkg_name>`.
- [ ] Ensure `headless-first` design by separating package logic from UI (VSCode) or TUI (CLI).

## 3. Code Review
- [ ] Verify that there are no circular dependencies between package definitions in `pnpm-workspace.yaml`.
- [ ] Ensure `TAS-096` module separation is respected (no logic leakage between `core` and `sandbox` at this stage).
- [ ] Confirm `package.json` files use consistent versioning.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/infrastructure/verify_monorepo.sh`.
- [ ] Run `pnpm install` to ensure workspace resolution works correctly.

## 5. Update Documentation
- [ ] Create a root `README.md` documenting the monorepo structure and the purpose of each package.
- [ ] Create `docs/infrastructure/monorepo_setup.md` detailing the Node.js and pnpm requirements.

## 6. Automated Verification
- [ ] Execute `node -v` and `pnpm --version` in a clean environment to verify compliance.
- [ ] Run `pnpm m -r exec ls` to verify all packages are recognized by the workspace.
