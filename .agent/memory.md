# Agent Long-Term Memory

This file serves as a shared, long-term memory for all agents working on this project. Agents should append to this document to record important architectural decisions, recurring issues, project-wide conventions, and any other crucial context that future tasks will benefit from.

## 🏛️ Architectural Decisions
*Note overarching design choices, patterns, or project-wide conventions here.*

- **2026-02-20 - Initial Setup:** Started long-term memory to ensure agents pass architectural messages to one another. Agents should actively review and append to this doc when making meaningful structural changes.

- **2026-02-21 - pnpm Monorepo Structure (Phase 1, Task 01):** Established the pnpm v9+ monorepo with 7 packages under `packages/` scoped as `@devs/<name>`. Packages: `core`, `agents`, `sandbox`, `memory`, `mcp`, `cli`, `vscode`. Node.js >= 22 enforced via `.nvmrc` and root `package.json` `engines` field. `shamefully-hoist=false` enforced in `.npmrc` to prevent phantom dependencies.

- **2026-02-21 - TAS-096 Module Separation (Phase 1, Task 01):** `@devs/core` must NEVER depend on `@devs/sandbox`. This is a hard constraint enforced by the verification test (`tests/infrastructure/verify_monorepo.sh`). `@devs/sandbox` is strictly isolated. `@devs/core` has no workspace dependencies (only external libs). Consumers of `@devs/core`: `agents`, `mcp`, `cli`, `vscode`.

- **2026-02-21 - Headless-First Design (Phase 1, Task 01):** `@devs/cli` and `@devs/vscode` are UI shells only — all business logic must live in `@devs/core`. This separation is intentional and must be maintained through all future phases.

- **2026-02-21 - `./do` Script Pattern:** The `./do` Python script is the project task runner. In Phase 1, `fmt`, `lint`, `build`, and `coverage` steps are stubs (no source files yet). `./do test` executes both `verify_monorepo.sh` and `verify_folder_structure.sh`. Future phases must configure real tools (TypeScript compiler, ESLint, Prettier, Vitest) in `./do`.

- **2026-02-21 - Root Directory Structure (Phase 1, Task 03):** Eight required top-level directories: `.devs/` (Flight Recorder/observability), `.agent/` (agent docs/memory), `mcp-server/` (MCP server entry), `src/` (root entry points), `tests/` (infra + integration tests), `docs/` (documentation), `scripts/` (admin scripts), `packages/` (monorepo packages). Authoritative description at `docs/architecture/directory_structure.md`.

- **2026-02-21 - Flight Recorder Design (Phase 1, Task 03):** `.devs/` is the Flight Recorder. SQLite (via `better-sqlite3`) and LanceDB (via `vectordb`) runtime state managed exclusively by `@devs/core` and `@devs/memory`. Developer Agents have NO write access to `.devs/` — prevents state tampering and loop-counter manipulation. Runtime files are gitignored via `.devs/.gitignore`; only `POLICY.md` and `.gitignore` are tracked in VCS.

---

## ⚠️ Brittle Areas (Proceed with Caution)
*Note parts of the codebase that are prone to breaking, have complex undocumented dependencies, or should generally not be refactored without extreme care.*

- **pnpm-workspace.yaml package list:** Adding or renaming packages requires updating both `pnpm-workspace.yaml` AND `tests/infrastructure/verify_monorepo.sh` (the `REQUIRED_PKGS` array). Failure to do both will cause the infrastructure test to fail.

- **`.devs/` is gitignored at runtime:** Only `POLICY.md` and `.gitignore` inside `.devs/` are committed. All SQLite/LanceDB/log files are excluded. Do not add `.devs/` to the root `.gitignore` — only the runtime subdirs inside it are excluded via `.devs/.gitignore`.

- **Empty scaffold directories need `.gitkeep`:** `mcp-server/` and `src/` are scaffold-only (no source yet). Git does not track empty directories — always add a `.gitkeep` file to any new empty directory that must be present on fresh checkout. Forgetting this will cause `verify_folder_structure.sh` to fail in CI on a clean clone.

---

## 📝 Recent Changelog
*Append brief summaries of recent agent or user tasks here to keep everyone in sync.*

- **[2026-02-20] - Task Name / ID:** Brief description of changes made. (Template)

- **[2026-02-21] - Phase 1 / 01_setup_pnpm_monorepo:** Verified and confirmed complete pnpm monorepo setup. All 30 verification checks pass. Structure: root `package.json` (private, engines node>=22), `.nvmrc` (22), `.npmrc` (shamefully-hoist=false), `pnpm-workspace.yaml` (7 packages), individual `package.json` per package with `@devs/<name>` scoping, `tests/infrastructure/verify_monorepo.sh`, `README.md`, `docs/infrastructure/monorepo_setup.md`, and `./do` task runner. `pnpm install` resolves workspace links correctly.

- **[2026-02-21] - Phase 1 / 03_setup_project_directories:** Established root directory scaffold: `.devs/` (Flight Recorder), `mcp-server/`, `src/`. `.devs/.gitignore` excludes runtime state (SQLite, LanceDB, logs). `.devs/POLICY.md` documents Developer Agent write-access prohibition. `docs/architecture/directory_structure.md` documents all top-level directory roles. `./do test` now runs both `verify_monorepo.sh` (30 checks) and `verify_folder_structure.sh` (11 checks). All 41 checks pass. Reviewer fixed: added `.gitkeep` to `mcp-server/` and `src/` so empty scaffold directories are tracked by git and present on fresh clone.

