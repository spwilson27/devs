# Project Directory Structure

This document describes the top-level directory structure of the `devs` project
and the role of each directory. It is authoritative — the layout here reflects
requirements [TAS-040], [TAS-104], and [TAS-061].

## Root Layout

```
devs/
├── .agent/          # Agent-oriented documentation and long-term memory
├── .devs/           # Flight Recorder: runtime observability state (SQLite, LanceDB)
├── docs/            # Human and agent documentation
├── mcp-server/      # MCP interface for external AI tool access
├── packages/        # pnpm monorepo packages (@devs/* scoped)
├── scripts/         # Administrative and utility scripts
├── src/             # Root-level source entry points (if applicable)
└── tests/           # Project-wide integration and infrastructure tests
```

## Directory Descriptions

### `.agent/`
Agent-oriented documentation. Contains `memory.md` — the shared long-term
memory file read and written by all AI Developer Agents. This directory stores
medium-term (phase) and long-term (project-wide) architectural decisions,
conventions, and constraints.

**Owner:** AI orchestration layer. **Not** a runtime directory.

### `.devs/` — Flight Recorder
The Flight Recorder directory stores all runtime observability data generated
during the `devs` execution pipeline. This includes:

- **SQLite databases** (`@devs/memory`): Task execution state, agent decision
  log, loop-detection counters, checkpoint snapshots.
- **LanceDB indexes** (`@devs/memory`): Semantic vector memory for agent context
  retrieval and past-decision lookup.
- **Execution traces** (gitignored): Structured logs from agent task runs.

**Access policy:** See `.devs/POLICY.md`. Developer Agents have no direct write
access to this directory. All state mutations flow through the `@devs/core` and
`@devs/memory` package APIs.

**VCS:** Runtime state is gitignored via `.devs/.gitignore`. Only `POLICY.md`
and `.gitignore` itself are committed.

### `docs/`
Project documentation organized by audience and topic:

```
docs/
├── architecture/    # System design documents (this file lives here)
├── infrastructure/  # Setup and tooling docs (monorepo, CI, etc.)
└── plan/            # Planning artifacts (PRD, TAS, requirements, tasks)
```

### `mcp-server/`
The Model Context Protocol (MCP) server package that exposes `devs` internals
as AI tool interfaces. External AI agents (including Developer Agents) call
MCP tool endpoints to query flight recorder state, inspect running tasks, and
retrieve debug/profile information.

**Package:** `@devs/mcp` (symlinked from `packages/mcp`). The `mcp-server/`
root directory provides the standalone server entry point and configuration.

### `packages/`
pnpm monorepo workspace containing all `@devs/*` scoped packages:

| Package            | Role                                                        |
|--------------------|-------------------------------------------------------------|
| `@devs/core`       | Business logic, pipeline orchestration (no UI, no sandbox) |
| `@devs/agents`     | Agent runners, prompts, and tool-call wrappers              |
| `@devs/sandbox`    | Isolated execution environment for generated code          |
| `@devs/memory`     | SQLite + LanceDB persistence layer (Flight Recorder owner)  |
| `@devs/mcp`        | MCP server implementation                                   |
| `@devs/cli`        | CLI shell (delegates all logic to `@devs/core`)             |
| `@devs/vscode`     | VSCode Extension shell (delegates all logic to `@devs/core`)|

Dependency rules enforced by `tests/infrastructure/verify_monorepo.sh`:
- `@devs/core` MUST NOT depend on `@devs/sandbox` (TAS-096).

### `scripts/`
Administrative scripts for project maintenance, CI helpers, and tooling
utilities. Not part of the distributed packages. Examples: migration scripts,
release helpers, environment bootstrap scripts.

### `src/`
Root-level source directory reserved for top-level entry points that do not
belong to a specific `packages/*` package. In Phase 1 this directory is empty
(scaffold only). Future phases may place a top-level orchestrator entry point
here if it does not fit cleanly into a monorepo package.

### `tests/`
Project-wide tests that span multiple packages or verify infrastructure:

```
tests/
└── infrastructure/
    ├── verify_monorepo.sh         # pnpm monorepo structure and env checks
    └── verify_folder_structure.sh # Root directory structure checks (this task)
```

Integration tests for the full pipeline will be added in later phases.
