# Agent Long-Term Memory

This file serves as a shared, long-term memory for all agents working on this project. Agents should append to this document to record important architectural decisions, recurring issues, project-wide conventions, and any other crucial context that future tasks will benefit from.

## 🏛️ Architectural Decisions
*Note overarching design choices, patterns, or project-wide conventions here.*

- **2026-02-20 - Initial Setup:** Started long-term memory to ensure agents pass architectural messages to one another. Agents should actively review and append to this doc when making meaningful structural changes.

- **2026-02-21 - pnpm Monorepo Structure (Phase 1, Task 01):** Established the pnpm v9+ monorepo with 7 packages under `packages/` scoped as `@devs/<name>`. Packages: `core`, `agents`, `sandbox`, `memory`, `mcp`, `cli`, `vscode`. Node.js >= 22 enforced via `.nvmrc` and root `package.json` `engines` field. `shamefully-hoist=false` enforced in `.npmrc` to prevent phantom dependencies.

- **2026-02-21 - TAS-096 Module Separation (Phase 1, Task 01):** `@devs/core` must NEVER depend on `@devs/sandbox`. This is a hard constraint enforced by the verification test (`tests/infrastructure/verify_monorepo.sh`). `@devs/sandbox` is strictly isolated. `@devs/core` has no workspace dependencies (only external libs). Consumers of `@devs/core`: `agents`, `mcp`, `cli`, `vscode`.

- **2026-02-21 - Headless-First Design (Phase 1, Task 01):** `@devs/cli` and `@devs/vscode` are UI shells only — all business logic must live in `@devs/core`. This separation is intentional and must be maintained through all future phases.

- **2026-02-21 - `./do` Script Pattern:** The `./do` Python script is the project task runner. In Phase 1, `fmt`, `lint`, `build`, and `coverage` steps are stubs (no source files yet). `./do test` executes `bash tests/infrastructure/verify_monorepo.sh`. Future phases must configure real tools (TypeScript compiler, ESLint, Prettier, Vitest) in `./do`.

---

## ⚠️ Brittle Areas (Proceed with Caution)
*Note parts of the codebase that are prone to breaking, have complex undocumented dependencies, or should generally not be refactored without extreme care.*

- *(No brittle areas identified yet.)*

---

## 📝 Recent Changelog
*Append brief summaries of recent agent or user tasks here to keep everyone in sync.*

- **[2026-02-20] - Task Name / ID:** Brief description of changes made. (Template)

- **[2026-02-21] - Phase 1 / 01_setup_pnpm_monorepo:** Verified and confirmed complete pnpm monorepo setup. All 30 verification checks pass. Structure: root `package.json` (private, engines node>=22), `.nvmrc` (22), `.npmrc` (shamefully-hoist=false), `pnpm-workspace.yaml` (7 packages), individual `package.json` per package with `@devs/<name>` scoping, `tests/infrastructure/verify_monorepo.sh`, `README.md`, `docs/infrastructure/monorepo_setup.md`, and `./do` task runner. `pnpm install` resolves workspace links correctly.



