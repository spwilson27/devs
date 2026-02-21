# Task: Create .agent/ AOD Directory & Initial Sandbox Documentation (Sub-Epic: 01_Module Foundation & Directory Structure)

## Covered Requirements
- [TAS-042]

## 1. Initial Test Written
- [ ] Create `packages/sandbox/tests/unit/aod-structure.test.ts` that uses Node.js `fs` to assert:
  - `packages/sandbox/.agent/` directory exists.
  - `packages/sandbox/.agent/CONTEXT.md` exists and is non-empty.
  - `packages/sandbox/.agent/DECISIONS.md` exists and is non-empty.
  - `packages/sandbox/.agent/CONSTRAINTS.md` exists and is non-empty.
  - `packages/sandbox/.agent/DEPENDENCIES.md` exists and is non-empty.
  - `packages/sandbox/.agent/PROGRESS.md` exists and is non-empty.
- [ ] Assert that each AOD file contains the section headings defined in the TAS AOD spec (at minimum the file must contain a `#` heading and at least one `##` sub-heading).

## 2. Task Implementation
- [ ] Create `packages/sandbox/.agent/CONTEXT.md` documenting:
  - **Module purpose**: `@devs/sandbox` provides an isolated execution abstraction for shell commands and file I/O, used by the devs orchestration engine to run agent tasks in a sandboxed environment.
  - **Phase context**: This module is the foundation for Phase 2 (Sandbox Isolation & Secret Redaction).
  - **Public surface**: `SandboxProvider` abstract class, `SandboxExecResult`, `SandboxProvisionOptions` types.
  - **Integration points**: `@devs/core` for orchestration events; `@devs/mcp` for tool-call routing.
- [ ] Create `packages/sandbox/.agent/DECISIONS.md` documenting initial architectural decisions:
  - **Decision 001**: Use the Strategy pattern for `SandboxProvider` to allow interchangeable `DockerDriver` and `WebContainerDriver` without coupling orchestration logic to container technology.
  - **Decision 002**: The `src/types/index.ts` barrel is the single source of truth for all cross-cutting interfaces; no driver may define its own divergent types.
  - **Decision 003**: `FilesystemManager` will exclude `.git/` and `.devs/` directories from any sandbox sync operation to prevent host environment contamination.
- [ ] Create `packages/sandbox/.agent/CONSTRAINTS.md` documenting hard constraints:
  - Must not bundle Docker SDK at the package level; drivers inject it via dependency injection.
  - Must not expose host filesystem paths outside the designated `workdir`.
  - All exported functions must be pure or side-effect free at the `src/utils/` level.
  - TypeScript `strict` mode must never be disabled.
  - Coverage threshold must be maintained at ≥80% lines.
- [ ] Create `packages/sandbox/.agent/DEPENDENCIES.md` listing:
  - **Upstream**: `@devs/core` (workspace:*) for shared event types and orchestration primitives.
  - **Downstream consumers**: `@devs/agents` uses sandbox to execute code; `@devs/mcp` uses sandbox for tool call proxying.
  - **External (future, driver-level only)**: `dockerode` (DockerDriver), `@webcontainer/api` (WebContainerDriver).
- [ ] Create `packages/sandbox/.agent/PROGRESS.md` with an initial status block:
  ```markdown
  # Progress Tracker

  ## Phase 2 — Sub-Epic 01: Module Foundation & Directory Structure
  - [x] Package initialized (`package.json`, `tsconfig.json`)
  - [x] `src/` directory structure created
  - [x] `tests/` directory structure created
  - [x] `.agent/` AOD directory populated
  - [ ] `bootstrap-sandbox` script implemented
  - [ ] `validate-all` script implemented
  ```
- [ ] Ensure `.agent/` is listed in the root `.gitignore` exclusion exceptions (i.e., `.agent/` should NOT be gitignored — it is intentional project documentation).

## 3. Code Review
- [ ] Verify all `.agent/*.md` files use consistent heading hierarchy (`#` for title, `##` for sections, `###` for sub-items).
- [ ] Confirm `CONTEXT.md` accurately reflects the module's role as described in `TAS-099` (isolated execution abstraction for shell commands and file I/O).
- [ ] Confirm `DECISIONS.md` decisions are numbered, immutable entries — decisions are never deleted, only superseded.
- [ ] Confirm `CONSTRAINTS.md` does not contradict any requirement listed in `phase_2.md`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test --project unit -- --reporter=verbose` and confirm `aod-structure.test.ts` passes all assertions.

## 5. Update Documentation
- [ ] Add a `.agent/` section to `packages/sandbox/README.md` explaining:
  - What Agent-Oriented Documentation (AOD) is.
  - Which file serves which purpose (CONTEXT, DECISIONS, CONSTRAINTS, DEPENDENCIES, PROGRESS).
  - Instructions for AI agents on how to update AOD files during task execution.
- [ ] Update the root-level `docs/architecture/aod_conventions.md` (if it exists) to reference `packages/sandbox/.agent/` as a live example of the AOD pattern.

## 6. Automated Verification
- [ ] Run the following assertion script from the monorepo root:
  ```bash
  node -e "
  const fs = require('fs');
  const files = [
    'packages/sandbox/.agent/CONTEXT.md',
    'packages/sandbox/.agent/DECISIONS.md',
    'packages/sandbox/.agent/CONSTRAINTS.md',
    'packages/sandbox/.agent/DEPENDENCIES.md',
    'packages/sandbox/.agent/PROGRESS.md',
  ];
  files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (!content.includes('#')) throw new Error('No heading in: ' + f);
    if (content.trim().length < 50) throw new Error('Too short: ' + f);
  });
  console.log('AOD structure OK');
  "
  ```
  and verify exit code is 0.
